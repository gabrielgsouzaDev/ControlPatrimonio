import { Timestamp } from "firebase/firestore";

export type Asset = {
  id: string;
  name: string;
  codeId: string;
  city: string;
  value: number;
  observation?: string;
  categoryId: string; // Now required
  category?: string; // Display name, optional
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
    assetId: string;
    assetName: string;
    codeId: string;
    action: 'Criado' | 'Atualizado' | 'Excluído';
    user: string; // This will be userDisplayName for the client
    userId: string;
    userDisplayName: string;
    timestamp: Date | Timestamp;
    details: string;
}
