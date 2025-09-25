import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (process.env.NODE_ENV === 'development' && !serviceAccountPath) {
    // Use emulator in development
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
    
    admin.initializeApp({
      projectId: projectId || 'demo-project',
    });
  } else {
    // Production or development with service account
    const serviceAccount = serviceAccountPath 
      ? require(serviceAccountPath)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export const firestore = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export { admin };

// Firestore settings for better performance
firestore.settings({
  ignoreUndefinedProperties: true,
});

export default admin;
