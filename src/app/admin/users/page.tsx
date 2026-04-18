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
    FaUserNurse 
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function AdminUsersPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'parent' as 'parent' | 'admin' | 'bidan',
        wilayah: '',
        bidanId: '', // Menyimpan UID Bidan yang bertanggung jawab
    });

    const [regions, setRegions] = useState<string[]>([]);
    const [allBidans, setAllBidans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { registerByAdmin } = useAuth();

    // 1. Ambil data Wilayah & Semua Bidan dari Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch daftar wilayah
                const regionSnap = await getDocs(query(collection(db, 'regions'), orderBy('name', 'asc')));
                setRegions(regionSnap.docs.map(doc => doc.data().name));

                // Fetch semua user yang memiliki role bidan
                const bidanQuery = query(collection(db, 'users'), where('role', '==', 'bidan'));
                const bidanSnap = await getDocs(bidanQuery);
                const bidanList = bidanSnap.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));
                setAllBidans(bidanList);
            } catch (err) {
                console.error("Gagal memuat data pendukung:", err);
            }
        };
        fetchData();
    }, []);

    // 2. Filter Bidan berdasarkan wilayah yang dipilih di form (Client-side filtering)
    const filteredBidans = useMemo(() => {
        if (!formData.wilayah) return [];
        return allBidans.filter(bidan => bidan.wilayah === formData.wilayah);
    }, [formData.wilayah, allBidans]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi: Orang tua wajib punya wilayah dan bidan penanggung jawab
        if (formData.role === 'parent') {
            if (!formData.wilayah) {
                setMessage({ type: 'error', text: 'Pilih wilayah domisili orang tua!' });
                return;
            }
            if (!formData.bidanId) {
                setMessage({ type: 'error', text: 'Pilih Bidan penanggung jawab untuk orang tua ini!' });
                return;
            }
        }

        // Validasi: Bidan wajib punya wilayah
        if (formData.role === 'bidan' && !formData.wilayah) {
            setMessage({ type: 'error', text: 'Tentukan wilayah tugas Bidan!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await registerByAdmin(
                formData.phone,
                formData.password,
                formData.name,
                formData.role,
                formData.wilayah,
                formData.bidanId // Pastikan fungsi di AuthContext sudah menerima parameter ke-6
            );

            setMessage({
                type: 'success',
                text: `Berhasil mendaftarkan ${formData.name} sebagai ${
                    formData.role === 'admin' ? 'Admin' : formData.role === 'bidan' ? 'Bidan' : 'Orang Tua'
                }!`
            });

            // Reset Form
            setFormData({
                name: '',
                phone: '',
                password: '',
                role: 'parent',
                wilayah: '',
                bidanId: '',
            });
        } catch (err: any) {
            setMessage({ type: 'error', text: "Gagal: " + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 p-4 md:p-0">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2">
                    <span className="h-px w-8 bg-pink-300"></span>
                    <span className="text-xs font-medium uppercase tracking-[0.3em] text-pink-400">
                        Administrasi Akun
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif italic font-semibold text-gray-800 leading-tight">
                    Manajemen <span className="text-pink-400">Pengguna</span>
                </h1>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${
                    message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
                } text-sm animate-in fade-in duration-300`}>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{message.type === 'success' ? '✓' : '!'}</span>
                        {message.text}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6 md:col-span-2 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h2 className="text-xl font-serif italic font-semibold mb-6 flex items-center gap-2 text-gray-700">
                        <FaUserPlus className="text-pink-400 text-lg" /> Form Registrasi Akun
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400 ml-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 text-gray-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400 ml-1 flex items-center gap-1">
                                    <FaUserTag className="text-pink-400 text-xs" /> Hak Akses
                                </label>
                                <select
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer focus:ring-1 focus:ring-pink-300 text-gray-700"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any, bidanId: '' })}
                                >
                                    <option value="parent">Orang Tua (Pasien)</option>
                                    <option value="bidan">Bidan (Petugas Wilayah)</option>
                                    <option value="admin">Admin Puskesmas</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400 ml-1 flex items-center gap-1">
                                    <FaWhatsapp className="text-pink-400 text-xs" /> Nomor WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="08..."
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 text-gray-700"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-gray-400 ml-1 flex items-center gap-1">
                                    <FaLock className="text-gray-400 text-xs" /> Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 text-gray-700"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* INPUT WILAYAH */}
                        <div>
                            <label className="text-xs font-semibold uppercase text-gray-400 ml-1 flex items-center gap-1">
                                <FaMapMarkerAlt className="text-pink-400 text-xs" /> Wilayah Tugas / Domisili
                            </label>
                            <select
                                className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer focus:ring-1 focus:ring-pink-300 text-gray-700"
                                value={formData.wilayah}
                                onChange={e => setFormData({ ...formData, wilayah: e.target.value, bidanId: '' })}
                                required={formData.role !== 'admin'}
                            >
                                <option value="">Pilih Wilayah...</option>
                                {regions.map((region) => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        {/* SELEKSI BIDAN PENANGGUNG JAWAB (Hanya muncul jika role = parent) */}
                        {formData.role === 'parent' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-semibold uppercase text-pink-400 ml-1 flex items-center gap-1">
                                    <FaUserNurse className="text-xs" /> Bidan Penanggung Jawab
                                </label>
                                <select
                                    className="w-full mt-1 p-3 bg-pink-50 border border-pink-100 rounded-xl cursor-pointer focus:ring-1 focus:ring-pink-300 text-gray-700"
                                    value={formData.bidanId}
                                    onChange={e => setFormData({ ...formData, bidanId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Bidan di {formData.wilayah || 'Wilayah Terpilih'} --</option>
                                    {filteredBidans.map((bidan) => (
                                        <option key={bidan.uid} value={bidan.uid}>
                                            {bidan.name}
                                        </option>
                                    ))}
                                </select>
                                {formData.wilayah && filteredBidans.length === 0 && (
                                    <p className="mt-2 text-[10px] text-red-500 italic">
                                        * Tidak ada bidan terdaftar di wilayah ini. Silakan daftarkan bidan terlebih dahulu.
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-all shadow-md disabled:bg-pink-200 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sedang Memproses...' : 'Daftarkan Pengguna Baru'}
                        </button>
                    </form>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="p-6 bg-pink-50 border border-pink-100 rounded-2xl">
                        <h2 className="text-lg font-serif italic font-semibold mb-4 flex items-center gap-2 text-pink-700">
                            <FaUserShield /> Aturan Struktur
                        </h2>
                        <div className="space-y-4 text-xs text-pink-800 leading-relaxed">
                            <p>
                                <strong>Bidan:</strong> Wajib ditugaskan ke satu wilayah. Akun bidan harus ada sebelum mendaftarkan orang tua di wilayah tersebut.
                            </p>
                            <p>
                                <strong>Orang Tua:</strong> Akan terhubung langsung dengan Bidan penanggung jawab berdasarkan wilayah domisili mereka.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}