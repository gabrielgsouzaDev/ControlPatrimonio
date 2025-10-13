'use server'

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeFirebase(): Promise<{ auth: ReturnType<typeof getAuth>, firestore: ReturnType<typeof getFirestore>, app: App }> {
  if (!getApps().length) {
    const app = initializeApp({
        // Let ADC find the credentials by not providing the credential property
        projectId: firebaseConfig.projectId,
    });
    
    return await getSdks(app);
  }

  const app = getApp();
  return await getSdks(app);
}

export async function getSdks(app: App): Promise<{ auth: ReturnType<typeof getAuth>, firestore: ReturnType<typeof getFirestore>, app: App }> {
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}
