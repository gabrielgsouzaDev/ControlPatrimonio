
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
  codeId: z.string().min(1, 'Código ID é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  city: z.string().min(1, 'Cidade/Local é obrigatório'),
  value: z.coerce.number({invalid_type_error: "Valor deve ser um número"}).positive('Valor deve ser um número positivo'),
  observation: z.string().optional().default(''),
});

export async function importAssetsFromCsv(csvContent: string, userId: string, userDisplayName: string) {
  const { firestore } = await initializeFirebase();
  
  if (!userId || !userDisplayName) {
    throw new Error('Usuário não autenticado.');
  }

  const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  
  if (parseResult.errors.length > 0) {
      throw new Error(`Erro ao analisar CSV: ${parseResult.errors[0].message}`);
  }

  const rows = parseResult.data as any[];
  
  const categoriesSnapshot = await firestore.collection('categories').get();
  const categoryMap = new Map(categoriesSnapshot.docs.map(doc => [doc.data().name.trim().toLowerCase(), doc.id]));

  const locationsSnapshot = await firestore.collection('locations').get();
  const locationMap = new Map(locationsSnapshot.docs.map(doc => [doc.data().name.trim().toLowerCase(), doc.id]));
  
  const assetsToCreate: any[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Normalize keys (headers) and trim values
    const normalizedRow: {[key: string]: string} = {};
    for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            normalizedRow[key.trim().toLowerCase()] = row[key]?.trim() || '';
        }
    }
    
    const categoryName = normalizedRow.categoryid;
    const cityName = normalizedRow.city;

    const categoryId = categoryName ? categoryMap.get(categoryName.toLowerCase()) : undefined;
    const cityId = cityName ? locationMap.get(cityName.toLowerCase()) : undefined;

    const rowForValidation = {
      name: normalizedRow.name,
      codeId: normalizedRow.codeid,
      value: normalizedRow.value,
      observation: normalizedRow.observation,
      categoryId: categoryId, 
      city: cityId,
    };
    
    const validation = assetImportSchema.safeParse(rowForValidation);
    
    let rowIsValid = true;

    if (!categoryId) {
      errors.push(`Linha ${i + 2}: Categoria '${categoryName || ""}' não encontrada.`);
      rowIsValid = false;
    }
    if (!cityId) {
      errors.push(`Linha ${i + 2}: Local '${cityName || ""}' não encontrado.`);
      rowIsValid = false;
    }

    if (validation.success && rowIsValid) {
      assetsToCreate.push(validation.data);
    } else if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => `Linha ${i + 2}: ${e.message} no campo '${e.path[0]}'.`).join(' ');
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
