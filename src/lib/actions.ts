
'use server';

import { z } from 'zod';
import type { Asset, AssetFormValues, HistoryLog } from './types';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { initializeFirebase } from '@/firebase/server';
import Papa from 'papaparse';
import { Timestamp } from 'firebase-admin/firestore';

const CSV_HEADERS = ['Nome', 'Codigo ID', 'Categoria', 'Cidade/Local', 'Valor', 'Observacao'];

export async function exportAssetsToCsv(assets: Asset[]): Promise<string> {
  if (!assets.length) {
    return '';
  }

  const rows = assets.map(asset => 
    [
      `"${asset.name.replace(/"/g, '""')}"`,
      asset.codeId,
      asset.category || "N/A",
      asset.city,
      asset.value,
      `"${(asset.observation || '').replace(/"/g, '""')}"`,
    ].join(',')
  );

  return [CSV_HEADERS.join(','), ...rows].join('\n');
}

export async function exportHistoryToCsv(history: HistoryLog[]): Promise<string> {
    if (!history.length) {
        return '';
    }

    const headers = ['ID', 'Item', 'Código ID', 'Ação', 'Usuário', 'Data e Hora', 'Detalhes'];
    const rows = history.map(log => 
        [
            log.id,
            `"${log.assetName.replace(/"/g, '""')}"`,
            log.codeId,
            log.action,
            log.userDisplayName,
            log.timestamp instanceof Date ? format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : format(new Date(log.timestamp.seconds * 1000), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
            `"${(log.details || '').replace(/"/g, '""')}"`
        ].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}

export async function exportDashboardToCsv(
  barChartData: { name: string; value: number }[],
  pieChartData: { name: string; value: number }[]
): Promise<string> {
  let csvString = '';

  csvString += 'Valor por Cidade\n';
  csvString += 'Cidade,Valor\n';
  barChartData.forEach(item => {
    csvString += `"${item.name}",${item.value}\n`;
  });

  csvString += '\n';

  csvString += 'Distribuição por Categoria\n';
  csvString += 'Categoria,Valor\n';
  pieChartData.forEach(item => {
    csvString += `"${item.name}",${item.value}\n`;
  });

  return csvString;
}

const assetImportSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  codeId: z.string().min(1, 'Codigo ID é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  city: z.string().min(1, 'Cidade/Local é obrigatório'),
  value: z.coerce.number({invalid_type_error: "Valor deve ser um número"}).positive('Valor deve ser um número positivo'),
  observation: z.string().optional().default(''),
});


export async function addAssetsInBatch(
    firestore: FirebaseFirestore.Firestore,
    userId: string,
    userDisplayName: string,
    assetsData: AssetFormValues[]
) {
    const batch = firestore.batch();
    const now = Timestamp.now(); 

    assetsData.forEach((assetData) => {
        const assetRef = firestore.collection('assets').doc();
        const assetPayload = {
            ...assetData,
            userId,
            createdAt: now,
            updatedAt: now,
            status: 'ativo' as const,
        };
        batch.set(assetRef, assetPayload);

        const historyRef = firestore.collection('history').doc();
        const historyLog = {
            assetId: assetRef.id,
            assetName: assetData.name,
            codeId: assetData.codeId,
            action: "Criado" as const,
            details: "Item importado via CSV.",
            userId: userId,
            userDisplayName: userDisplayName,
            timestamp: now,
        };
        batch.set(historyRef, historyLog);
    });

    return batch.commit();
}


export async function importAssetsFromCsv(csvContent: string, userId: string, userDisplayName: string) {
  const { firestore } = await initializeFirebase();
  
  if (!userId || !userDisplayName) {
    throw new Error('Usuário não autenticado.');
  }

  const parseResult = Papa.parse(csvContent, { 
    header: true, 
    skipEmptyLines: true,
    trimHeaders: true, // Remove espaços extras dos cabeçalhos
    dynamicTyping: true, // Ajuda na detecção automática de tipos e delimitadores
    transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '').replace('/', ''), // Normaliza os cabeçalhos
  });
  
  if (parseResult.errors.length > 0) {
      throw new Error(`Erro ao analisar CSV: ${parseResult.errors[0].message}`);
  }

  const rows = parseResult.data as any[];
  
  const categoriesSnapshot = await firestore.collection('categories').get();
  const categoryMap = new Map(categoriesSnapshot.docs.map(doc => [doc.data().name.trim().toLowerCase(), doc.id]));

  const locationsSnapshot = await firestore.collection('locations').get();
  const locationMap = new Map(locationsSnapshot.docs.map(doc => [doc.data().name.trim().toLowerCase(), doc.id]));
  
  const assetsToCreate: AssetFormValues[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const currentLine = i + 2;

    const normalizedRow: Record<string, any> = {};
    for (const key in row) {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '').replace('/', '');
      normalizedRow[normalizedKey] = row[key];
    }
    
    const categoryName = normalizedRow.categoria;
    const cityName = normalizedRow.cidadelocal;
    const codeId = normalizedRow.codigoid;
    const name = normalizedRow.nome;
    const value = normalizedRow.valor;
    const observation = normalizedRow.observacao;

    const categoryId = categoryName ? categoryMap.get(String(categoryName).trim().toLowerCase()) : undefined;
    const cityId = cityName ? locationMap.get(String(cityName).trim().toLowerCase()) : undefined;

    const rowForValidation = {
      name: name,
      codeId: codeId,
      value: value,
      observation: observation,
      categoryId: categoryId, 
      city: cityId,
    };
    
    const validation = assetImportSchema.safeParse(rowForValidation);
    
    let rowIsValid = true;
    if (!categoryId && categoryName) {
      errors.push(`Linha ${currentLine}: Categoria '${categoryName}' não encontrada.`);
      rowIsValid = false;
    }
    if (!cityId && cityName) {
      errors.push(`Linha ${currentLine}: Local '${cityName}' não encontrado.`);
      rowIsValid = false;
    }

    if (validation.success && rowIsValid) {
      assetsToCreate.push(validation.data);
    } else if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => `Linha ${currentLine}: ${e.message} no campo '${e.path[0]}'.`).join(' ');
        errors.push(errorMessages);
    }
  }

  if (assetsToCreate.length > 0) {
      await addAssetsInBatch(firestore, userId, userDisplayName, assetsToCreate);
  }

  return {
    success: assetsToCreate.length,
    failed: rows.length - assetsToCreate.length,
    errors: errors.slice(0, 10), // Limit to 10 errors to not overload the UI
  };
}

