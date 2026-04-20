'use client';

import { useState, useEffect, useMemo } from 'react';
import Card from '@/components/ui/Card';
import {
    FaUserPlus,
    FaUserShield,
    FaWhatsapp,
    FaLock,
    FaUserTag,
    FaMapMarkerAlt,
    FaUserNurse,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function AdminUsersPage() {
    const { user, registerByAdmin } = useAuth(); // Ambil user & fungsi register
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'parent' as 'parent' | 'admin_puskesmas' | 'bidan' | 'admin',
        wilayah: '',
        bidanId: '',
    });

    const [regions, setRegions] = useState<string[]>([]);
    const [allBidans, setAllBidans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Fitur tampilkan password
    const [message, setMessage] = useState({ type: '', text: '' });

    // Helper buat maksa TypeScript mingkem (Brutal Way)
    const currentUserRole = (user?.role as unknown as string);

    // 1. Ambil data Wilayah & Semua Bidan dari Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const regionSnap = await getDocs(query(collection(db, 'regions'), orderBy('name', 'asc')));
                setRegions(regionSnap.docs.map(doc => doc.data().name));

                const bidanQuery = query(collection(db, 'users'), where('role', '==', 'bidan'));
                const bidanSnap = await getDocs(bidanQuery);
                const bidanList = bidanSnap.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));
                setAllBidans(bidanList);
            } catch (err) {
                console.error("Gagal memuat data:", err);
            }
        };
        fetchData();
    }, []);

    // 2. Filter Role berdasarkan siapa yang login
    const rolesOption = useMemo(() => {
        if (currentUserRole === 'admin') return ['admin', 'admin_puskesmas', 'bidan', 'parent'];
        if (currentUserRole === 'admin_puskesmas') return ['bidan', 'parent'];
        if (currentUserRole === 'bidan') return ['parent'];
        return ['parent'];
    }, [currentUserRole]);

    // 3. Filter Bidan berdasarkan wilayah
    const filteredBidans = useMemo(() => {
        const currentWilayah = currentUserRole === 'admin' ? formData.wilayah : user?.wilayah;
        if (!currentWilayah) return [];
        return allBidans.filter(bidan => bidan.wilayah === currentWilayah);
    }, [formData.wilayah, allBidans, user, currentUserRole]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const wilayahFinal = currentUserRole === 'admin' ? formData.wilayah : user?.wilayah;

            await registerByAdmin(
                formData.phone,
                formData.password,
                formData.name,
                formData.role,
                wilayahFinal,
                formData.bidanId
            );

            setMessage({ type: 'success', text: `Berhasil mendaftarkan ${formData.name}!` });
            setFormData({ name: '', phone: '', password: '', role: 'parent', wilayah: '', bidanId: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: "Gagal: " + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 p-4 md:p-0">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2">
                    <span className="h-px w-8 bg-pink-300"></span>
                    <span className="text-xs font-medium uppercase tracking-[0.3em] text-pink-400">
                        Login sebagai: {currentUserRole?.toUpperCase()}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif italic font-semibold text-gray-800 leading-tight">
                    Manajemen <span className="text-pink-400">Pengguna</span>
                </h1>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'} text-sm`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6 md:col-span-2 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h2 className="text-xl font-serif italic font-semibold mb-6 flex items-center gap-2 text-gray-700">
                        <FaUserPlus className="text-pink-400 text-lg" /> Registrasi Akun
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400">Hak Akses</label>
                                <select
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any, bidanId: '', wilayah: '' })}
                                >
                                    {rolesOption.map(r => (
                                        <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400">WhatsApp</label>
                                <input
                                    type="tel"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label className="text-xs font-semibold uppercase text-gray-400">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-gray-400">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* LOGIKA WILAYAH: Hapus Wilayah kalo yang didaftarin Admin Global */}
                        {formData.role !== 'admin' && (
                            currentUserRole === 'admin' ? (
                                <div className="animate-in fade-in duration-300">
                                    <label className="text-xs font-semibold uppercase text-gray-400 ml-1 flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-pink-400 text-xs" /> Wilayah
                                    </label>
                                    <select
                                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300"
                                        value={formData.wilayah}
                                        onChange={e => setFormData({ ...formData, wilayah: e.target.value, bidanId: '' })}
                                        required
                                    >
                                        <option value="">Pilih Wilayah...</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="p-3 bg-gray-100 rounded-xl text-xs text-gray-600">
                                    <FaMapMarkerAlt className="inline mr-2 text-pink-400" />
                                    Wilayah dikunci ke: <strong>{user?.wilayah}</strong>
                                </div>
                            )
                        )}

                        {formData.role === 'parent' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-semibold uppercase text-pink-400">Bidan Penanggung Jawab</label>
                                <select
                                    className="w-full mt-1 p-3 bg-pink-50 border border-pink-100 rounded-xl"
                                    value={formData.bidanId}
                                    onChange={e => setFormData({ ...formData, bidanId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Bidan di {currentUserRole === 'admin' ? formData.wilayah : user?.wilayah} --</option>
                                    {filteredBidans.map((bidan) => (
                                        <option key={bidan.uid} value={bidan.uid}>{bidan.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-all shadow-md disabled:bg-gray-300"
                        >
                            {loading ? 'Sedang Memproses...' : 'Simpan Pengguna Baru'}
                        </button>
                    </form>
                </Card>

                <div className="space-y-6">
                    <div className="p-6 bg-pink-50 border border-pink-100 rounded-2xl">
                        <h2 className="text-lg font-serif italic font-semibold mb-4 flex items-center gap-2 text-pink-700">
                            <FaUserShield /> Aturan Akses
                        </h2>
                        <ul className="text-xs text-pink-800 space-y-3">
                            <li>• <strong>Admin Global:</strong> Kelola semua wilayah.</li>
                            <li>• <strong>Admin Puskesmas:</strong> Kelola Bidan & Orang Tua di wilayahnya.</li>
                            <li>• <strong>Bidan:</strong> Mendaftarkan Orang Tua.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}