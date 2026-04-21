import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging'; // Tambahkan ini
import { firebaseConfig } from "@/lib/firebase/config";

// Inisialisasi App (Singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export service standar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const messaging = typeof window !== 'undefined'
    ? getMessaging(app)
    : null as unknown as Messaging;

export default app;