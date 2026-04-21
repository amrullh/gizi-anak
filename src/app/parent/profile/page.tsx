'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
    FaUser,
    FaWhatsapp,
    FaBirthdayCake,
    FaSignOutAlt,
    FaMapMarkedAlt,
    FaDirections
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const MapPreview = dynamic(() => import('@/components/features/MapPreview'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Memuat Peta...</p>
        </div>
    )
});

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [liveUser, setLiveUser] = useState<any>(null);

    // REAL-TIME FETCHING: Mendengarkan perubahan data user secara langsung
    useEffect(() => {
        if (!user?.uid) return;

        // Gunakan onSnapshot agar jika data di Firestore berubah, UI langsung update
        const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setLiveUser(docSnap.data());
            }
        });

        return () => unsub();
    }, [user?.uid]);

    // Gabungkan data auth dan data live
    const userData = liveUser || user;

    const getInitialPosition = (): { lat: number; lng: number } => {
        if (userData?.coordinate?.latitude && userData?.coordinate?.longitude) {
            return {
                lat: Number(userData.coordinate.latitude),
                lng: Number(userData.coordinate.longitude)
            };
        }

        const wilayah = userData?.wilayah?.toLowerCase() || '';
        if (wilayah.includes('fonuasingko') || wilayah.includes('panuasingko')) {
            return { lat: -2.476443, lng: 121.925435 };
        }
        if (wilayah.includes('bahomatefe') || wilayah.includes('bahomotefe')) {
            return { lat: -2.776611, lng: 121.867646 };
        }
        return { lat: -5.1476, lng: 119.4327 };
    };

    const position = getInitialPosition();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Profil Saya</h1>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-700 transition"
                >
                    <FaSignOutAlt /> Keluar
                </button>
            </div>

            {/* Ringkasan Profil */}
            <Card className="p-8 text-center bg-gradient-to-b from-white to-pink-50/30">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{userData?.name || '-'}</h2>
                <p className="text-gray-500 font-medium italic">Orang Tua / Wali</p>
                {userData?.wilayah && (
                    <span className="mt-2 inline-block px-3 py-1 bg-pink-100 text-pink-600 text-[10px] font-black rounded-full uppercase">
                        Wilayah: {userData.wilayah}
                    </span>
                )}
            </Card>

            {/* Informasi Kontak & Akun */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-3 text-gray-800">
                    <FaUser className="text-pink-500" />
                    Informasi Akun
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 shrink-0">
                            <FaWhatsapp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">WhatsApp</p>
                            <p className="font-bold text-gray-700">{userData?.phone || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                            <FaBirthdayCake />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tempat, Tgl Lahir</p>
                            <p className="font-bold text-gray-700">{userData?.ttl || '-'}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* SEKSI LOKASI */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-3 text-gray-800">
                    <FaMapMarkedAlt className="text-blue-500" />
                    Lokasi Tempat Tinggal
                </h2>

                <div
                    className="group relative h-64 w-full rounded-2xl overflow-hidden border-2 border-gray-100 cursor-pointer shadow-md hover:shadow-lg transition-all"
                    onClick={() => router.push('/parent/map')}
                >
                    <div className="absolute inset-0 z-[10] bg-black/5 group-hover:bg-black/20 flex items-center justify-center transition-all">
                        <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                            <FaDirections className="text-blue-500" />
                            <span className="text-xs font-black text-gray-800 uppercase tracking-tight">Klik untuk Atur Lokasi</span>
                        </div>
                    </div>

                    <MapPreview
                        position={position}
                        userName={userData?.name}
                        showMarker={!!userData?.coordinate}
                    />
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Titik Koordinat</p>
                        <p className="text-sm font-mono font-bold text-gray-700">
                            {userData?.coordinate
                                ? `${Number(userData.coordinate.latitude).toFixed(6)}, ${Number(userData.coordinate.longitude).toFixed(6)}`
                                : 'Belum diatur (Pratinjau Wilayah)'}
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/parent/map')}
                        className="text-[10px] py-2 px-4 h-auto"
                    >
                        UBAH LOKASI
                    </Button>
                </div>
            </Card>

            <div className="text-center pt-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    User ID: {userData?.uid || user?.uid}
                </p>
            </div>
        </div>
    );
}