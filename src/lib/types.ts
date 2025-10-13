export type Asset = {
  id: string;
  name: string;
  codeId: string;
  city: string;
  value: number;
  observation?: string;
  category: string;
};

export type Anomaly = {
  codeId: string;
  anomalyType: string;
  description: string;
};

export type Category = {
    id: string;
    name: string;
};

export type HistoryLog = {
    id: string;
    assetName: string;
    codeId: string;
    action: 'Criado' | 'Atualizado' | 'Excluído';
    user: string;
    timestamp: Date;
    details: string;
}
