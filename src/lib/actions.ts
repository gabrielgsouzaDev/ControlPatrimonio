
'use server';

import { z } from 'zod';
import type { Asset, Category, HistoryLog, Location } from './types';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { initializeFirebase } from '@/firebase/server';
import { addAssetsInBatch } from './mutations';
import Papa from 'papaparse';

export async function exportAssetsToCsv(assets: Asset[]): Promise<string> {
  if (!assets.length) {
    return '';
  }

  const headers = ['ID', 'Nome', 'Código ID', 'Categoria', 'Cidade/Local', 'Valor', 'Observação', 'Status'];
  const rows = assets.map(asset => 
    [
      asset.id,
      `"${asset.name.replace(/"/g, '""')}"`,
      asset.codeId,
      asset.category || "N/A",
      asset.city,
      asset.value,
      `"${(asset.observation || '').replace(/"/g, '""')}"`,
      asset.status,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
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
  codeid: z.string().min(1, 'Código ID é obrigatório'),
  categoryid: z.string().min(1, 'Categoria é obrigatória'),
  city: z.string().min(1, 'Cidade/Local é obrigatório'),
  value: z.coerce.number({invalid_type_error: "Valor deve ser um número"}).positive('Valor deve ser um número positivo'),
  observation: z.string().optional().default(''),
});

export async function importAssetsFromCsv(csvContent: string, userId: string, userDisplayName: string) {
  const { firestore } = await initializeFirebase();
  
  if (!userId || !userDisplayName) {
    throw new Error('Usuário não autenticado.');
  }

  const parseResult = Papa.parse(csvContent, { 
    header: true, 
    skipEmptyLines: true,
    transformHeader: header => header.trim().toLowerCase(), // Normalize headers
  });
  
  if (parseResult.errors.length > 0) {
      throw new Error(`Erro ao analisar CSV: ${parseResult.errors[0].message}`);
  }

  const rows = parseResult.data as any[];
  
  const categoriesSnapshot = await firestore.collection('categories').get();
  const categoryMap = new Map(categoriesSnapshot.docs.map(doc => [doc.data().name.trim().toLowerCase(), doc.id]));

  const locationsSnapshot = await firestore.collection('locations').get();
  const locationMap = new Map(locationsSnapshot.docs.map(doc => [doc.data().name.trim().toLowerCase(), doc.id]));
  
  const assetsToCreate: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'status'>[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    const categoryName = row.categoryid || row.categoria;
    const cityName = row.city || row.cidade;

    const categoryId = categoryName ? categoryMap.get(categoryName.trim().toLowerCase()) : undefined;
    const cityId = cityName ? locationMap.get(cityName.trim().toLowerCase()) : undefined;

    const rowForValidation = {
      name: row.name || row.nome,
      codeid: row.codeid,
      value: row.value || row.valor,
      observation: row.observation || row.observacao,
      categoryid: categoryId, 
      city: cityId,
    };
    
    const validation = assetImportSchema.safeParse(rowForValidation);
    
    let rowIsValid = true;
    const currentLine = i + 2;

    if (!categoryId && categoryName) {
      errors.push(`Linha ${currentLine}: Categoria '${categoryName}' não encontrada.`);
      rowIsValid = false;
    }
    if (!cityId && cityName) {
      errors.push(`Linha ${currentLine}: Local '${cityName}' não encontrado.`);
      rowIsValid = false;
    }

    if (validation.success && rowIsValid) {
      // Re-map validated data to match the addAssetsInBatch expectation
      assetsToCreate.push({
          name: validation.data.name,
          codeId: validation.data.codeid,
          categoryId: validation.data.categoryid,
          city: validation.data.city,
          value: validation.data.value,
          observation: validation.data.observation
      });
    } else if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => `Linha ${currentLine}: ${e.message} no campo '${e.path[0]}'.`).join(' ');
        errors.push(errorMessages);
    }
  }

  if (assetsToCreate.length > 0) {
      await addAssetsInBatch(firestore, userId, userDisplayName, assetsToCreate as AssetFormValues[]);
  }

  return {
    success: assetsToCreate.length,
    failed: rows.length - assetsToCreate.length,
    errors: errors.slice(0, 10), // Limit to 10 errors to not overload the UI
  };
}
