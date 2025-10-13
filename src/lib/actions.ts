'use server';

import { detectAssetAnomalies } from '@/ai/flows/detect-asset-anomalies';
import { z } from 'zod';
import type { Asset, Anomaly, Category, HistoryLog } from './types';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, query, where, documentId, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { revalidatePath } from 'next/cache';

const assetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  codeId: z.string().min(1, 'O código ID é obrigatório.'),
  categoryId: z.string().min(1, 'A categoria é obrigatória.'),
  city: z.string().min(1, 'A cidade/local é obrigatória.'),
  value: z.coerce.number().positive('O valor deve ser um número positivo.'),
  observation: z.string().optional(),
});

async function getUserIdAndServices() {
    const { auth: adminAuth, firestore } = await initializeFirebase();
    // This is a placeholder for a real auth check mechanism on the server.
    // In a real app, you'd get the user from the session or token.
    const uid = 'admin-uid-placeholder'; // This needs a proper solution
    const user = await adminAuth.getUser(uid).catch(() => null);

    if (!user) throw new Error("Usuário não autenticado.");
    return { userId: user.uid, userDisplayName: user.displayName || user.email, firestore };
}

export async function getAssets(): Promise<Asset[]> {
  try {
    const { userId, firestore } = await getUserIdAndServices();
    const assetsRef = collection(firestore, 'users', userId, 'assets');
    const snapshot = await getDocs(assetsRef);
    if (snapshot.empty) return [];
    
    const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    
    const categoryIds = [...new Set(assets.map(asset => asset.categoryId).filter(Boolean))];
    if (categoryIds.length === 0) {
        return assets.map(asset => ({ ...asset, category: 'N/A' }));
    }

    const categoriesRef = collection(firestore, 'users', userId, 'categories');
    const categoriesQuery = query(categoriesRef, where(documentId(), 'in', categoryIds));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    const categoryMap = new Map(categoriesSnapshot.docs.map(doc => [doc.id, doc.data().name]));

    return assets.map(asset => ({
      ...asset,
      category: categoryMap.get(asset.categoryId) || 'N/A'
    }));

  } catch (error) {
    console.error("Error getting assets:", error);
    return [];
  }
}

export async function addAsset(formData: FormData) {
    const { userId, userDisplayName, firestore } = await getUserIdAndServices();
    const validatedFields = assetSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { id, ...assetData } = validatedFields.data;

    try {
        const batch = writeBatch(firestore);
        
        const assetsRef = collection(firestore, 'users', userId, 'assets');
        const newAssetRef = doc(assetsRef);
        batch.set(newAssetRef, { ...assetData, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        
        const historyRef = collection(firestore, 'users', userId, 'history');
        const historyLog = {
            assetId: newAssetRef.id,
            assetName: assetData.name,
            codeId: assetData.codeId,
            action: "Criado",
            details: "Item novo adicionado ao inventário.",
            userId: userId,
            userDisplayName: userDisplayName,
            timestamp: serverTimestamp()
        };
        batch.set(doc(historyRef), historyLog);

        await batch.commit();
        revalidatePath('/dashboard/patrimonio');
        revalidatePath('/dashboard/historico');
        return { success: true };
    } catch (error) {
        console.error("Error adding asset:", error);
        return { errors: { _server: ['Não foi possível adicionar o item.'] } };
    }
}

export async function updateAsset(formData: FormData) {
    const { userId, userDisplayName, firestore } = await getUserIdAndServices();
    const validatedFields = assetSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, ...assetData } = validatedFields.data;
    if (!id) return { errors: { _server: ['ID do item não encontrado.'] } };

    try {
        const batch = writeBatch(firestore);

        const assetRef = doc(firestore, 'users', userId, 'assets', id);
        const oldAssetSnap = await getDoc(assetRef);
        const oldAssetData = oldAssetSnap.data();
        
        batch.update(assetRef, { ...assetData, updatedAt: serverTimestamp() });
        
        const historyRef = collection(firestore, 'users', userId, 'history');
        // Simple change detection for history
        const changes: string[] = [];
        if (oldAssetData) {
            for (const key in assetData) {
                if (key !== 'id' && oldAssetData[key] !== (assetData as any)[key]) {
                    changes.push(`${key} alterado de '${oldAssetData[key]}' para '${(assetData as any)[key]}'`);
                }
            }
        }
        
        const historyLog = {
            assetId: id,
            assetName: assetData.name,
            codeId: assetData.codeId,
            action: "Atualizado",
            details: changes.length > 0 ? changes.join(', ') : "Item foi atualizado.",
            userId: userId,
            userDisplayName: userDisplayName,
            timestamp: serverTimestamp()
        };
        batch.set(doc(historyRef), historyLog);

        await batch.commit();
        revalidatePath('/dashboard/patrimonio');
        revalidatePath('/dashboard/historico');
        return { success: true };
    } catch (error) {
        console.error("Error updating asset:", error);
        return { errors: { _server: ['Não foi possível atualizar o item.'] } };
    }
}


export async function deleteAsset(id: string) {
  try {
    const { userId, userDisplayName, firestore } = await getUserIdAndServices();
    const assetRef = doc(firestore, 'users', userId, 'assets', id);
    
    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
        throw new Error("Asset not found");
    }
    const assetData = assetDoc.data();

    const batch = writeBatch(firestore);
    batch.delete(assetRef);
    
    const historyRef = collection(firestore, 'users', userId, 'history');
    const historyLog = {
        assetId: id,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Excluído",
        details: "Item foi removido do inventário.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(doc(historyRef), historyLog);
    
    await batch.commit();
    revalidatePath('/dashboard/patrimonio');
    revalidatePath('/dashboard/historico');
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { success: false, error: "Failed to delete asset." };
  }
}


export async function runAnomalyDetection(assets: Asset[]): Promise<Anomaly[]> {
  try {
    const result = await detectAssetAnomalies({ items: assets });
    return result.anomalies;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    throw new Error('Falha ao detectar anomalias.');
  }
}

export async function exportAssetsToCsv(assets: Asset[]): Promise<string> {
  if (!assets.length) {
    return '';
  }

  const headers = ['ID', 'Nome', 'Código ID', 'Categoria', 'Cidade/Local', 'Valor', 'Observação'];
  const rows = assets.map(asset => 
    [
      asset.id,
      `"${asset.name.replace(/"/g, '""')}"`,
      asset.codeId,
      asset.category,
      asset.city,
      asset.value,
      `"${(asset.observation || '').replace(/"/g, '""')}"`
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { userId, firestore } = await getUserIdAndServices();
    const categoriesRef = collection(firestore, 'users', userId, 'categories');
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Category));
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
}


// History Actions
export async function getHistory(): Promise<HistoryLog[]> {
    try {
        const { userId, firestore } = await getUserIdAndServices();
        const historyRef = collection(firestore, 'users', userId, 'history');
        const snapshot = await getDocs(historyRef);
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                user: data.userDisplayName, // Map userDisplayName to user for the client
                timestamp: data.timestamp.toDate() 
            } as HistoryLog;
        });
    } catch (error) {
        console.error("Error getting history:", error);
        return [];
    }
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
            format(new Date(log.timestamp.seconds * 1000), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
            `"${(log.details || '').replace(/"/g, '""')}"`
        ].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}
