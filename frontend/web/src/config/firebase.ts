import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  const authEmulatorHost = process.env.REACT_APP_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  const firestoreEmulatorHost = process.env.REACT_APP_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8082';
  const storageEmulatorHost = process.env.REACT_APP_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';

  try {
    connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8082);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulators are already connected
    console.log('Firebase emulators already connected');
  }
}

export default app;
