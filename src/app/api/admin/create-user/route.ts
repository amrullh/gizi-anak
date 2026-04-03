import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin'; 

export async function POST(request: Request) {
    try {
        const { email, password, name, role, phone, wilayah } = await request.json();

        // 1. Buat user di Firebase Auth tanpa login (menggunakan Admin SDK)
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Simpan data tambahan ke Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            name,
            phone,
            email,
            role,
            wilayah: wilayah || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({ uid: userRecord.uid }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}