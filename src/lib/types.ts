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
  userId?: string; // ID of the user who last modified/created
};

export type Anomaly = {
  id: string;
  assetId: string;
  anomalyType: string;
  description: string;
  userId?: string; // ID of the user who owns the asset
};

export type Category = {
    id: string;
    name: string;
    userId?: string; // ID of the user who created it
};

export type HistoryLog = {
    id: string;
    assetId: string;
    assetName: string;
    codeId: string;
    action: 'Criado' | 'Atualizado' | 'Excluído';
    userId: string;
    userDisplayName: string;
    timestamp: Date | Timestamp;
    details: string;
}
