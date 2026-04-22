'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useAuth } from '@/context/AuthContext';
import {
    FaUserCircle, FaBaby, FaChartLine, FaTimes, FaMapMarkedAlt,
    FaPhone, FaSpinner, FaCalendarAlt, FaWeight, FaRulerVertical, FaInfoCircle, FaClinicMedical
} from 'react-icons/fa';

export default function AdminMappingPage() {
    const { user: currentUser } = useAuth();
    const mapRef = useRef<HTMLDivElement>(null);

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    const [relatedChildren, setRelatedChildren] = useState<any[]>([]);
    const [pregnancyData, setPregnancyData] = useState<any>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    // 1. Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'users'), where('coordinate', '!=', null));
                const snapshot = await getDocs(q);
                setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchUsers();
    }, []);

    // 2. LOGIKA FETCH DETAIL (DENGAN MULTI-FIELD CHECK)
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!selectedUser?.id) return;

            setFetchingDetails(true);
            setRelatedChildren([]);
            setPregnancyData(null);

            try {
                const childrenRef = collection(db, 'children');

                // KITA CEK 3 KEMUNGKINAN FIELD SEKALIGUS AGAR PASTI DAPAT
                const fieldOptions = ['parentId', 'uid', 'userId'];
                let childDocs: any[] = [];

                for (const fieldName of fieldOptions) {
                    const q = query(childrenRef, where(fieldName, '==', selectedUser.id));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        childDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        break; // Stop kalau sudah ketemu
                    }
                }

                // Jika ketemu anak, ambil gizi terbarunya
                const childrenWithRecords = await Promise.all(
                    childDocs.map(async (child) => {
                        const grRef = collection(db, 'growthRecords');
                        const qGr = query(
                            grRef,
                            where('childId', '==', child.id),
                            orderBy('date', 'desc'),
                            limit(1)
                        );
                        const grSnap = await getDocs(qGr);
                        return {
                            ...child,
                            latestRecord: !grSnap.empty ? grSnap.docs[0].data() : null
                        };
                    })
                );
                setRelatedChildren(childrenWithRecords);

                // Fetch Kehamilan
                const pregRef = collection(db, 'pregnancies');
                const qPreg = query(pregRef, where('userId', '==', selectedUser.id), where('isBorn', '==', false), limit(1));
                const pregSnap = await getDocs(qPreg);
                if (!pregSnap.empty) setPregnancyData({ id: pregSnap.docs[0].id, ...pregSnap.docs[0].data() });

            } catch (error) {
                console.error('Fetch Error:', error);
            } finally {
                setFetchingDetails(false);
            }
        };

        fetchUserDetails();
    }, [selectedUser]);

    // 3. Filter Role
    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const role = currentUser?.role;
            if (role === 'admin') return true;
            if (role === 'admin_puskesmas') return u.wilayah === currentUser?.wilayah;
            if (role === 'bidan') return u.bidanId === currentUser?.uid || u.wilayah === currentUser?.wilayah;
            return false;
        });
    }, [allUsers, currentUser]);

    // 4. Map Init
    // 4. Inisialisasi Google Maps
    useEffect(() => {
        if (loading || filteredUsers.length === 0) return;

        const initMap = async () => {
            setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string });
            try {
                const { Map } = (await importLibrary('maps')) as google.maps.MapsLibrary;
                const { AdvancedMarkerElement, PinElement } = (await importLibrary('marker')) as google.maps.MarkerLibrary;

                if (mapRef.current && !mapInstance) {
                    const map = new Map(mapRef.current, {
                        // PUSAT PETA: Di antara Fonuasingko dan Bahomotefe
                        center: { lat: -2.6265, lng: 121.8965 },
                        zoom: 11, // Zoom diperkecil sedikit agar kedua wilayah terlihat
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
                        marker.addListener('click', () => setSelectedUser(u));
                    });
                }
            } catch (err) {
                console.error('Maps error:', err);
            }
        };
        initMap();
    }, [loading, filteredUsers, mapInstance]);

    const handleFocusUser = (u: any) => {
        setSelectedUser(u);
        mapInstance?.panTo({ lat: Number(u.coordinate.latitude), lng: Number(u.coordinate.longitude) });
        mapInstance?.setZoom(17);
    };

    const formatDate = (dateAny: any) => {
        if (!dateAny) return '-';
        const d = dateAny.toDate ? dateAny.toDate() : new Date(dateAny);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden relative">
            {/* SIDEBAR KIRI */}
            <div className="w-80 bg-white border-r p-0 hidden md:flex flex-col z-20 shadow-xl">
                <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-white">
                    <h1 className="text-xl font-black text-gray-800 flex items-center gap-2"><FaMapMarkedAlt className="text-pink-500" /> SEBARAN DATA</h1>
                    <div className="mt-2 flex items-center gap-2 text-gray-400">
                        <FaClinicMedical className="text-xs" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{currentUser?.wilayah || 'Global Morowali'}</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredUsers.map((u) => (
                        <div key={u.id} onClick={() => handleFocusUser(u)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedUser?.id === u.id ? 'bg-pink-50 border-pink-200 shadow-md translate-x-1' : 'bg-white hover:border-gray-300'}`}>
                            <p className="font-bold text-sm text-gray-700">{u.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{u.wilayah || '-'}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div ref={mapRef} className="flex-1 h-full z-0" />

            {/* SIDEBAR DETAIL (KANAN) */}
            {selectedUser && (
                <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all"><FaTimes /></button>

                        <div className="text-center mb-10 pt-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-[2rem] mx-auto flex items-center justify-center text-white mb-6 text-4xl shadow-xl rotate-3"><FaUserCircle /></div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{selectedUser.name}</h2>
                            <p className="text-sm text-gray-400 font-bold uppercase mt-1">{selectedUser.wilayah}</p>
                        </div>

                        <div className="space-y-6">
                            {/* DATA ANAK */}
                            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                                <h3 className="text-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4"><FaBaby /> Status Gizi Anak ({relatedChildren.length})</h3>
                                {fetchingDetails ? (
                                    <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-blue-400" /></div>
                                ) : relatedChildren.length > 0 ? (
                                    <div className="space-y-4">
                                        {relatedChildren.map((child) => (
                                            <div key={child.id} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 uppercase">{child.name}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                                                    </div>
                                                    {child.latestRecord && (
                                                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${child.latestRecord.stuntingStatus === 'Normal' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{child.latestRecord.stuntingStatus?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                {child.latestRecord ? (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-gray-50 p-2 rounded-xl flex items-center gap-2 text-xs font-black text-gray-600"><FaWeight className="text-blue-400" /> {child.latestRecord.weight} kg</div>
                                                            <div className="bg-gray-50 p-2 rounded-xl flex items-center gap-2 text-xs font-black text-gray-600"><FaRulerVertical className="text-blue-400" /> {child.latestRecord.height} cm</div>
                                                        </div>
                                                        <div className="bg-blue-50/50 p-2 rounded-xl flex items-center gap-2">
                                                            <FaInfoCircle className="text-blue-400 text-[10px]" />
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase line-clamp-1">{child.latestRecord.nutritionalStatus}</p>
                                                        </div>
                                                    </div>
                                                ) : <p className="text-[10px] text-gray-400 italic text-center py-2 border-t">Belum ada data timbang</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="bg-white/50 p-4 rounded-2xl text-center text-[10px] font-black text-gray-400 uppercase border border-dashed">TIDAK ADA DATA ANAK</div>}
                            </div>

                            {/* DATA KEHAMILAN */}
                            <div className="bg-pink-50 p-6 rounded-[2rem] border border-pink-100">
                                <h3 className="text-pink-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4"><FaChartLine /> Monitoring Ibu</h3>
                                {fetchingDetails ? (
                                    <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-pink-400" /></div>
                                ) : pregnancyData ? (
                                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase"><span className="text-gray-400">Kondisi</span><span className="text-green-600">AKTIF</span></div>
                                        <div className="pt-3 border-t space-y-3">
                                            <div><p className="text-[9px] text-gray-400 font-bold uppercase">Taksiran Persalinan (HPL)</p><p className="text-xs font-black text-gray-700">{formatDate(pregnancyData.taksiranPersalinan)}</p></div>
                                            <div><p className="text-[9px] text-gray-400 font-bold uppercase">Usia Kehamilan</p><p className="text-xs font-black text-pink-600">{pregnancyData.umurKehamilanMinggu} Minggu</p></div>
                                        </div>
                                    </div>
                                ) : <div className="bg-white/50 p-3 rounded-xl text-center text-[10px] font-bold text-gray-400 uppercase">Tidak sedang hamil</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}