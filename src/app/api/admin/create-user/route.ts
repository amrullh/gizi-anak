import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin'; 

export async function POST(request: Request) {
    try {
        const { phone, password, name, role, wilayah, bidanId } = await request.json();

        // Firebase Auth membutuhkan email, kita buat email dummy unik dari nomor HP
        const email = `${phone}@gizianak.local`;

        // 1. Buat user di Firebase Auth (Admin SDK)
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Simpan data tambahan ke Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            phone,
            email,
            role,
            wilayah: wilayah || '',
            // Jika role-nya parent, simpan ID bidan penanggung jawabnya
            bidanId: role === 'parent' ? (bidanId || '') : '', 
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({ uid: userRecord.uid }, { status: 200 });
    } catch (error: any) {
        console.error("Error API Create User:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}