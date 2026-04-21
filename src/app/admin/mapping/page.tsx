'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    FaUserCircle,
    FaBaby,
    FaChartLine,
    FaTimes,
    FaMapMarkedAlt,
    FaPhone,
    FaClinicMedical
} from 'react-icons/fa';

export default function AdminMappingPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    // 1. Fetch Semua User yang punya lokasi
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'users'), where('coordinate', '!=', null));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllUsers(usersData);
            } catch (error) {
                console.error("Error fetching mapping data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 2. LOGIKA ISOLASI DATA BERDASARKAN ROLE
    const filteredUsers = useMemo(() => {
        return allUsers.filter(targetUser => {
            const role = currentUser?.role as string;

            if (role === 'admin') {
                return true; // Admin pusat lihat semua
            } else if (role === 'admin_puskesmas') {
                // Hanya lihat yang satu wilayah
                return targetUser.wilayah === currentUser?.wilayah;
            } else if (role === 'bidan') {
                // Hanya lihat pasien yang ditangani bidan tersebut (jika ada field bidanId)
                // Jika tidak ada field bidanId, fallback ke wilayah
                return targetUser.bidanId === currentUser?.uid || targetUser.wilayah === currentUser?.wilayah;
            }
            return false;
        });
    }, [allUsers, currentUser]);

    // 3. Render Google Maps
    useEffect(() => {
        if (loading || filteredUsers.length === 0) return;

        const initMap = async () => {
            setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string });

            try {
                const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
                const { AdvancedMarkerElement, PinElement } = await importLibrary("marker") as google.maps.MarkerLibrary;

                if (mapRef.current && !mapInstance) {
                    const map = new Map(mapRef.current, {
                        center: { lat: -2.476443, lng: 121.925435 }, // Center Morowali
                        zoom: 13,
                        mapId: '384e4f41c1d8c24aaf3284e6',
                    });

                    setMapInstance(map);

                    filteredUsers.forEach((u) => {
                        const pin = new PinElement({
                            background: u.role === 'admin' ? '#3b82f6' : '#ec4899',
                            glyphColor: '#fff',
                        });

                        const marker = new AdvancedMarkerElement({
                            map,
                            position: {
                                lat: Number(u.coordinate.latitude),
                                lng: Number(u.coordinate.longitude)
                            },
                            title: u.name,
                            content: pin.element,
                        });

                        marker.addListener('click', () => {
                            setSelectedUser(u);
                        });
                    });
                }
            } catch (err) {
                console.error("Gagal memuat Google Maps:", err);
            }
        };
        initMap();
    }, [loading, filteredUsers, mapInstance]);

    const handleFocusUser = (u: any) => {
        setSelectedUser(u);
        mapInstance?.panTo({
            lat: Number(u.coordinate.latitude),
            lng: Number(u.coordinate.longitude)
        });
        mapInstance?.setZoom(17);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden relative">
            {/* Sidebar Mapping Info */}
            <div className="w-80 bg-white border-r p-0 hidden md:flex flex-col z-20 shadow-xl">
                <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-white">
                    <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <FaMapMarkedAlt className="text-pink-500" /> SEBARAN DATA
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-gray-400">
                        <FaClinicMedical className="text-xs" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                            {currentUser?.role === 'admin' ? 'Global Morowali' : currentUser?.wilayah}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <p className="px-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Daftar Keluarga ({filteredUsers.length})</p>
                    {filteredUsers.map(u => (
                        <div
                            key={u.id}
                            onClick={() => handleFocusUser(u)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedUser?.id === u.id
                                    ? 'bg-pink-50 border-pink-200 shadow-md translate-x-1'
                                    : 'bg-white hover:border-gray-300 border-gray-100'
                                }`}
                        >
                            <p className="font-bold text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{u.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{u.wilayah || '-'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Area Peta */}
            <div ref={mapRef} className="flex-1 h-full z-0" />

            {/* Detail Drawer */}
            {selectedUser && (
                <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <button onClick={() => setSelectedUser(null)}
                            className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                            <FaTimes />
                        </button>

                        <div className="text-center mb-10 pt-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-[2rem] mx-auto flex items-center justify-center text-white mb-6 text-4xl shadow-xl rotate-3">
                                <FaUserCircle className="-rotate-3" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{selectedUser.name}</h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{selectedUser.wilayah}</p>
                            <div className="mt-4 flex justify-center gap-2">
                                <a href={`https://wa.me/${selectedUser.phone}`} target="_blank" className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black flex items-center gap-2 border border-green-100">
                                    <FaPhone /> HUBUNGI
                                </a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                                <h3 className="text-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <FaBaby /> Status Gizi Anak
                                </h3>
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Kondisi</span>
                                    <span className="text-[10px] font-black text-red-500">RESIKO STUNTING</span>
                                </div>
                            </div>

                            <div className="bg-pink-50 p-6 rounded-[2rem] border border-pink-100">
                                <h3 className="text-pink-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <FaChartLine /> Monitoring Ibu
                                </h3>
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Kehamilan</span>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-tight">Stabil</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t">
                        <button
                            className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95"
                            onClick={() => router.push(`/admin/users/${selectedUser.id}`)}
                        >
                            Buka Profil Lengkap
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}