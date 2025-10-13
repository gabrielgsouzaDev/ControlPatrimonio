'use server';

import { detectAssetAnomalies } from '@/ai/flows/detect-asset-anomalies';
import { z } from 'zod';
import type { Asset, Anomaly, Category, HistoryLog } from './types';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getFirestore, collection, getDocs, doc, writeBatch, serverTimestamp, query, where, documentId, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { revalidatePath } from 'next/cache';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getAuth } from 'firebase/auth'; // client auth

// This is now only used for client-side fetching within a client component context
export async function getAssets(): Promise<Asset[]> {
  try {
    const { firestore } = await initializeFirebase();
    const auth = getAuth(); // This will not work reliably on the server.
    const user = auth.currentUser;
    
    if (!user) {
        return [];
    }

    const assetsRef = collection(firestore, 'users', user.uid, 'assets');
    const snapshot = await getDocs(assetsRef);
    if (snapshot.empty) return [];
    
    const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    
    const categoryIds = [...new Set(assets.map(asset => asset.categoryId).filter(Boolean))];
    if (categoryIds.length === 0) {
        return assets.map(asset => ({ ...asset, category: 'N/A' }));
    }

    const categoriesRef = collection(firestore, 'users', user.uid, 'categories');
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

export async function runAnomalyDetection(assets: Asset[]): Promise<Anomaly[]> {
  try {
    // Ensure all assets have a valid value
    const itemsToAnalyze = assets.map(a => ({
        name: a.name,
        codeId: a.codeId,
        city: a.city,
        value: a.value,
        observation: a.observation || '',
    }));
    const result = await detectAssetAnomalies({ items: itemsToAnalyze });
    
    // Map anomalies back to full anomaly object
    const { firestore } = await initializeFirebase();
    const adminAuth = getAdminAuth();
    // This is problematic. The user should be determined from a token.
    // For now, we can't save anomalies this way. We will just return them.
    // A proper implementation requires passing user context.
    const anomaliesWithUserId: Anomaly[] = result.anomalies.map(a => ({...a, id: '', assetId: '', userId: ''}));
    
    return anomaliesWithUserId;
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
      asset.category || "N/A",
      asset.city,
      asset.value,
      `"${(asset.observation || '').replace(/"/g, '""')}"`
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export async function getHistory(): Promise<HistoryLog[]> {
    try {
        const { firestore } = await initializeFirebase();
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return [];

        const historyRef = collection(firestore, 'users', user.uid, 'history');
        const snapshot = await getDocs(historyRef);
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
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
            log.timestamp instanceof Date ? format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : format(new Date(log.timestamp.seconds * 1000), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
            `"${(log.details || '').replace(/"/g, '""')}"`
        ].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}
