import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // 1. Cek siapa yang panggil API ini
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const requesterUid = decodedToken.uid;

        // Ambil data si pembuat dari Firestore
        const requesterDoc = await adminDb.collection('users').doc(requesterUid).get();
        const requesterData = requesterDoc.data();

        if (!requesterData) {
            return NextResponse.json({ error: 'Requester data not found' }, { status: 404 });
        }

        const requesterRole = requesterData.role; // 'admin' atau 'admin_puskesmas' atau 'bidan'
        const requesterWilayah = requesterData.wilayah;

        const { phone, password, name, role, wilayah, bidanId } = await request.json();

        // 2. VALIDASI AUTHORITY & WILAYAH (Simplified)
        let finalWilayah = '';

        if (requesterRole === 'admin') {
            // ADMIN GLOBAL: Bebas tentukan wilayah
            finalWilayah = wilayah;
        } else if (requesterRole === 'admin_puskesmas') {
            // ADMIN PUSKESMAS: Dilarang buat Admin Global & Wilayah dipaksa
            if (role === 'admin') {
                return NextResponse.json({ error: 'Authority denied: Cannot create Global Admin' }, { status: 403 });
            }
            finalWilayah = requesterWilayah;
        } else if (requesterRole === 'bidan') {
            // BIDAN: Hanya boleh buat Parent & Wilayah dipaksa
            if (role !== 'parent') {
                return NextResponse.json({ error: 'Authority denied: Bidan can only create Parent accounts' }, { status: 403 });
            }
            finalWilayah = requesterWilayah;
        } else {
            return NextResponse.json({ error: 'Method not allowed for your role' }, { status: 403 });
        }

        // Pastikan wilayah terisi (kecuali untuk admin global yang mungkin lintas wilayah)
        if (!finalWilayah && role !== 'admin') {
            return NextResponse.json({ error: 'Wilayah is required for this role' }, { status: 400 });
        }

        const email = `${phone}@gizianak.local`;

        // 3. Eksekusi Create User di Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 4. Susun Metadata untuk Firestore
        const userData = {
            uid: userRecord.uid,
            name,
            phone,
            email,
            role, // 'admin', 'admin_puskesmas', 'bidan', 'parent'
            wilayah: finalWilayah,
            createdBy: requesterUid,
            // Logic Bidan Penanggung Jawab
            bidanId: role === 'parent' ? (bidanId || (requesterRole === 'bidan' ? requesterUid : '')) : '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await adminDb.collection('users').doc(userRecord.uid).set(userData);

        // 5. Set Custom Claims (Penting untuk Middleware & Keamanan)
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            role,
            wilayah: finalWilayah
        });

        return NextResponse.json({
            success: true,
            uid: userRecord.uid,
            message: `User ${name} as ${role} created in ${finalWilayah || 'Global'}`
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error API Create User:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}