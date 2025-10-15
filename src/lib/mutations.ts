
'use client';

import { 
    collection, 
    doc, 
    writeBatch, 
    serverTimestamp, 
    getDoc,
    Firestore,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import type { AssetFormValues } from "@/components/dashboard/add-edit-asset-form";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { Asset } from './types';

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

    // 1. Create a new asset document in the global collection
    const assetRef = doc(collection(firestore, 'assets'));
    const now = serverTimestamp();
    const assetPayload = { 
        ...assetData, 
        userId, // Keep track of who created it
        createdAt: now, 
        updatedAt: now,
        status: 'ativo' as const,
    };
    batch.set(assetRef, assetPayload);

    // 2. Create a new history log for the asset creation in the global collection
    const historyRef = doc(collection(firestore, 'history'));
    const historyLog = {
        assetId: assetRef.id,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Criado" as const,
        details: "Item novo adicionado ao inventário.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: now
    };
    batch.set(historyRef, historyLog);

    // NON-BLOCKING: commit and handle permission errors
    batch.commit().catch((error) => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: assetRef.path,
              operation: 'create',
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
    const assetRef = doc(firestore, 'assets', assetId);
    
    // Get old data first to calculate diff for history
    const oldAssetSnap = await getDoc(assetRef);
    if (!oldAssetSnap.exists()) {
        throw new Error("O patrimônio que você está tentando editar não existe.");
    }
    const oldAssetData = oldAssetSnap.data() as Asset;

    const batch = writeBatch(firestore);

    // 1. Update the asset document
    const assetPayload = { ...assetData, userId, updatedAt: serverTimestamp() }; // Keep track of who last updated it
    batch.update(assetRef, assetPayload);
    
    // 2. Create a history log based on the changes
    const changes: string[] = [];
    const locationDoc = assetData.city !== oldAssetData.city ? await getDoc(doc(firestore, 'locations', assetData.city)) : null;
    const oldLocationDoc = oldAssetData.city && oldAssetData.city !== assetData.city ? await getDoc(doc(firestore, 'locations', oldAssetData.city)) : null;
    const categoryDoc = assetData.categoryId !== oldAssetData.categoryId ? await getDoc(doc(firestore, 'categories', assetData.categoryId)) : null;
    const oldCategoryDoc = oldAssetData.categoryId && oldAssetData.categoryId !== assetData.categoryId ? await getDoc(doc(firestore, 'categories', oldAssetData.categoryId)) : null;

    if (oldAssetData.name !== assetData.name) changes.push(`nome alterado de '${oldAssetData.name}' para '${assetData.name}'`);
    if (oldAssetData.codeId !== assetData.codeId) changes.push(`código ID alterado de '${oldAssetData.codeId}' para '${assetData.codeId}'`);
    if (oldAssetData.value !== assetData.value) changes.push(`valor alterado de '${oldAssetData.value}' para '${assetData.value}'`);
    if (oldAssetData.observation !== assetData.observation) changes.push(`observação alterada`);
    if (oldLocationDoc && locationDoc && oldLocationDoc.exists() && locationDoc.exists()) changes.push(`cidade alterada de '${oldLocationDoc.data()?.name}' para '${locationDoc.data()?.name}'`);
    if (oldCategoryDoc && categoryDoc && oldCategoryDoc.exists() && categoryDoc.exists()) changes.push(`categoria alterada de '${oldCategoryDoc.data()?.name}' para '${categoryDoc.data()?.name}'`);


    const historyRef = doc(collection(firestore, 'history'));
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
 * Deactivates an asset (soft delete) and adds a corresponding history log.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the current user.
 * @param userDisplayName - The display name of the current user.
 * @param assetId - The ID of the asset to deactivate.
 */
export async function deactivateAsset(
    firestore: Firestore, 
    userId: string, 
    userDisplayName: string, 
    assetId: string
) {
    const assetRef = doc(firestore, 'assets', assetId);

    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
        throw new Error("Patrimônio não encontrado.");
    }
    const assetData = assetDoc.data();

    const batch = writeBatch(firestore);
    
    const updatePayload = { status: 'inativo', updatedAt: serverTimestamp() };
    batch.update(assetRef, updatePayload);
    
    const historyRef = doc(collection(firestore, 'history'));
    const historyLog = {
        assetId: assetId,
        assetName: assetData.name,
        codeId: assetData.codeId,
        action: "Desativado" as const,
        details: "Item foi movido para a lixeira.",
        userId: userId,
        userDisplayName: userDisplayName,
        timestamp: serverTimestamp()
    };
    batch.set(historyRef, historyLog);
    
    batch.commit().catch((error) => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: assetRef.path,
              operation: 'update',
              requestResourceData: updatePayload,
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
