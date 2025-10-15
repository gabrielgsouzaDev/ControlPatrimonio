
'use server';

import { z } from 'zod';
import type { Asset, Category, HistoryLog, Location } from './types';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// This file is now for server-side actions that do not depend on user context from the client,
// like AI operations or data exports based on provided data.

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
  barChartData: { city: string; value: number }[],
  pieChartData: { category: string; value: number }[]
): Promise<string> {
  let csvString = '';

  // Section 1: Value by City
  csvString += 'Valor por Cidade\n';
  csvString += 'Cidade,Valor\n';
  barChartData.forEach(item => {
    csvString += `"${item.city}",${item.value}\n`;
  });

  csvString += '\n'; // Separator

  // Section 2: Value by Category
  csvString += 'Distribuição por Categoria\n';
  csvString += 'Categoria,Valor\n';
  pieChartData.forEach(item => {
    csvString += `"${item.category}",${item.value}\n`;
  });

  return csvString;
}
