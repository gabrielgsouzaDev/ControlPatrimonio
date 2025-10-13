'use server'

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): { auth: ReturnType<typeof getAuth>, firestore: ReturnType<typeof getFirestore>, app: App } {
  if (!getApps().length) {
    const app = initializeApp({
        credential: undefined, // Let ADC find the credentials
        projectId: firebaseConfig.projectId,
    });
    
    return getSdks(app);
  }

  const app = getApp();
  return getSdks(app);
}

export function getSdks(app: App) {
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}
