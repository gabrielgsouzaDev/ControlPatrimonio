'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Asset, HistoryLog } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

// Extend the jsPDF type to include the autoTable method.
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function exportAssetsToPdf(assets: Asset[]) {
  if (!assets.length) {
    throw new Error('Não há dados para exportar.');
  }

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const tableColumns = ['Nome', 'Código ID', 'Categoria', 'Cidade/Local', 'Valor', 'Observação'];
  const tableRows: (string | number)[][] = [];

  assets.forEach(asset => {
    const assetData = [
      asset.name,
      asset.codeId,
      asset.category || 'N/A',
      asset.city,
      formatCurrency(asset.value),
      asset.observation || '-',
    ];
    tableRows.push(assetData);
  });

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 20,
  });

  doc.text('Relatório de Patrimônio', 14, 15);
  doc.save('patrimonio.pdf');
}

export function exportHistoryToPdf(history: HistoryLog[]) {
  if (!history.length) {
    throw new Error('Não há dados para exportar.');
  }

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const tableColumns = ['Item', 'Código ID', 'Ação', 'Usuário', 'Data e Hora', 'Detalhes'];
  const tableRows: string[][] = [];

  // Sort history by timestamp descending
  const sortedHistory = [...history].sort((a, b) => {
    const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  sortedHistory.forEach(log => {
    const timestamp = log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date(log.timestamp);
    const logData = [
      log.assetName,
      log.codeId,
      log.action,
      log.userDisplayName,
      format(timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      log.details,
    ];
    tableRows.push(logData);
  });

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 20,
  });

  doc.text('Relatório de Histórico de Alterações', 14, 15);
  doc.save('historico_patrimonio.pdf');
}
