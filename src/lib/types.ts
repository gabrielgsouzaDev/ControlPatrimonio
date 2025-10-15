
import { Timestamp } from "firebase/firestore";

export type Asset = {
  id: string;
  name: string;
  codeId: string;
  city: string; // This will now be a location ID
  value: number;
  observation?: string;
  categoryId: string; // Now required
  category?: string; // Optional: Used for display purposes after mapping
  userId?: string; // ID of the user who last modified/created
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  status: 'ativo' | 'inativo';
};

export type Category = {
    id: string;
    name: string;
    userId?: string; // ID of the user who created it
};

export type Location = {
    id: string;
    name: string;
    userId?: string; // ID of the user who created it
};

export type HistoryLog = {
    id: string;
    assetId: string;
    assetName: string;
    codeId: string;
    action: 'Criado' | 'Atualizado' | 'Excluído' | 'Desativado' | 'Reativado';
    userId: string;
    userDisplayName: string;
    timestamp: Date | Timestamp | any;
    details: string;
}
