'use client';

import { 
    collection, 
    doc, 
    writeBatch, 
    serverTimestamp, 
    getDoc,
    Firestore
} from "firebase/firestore";
import type { AssetFormValues } from "@/components/dashboard/add-edit-asset-form";

/**
 * Adds a new asset and a corresponding history log to Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the current user.
 * @param userDisplayName - The display name of the current user.
 * @param assetData - The asset data from the form.
 */
export async function addAsset(
    firestore: Firestore, 
    userId: string, 
    userDisplayName: string, 
    assetData: AssetFormValues
) {
    const batch = writeBatch(firestore);

    // 1. Create a new asset document
    const assetRef = doc(collection(firestore, 'users', userId, 'assets'));
    batch.set(assetRef, { 
        ...assetData, 
        userId, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
    });

    // 2. Create a new history log for the asset creation
    const historyRef = doc(collection(firestore, 'users', userId, 'history'));
    const historyLog = {
        assetId: assetRef.id,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Criado",
        details: "Item novo adicionado ao inventário.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);

    await batch.commit();
}

/**
 * Updates an existing asset and adds a corresponding history log to Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the current user.
 * @param userDisplayName - The display name of the current user.
 * @param assetId - The ID of the asset to update.
 * @param assetData - The updated asset data from the form.
 */
export async function updateAsset(
    firestore: Firestore, 
    userId: string, 
    userDisplayName: string, 
    assetId: string, 
    assetData: AssetFormValues
) {
    const batch = writeBatch(firestore);
    
    // 1. Get the old asset data to compare for history log
    const assetRef = doc(firestore, 'users', userId, 'assets', assetId);
    const oldAssetSnap = await getDoc(assetRef);
    const oldAssetData = oldAssetSnap.data();

    // 2. Update the asset document
    batch.update(assetRef, { ...assetData, updatedAt: serverTimestamp() });
    
    // 3. Create a history log based on the changes
    const changes: string[] = [];
    if (oldAssetData) {
        (Object.keys(assetData) as Array<keyof AssetFormValues>).forEach(key => {
            if (oldAssetData[key] !== assetData[key]) {
                changes.push(`${key} alterado de '${oldAssetData[key]}' para '${assetData[key]}'`);
            }
        });
    }

    const historyRef = doc(collection(firestore, 'users', userId, 'history'));
    const historyLog = {
        assetId: assetId,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Atualizado",
        details: changes.length > 0 ? changes.join(', ') : "Nenhuma alteração registrada nos campos.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);

    await batch.commit();
}

/**
 * Deletes an asset and adds a corresponding history log to Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the current user.
 * @param userDisplayName - The display name of the current user.
 * @param assetId - The ID of the asset to delete.
 */
export async function deleteAsset(
    firestore: Firestore, 
    userId: string, 
    userDisplayName: string, 
    assetId: string
) {
    const batch = writeBatch(firestore);

    // 1. Get the asset data before deleting for the history log
    const assetRef = doc(firestore, 'users', userId, 'assets', assetId);
    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
        throw new Error("Patrimônio não encontrado.");
    }
    const assetData = assetDoc.data();

    // 2. Delete the asset document
    batch.delete(assetRef);
    
    // 3. Create a history log for the deletion
    const historyRef = doc(collection(firestore, 'users', userId, 'history'));
    const historyLog = {
        assetId: assetId,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Excluído",
        details: "Item foi removido do inventário.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);
    
    await batch.commit();
}
