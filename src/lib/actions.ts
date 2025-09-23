'use server';

import { detectAssetAnomalies } from '@/ai/flows/detect-asset-anomalies';
import { z } from 'zod';
import type { Asset, Anomaly } from './types';

// Placeholder for a real database call
import { mockAssets } from './data';

const assetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  codeId: z.string().min(1, 'O código ID é obrigatório.'),
  city: z.string().min(1, 'A cidade/local é obrigatória.'),
  value: z.coerce.number().positive('O valor deve ser um número positivo.'),
  observation: z.string().optional(),
});

export async function getAssets(): Promise<Asset[]> {
  // In a real app, this would fetch from Firebase Firestore
  return Promise.resolve(mockAssets);
}

export async function addAsset(formData: FormData) {
  const validatedFields = assetSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // In a real app, you would add this to Firestore
  console.log('Adding asset:', validatedFields.data);
  return { success: true };
}

export async function updateAsset(formData: FormData) {
  const validatedFields = assetSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  // In a real app, you would update this in Firestore
  console.log('Updating asset:', validatedFields.data);
  return { success: true };
}

export async function deleteAsset(id: string) {
  // In a real app, you would delete this from Firestore
  console.log('Deleting asset with id:', id);
  return { success: true };
}


export async function runAnomalyDetection(assets: Asset[]): Promise<Anomaly[]> {
  try {
    const result = await detectAssetAnomalies({ items: assets });
    return result.anomalies;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    // You might want to throw a custom error or return a specific error structure
    throw new Error('Falha ao detectar anomalias.');
  }
}

export async function exportAssetsToCsv(assets: Asset[]): Promise<string> {
  if (!assets.length) {
    return '';
  }

  const headers = ['ID', 'Nome', 'Código ID', 'Cidade/Local', 'Valor', 'Observação'];
  const rows = assets.map(asset => 
    [
      asset.id,
      `"${asset.name.replace(/"/g, '""')}"`,
      asset.codeId,
      asset.city,
      asset.value,
      `"${(asset.observation || '').replace(/"/g, '""')}"`
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
