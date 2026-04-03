import * as admin from 'firebase-admin';

// Fungsi pembersihan key
const formatKey = (key: string | undefined) => {
    if (!key) return undefined;
    return key.replace(/\\n/g, '\n').replace(/^['"]|['"]$/g, '');
};

if (!admin.apps.length) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = formatKey(process.env.FIREBASE_PRIVATE_KEY);

        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log('✅ Firebase Admin: Connected');
        }
    } catch (error: any) {
        console.error('❌ Firebase Admin Error:', error.message);
    }
}

// Gunakan function atau pengecekan untuk menghindari MODULE_NOT_FOUND saat runtime
export const getAdminAuth = () => admin.auth();
export const getAdminDb = () => admin.firestore();

// Tetap export konstanta jika kodenya sudah terlanjur pakai ini
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;