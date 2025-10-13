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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/**
 * Adds a new asset and a corresponding history log to Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the current user.
 * @param userDisplayName - The display name of the current user.
 * @param assetData - The asset data from the form.
 */
export function addAsset(
    firestore: Firestore, 
    userId: string, 
    userDisplayName: string, 
    assetData: AssetFormValues
) {
    const batch = writeBatch(firestore);

    // 1. Create a new asset document
    const assetRef = doc(collection(firestore, 'users', userId, 'assets'));
    const assetPayload = { 
        ...assetData, 
        userId, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
    };
    batch.set(assetRef, assetPayload);

    // 2. Create a new history log for the asset creation
    const historyRef = doc(collection(firestore, 'users', userId, 'history'));
    const historyLog = {
        assetId: assetRef.id,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Criado" as const,
        details: "Item novo adicionado ao inventário.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);

    // NON-BLOCKING: commit and handle permission errors
    batch.commit().catch((error) => {
        console.log("Caught error in addAsset", error);
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: assetRef.path,
              operation: 'create',
              requestResourceData: assetPayload,
            })
        );
         // Also emit for history log write if needed, but asset is primary
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: historyRef.path,
              operation: 'create',
              requestResourceData: historyLog,
            })
        );
    });
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
    const assetRef = doc(firestore, 'users', userId, 'assets', assetId);
    
    // Get old data first to calculate diff for history
    const oldAssetSnap = await getDoc(assetRef);
    if (!oldAssetSnap.exists()) {
        throw new Error("O patrimônio que você está tentando editar não existe.");
    }
    const oldAssetData = oldAssetSnap.data();

    const batch = writeBatch(firestore);

    // 1. Update the asset document
    const assetPayload = { ...assetData, updatedAt: serverTimestamp() };
    batch.update(assetRef, assetPayload);
    
    // 2. Create a history log based on the changes
    const changes: string[] = [];
    (Object.keys(assetData) as Array<keyof AssetFormValues>).forEach(key => {
        if (oldAssetData[key] !== undefined && oldAssetData[key] !== assetData[key]) {
            changes.push(`${key} alterado de '${oldAssetData[key]}' para '${assetData[key]}'`);
        }
    });

    const historyRef = doc(collection(firestore, 'users', userId, 'history'));
    const historyLog = {
        assetId: assetId,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Atualizado" as const,
        details: changes.length > 0 ? changes.join(', ') : "Nenhuma alteração registrada nos campos.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);

    // NON-BLOCKING: commit and handle permission errors
    batch.commit().catch((error) => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: assetRef.path,
              operation: 'update',
              requestResourceData: assetPayload,
            })
        );
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: historyRef.path,
              operation: 'create',
              requestResourceData: historyLog,
            })
        );
    });
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
    const assetRef = doc(firestore, 'users', userId, 'assets', assetId);

    // Get the asset data before deleting for the history log
    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
        throw new Error("Patrimônio não encontrado.");
    }
    const assetData = assetDoc.data();

    const batch = writeBatch(firestore);
    
    // 1. Delete the asset document
    batch.delete(assetRef);
    
    // 2. Create a history log for the deletion
    const historyRef = doc(collection(firestore, 'users', userId, 'history'));
    const historyLog = {
        assetId: assetId,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Excluído" as const,
        details: "Item foi removido do inventário.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);
    
    // NON-BLOCKING: commit and handle permission errors
    batch.commit().catch((error) => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: assetRef.path,
              operation: 'delete',
            })
        );
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: historyRef.path,
              operation: 'create',
              requestResourceData: historyLog,
            })
        );
    });
}
