import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'fake-api-key-for-emulator',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'jobinder-dev',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'jobinder-dev.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators (always in development, or when not in production)
if (!process.env.REACT_APP_USE_PRODUCTION_FIREBASE) {
  const authEmulatorHost = process.env.REACT_APP_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';

  try {
    connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8082);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Connected to Firebase emulators');
  } catch (error) {
    // Emulators are already connected
    console.log('Firebase emulators already connected');
  }
}

export default app;
