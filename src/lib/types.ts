
import { Timestamp } from "firebase/firestore";
import { z } from "zod";

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

export const assetFormSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  codeId: z.string().min(1, { message: "O código ID é obrigatório." }),
  categoryId: z.string().min(1, { message: "A categoria é obrigatória." }),
  city: z.string().min(1, { message: "A cidade/local é obrigatória." }),
  value: z.coerce.number().positive({ message: "O valor deve ser um número positivo." }),
  observation: z.string().optional(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

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
