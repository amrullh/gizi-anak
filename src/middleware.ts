import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session'); // atau token dari Firebase? Kita perlu handle auth di middleware.
    // Karena Firebase auth state dikelola di client, middleware sulit akses. Alternatif: buat API route untuk verifikasi token, atau gunakan next-firebase-auth-edge.
    // Untuk sementara, kita bisa lindungi di client dengan redirect di layout.
    // Tapi kita bisa buat middleware sederhana dengan membaca cookie dari Firebase (kalau pakai cookie session).
    // Saya sarankan untuk sementara lindungi di client dulu, nanti upgrade.
    return NextResponse.next();
}

export const config = {
    matcher: ['/parent/:path*', '/admin/:path*'],
};