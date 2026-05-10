import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function DELETE(request: NextRequest) {
    try {
        // 1. Verifikasi Token Admin
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Cek role pemanggil (harus admin)
        const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
        }

        // 2. Ambil UID target dari URL
        const { searchParams } = new URL(request.url);
        const targetUid = searchParams.get('uid');

        if (!targetUid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        // Proteksi: Admin dilarang hapus akun sendiri
        if (targetUid === decodedToken.uid) {
            return NextResponse.json({ error: 'Self-deletion is blocked' }, { status: 400 });
        }

        // 3. Eksekusi Penghapusan Total
        await adminAuth.deleteUser(targetUid); // Hapus dari Auth
        await adminDb.collection('users').doc(targetUid).delete(); // Hapus dari Firestore

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}