export async function deactivateAssetsInBatch(assetIds: string[], userId: string, userDisplayName: string) {
    const { firestore } = await initializeFirebase();
    const batch = firestore.batch();
    const now = Timestamp.now();

    const assetsRef = firestore.collection('assets');
    const assetsToUpdate = await assetsRef.where('__name__', 'in', assetIds).get();

    assetsToUpdate.forEach(doc => {
        batch.update(doc.ref, { status: 'inativo', updatedAt: now });

        const historyRef = firestore.collection('history').doc();
        batch.set(historyRef, {
            assetId: doc.id,
            assetName: doc.data().name,
            codeId: doc.data().codeId,
            action: "Desativado",
            details: "Item foi movido para a lixeira em lote.",
            userId,
            userDisplayName,
            timestamp: now,
        });
    });

    await batch.commit();
    return assetsToUpdate.size;
}

export async function reactivateAssetsInBatch(assetIds: string[], userId: string, userDisplayName: string) {
    const { firestore } = await initializeFirebase();
    const batch = firestore.batch();
    const now = Timestamp.now();

    const assetsRef = firestore.collection('assets');
    const assetsToUpdate = await assetsRef.where('__name__', 'in', assetIds).get();

    assetsToUpdate.forEach(doc => {
        batch.update(doc.ref, { status: 'ativo', updatedAt: now });

        const historyRef = firestore.collection('history').doc();
        batch.set(historyRef, {
            assetId: doc.id,
            assetName: doc.data().name,
            codeId: doc.data().codeId,
            action: "Reativado",
            details: "Item foi restaurado da lixeira em lote.",
            userId,
            userDisplayName,
            timestamp: now,
        });
    });

    await batch.commit();
    return assetsToUpdate.size;
}
