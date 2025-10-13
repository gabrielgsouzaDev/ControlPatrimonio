'use server';

import { detectAssetAnomalies } from '@/ai/flows/detect-asset-anomalies';
import { z } from 'zod';
import type { Asset, Anomaly, Category } from './types';

// Placeholder for a real database call
import { mockAssets, mockCategories } from './data';

const assetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  codeId: z.string().min(1, 'O código ID é obrigatório.'),
  category: z.string().min(1, 'A categoria é obrigatória.'),
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

// Category Actions
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome da categoria é obrigatório.'),
});

export async function getCategories(): Promise<Category[]> {
  return Promise.resolve(mockCategories);
}

export async function addCategory(name: string): Promise<Category> {
  const validatedField = categorySchema.pick({ name: true }).safeParse({ name });
  if (!validatedField.success) {
    throw new Error(validatedField.error.flatten().fieldErrors.name?.[0]);
  }
  const newCategory = { id: Date.now().toString(), name };
  console.log("Adding category:", newCategory);
  // In real app, save to DB
  mockCategories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
    const validatedField = categorySchema.pick({ name: true }).safeParse({ name });
    if (!validatedField.success) {
        throw new Error(validatedField.error.flatten().fieldErrors.name?.[0]);
    }
    console.log("Updating category:", { id, name });
    // In real app, update in DB
    const index = mockCategories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Categoria não encontrada.");
    mockCategories[index].name = name;
    return mockCategories[index];
}

export async function deleteCategory(id: string): Promise<{ success: true }> {
  console.log("Deleting category with id:", id);
  // In real app, delete from DB
   const index = mockCategories.findIndex(c => c.id === id);
   if (index === -1) throw new Error("Categoria não encontrada.");
   mockCategories.splice(index, 1);
  return { success: true };
}
