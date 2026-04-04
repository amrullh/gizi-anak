'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { FaUserPlus, FaUserShield, FaWhatsapp, FaLock, FaUserTag, FaSeedling, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client'; // Pastikan import db dari client
import { collection, getDocs } from 'firebase/firestore';

export default function AdminUsersPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'parent' as 'parent' | 'admin' | 'bidan', // Tambah role bidan
        wilayah: '', // Field wilayah baru
    });

    const [regions, setRegions] = useState<string[]>([]); // State untuk list wilayah
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { registerByAdmin } = useAuth();

    // Ambil daftar wilayah dari Firestore saat page load
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const snap = await getDocs(collection(db, 'regions'));
                const list = snap.docs.map(doc => doc.data().name);
                setRegions(list);
            } catch (err) {
                console.error("Gagal mengambil wilayah:", err);
            }
        };
        fetchRegions();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi: Admin & Bidan wajib punya wilayah (kecuali admin pusat jika mau dikosongkan)
        if (formData.role !== 'admin' && !formData.wilayah) {
            setMessage({ type: 'error', text: 'Silakan pilih wilayah terlebih dahulu!' });
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
                formData.wilayah // Kirim data wilayah ke fungsi registrasi
            );

            setMessage({
                type: 'success',
                text: `Berhasil mendaftarkan ${formData.name} sebagai ${formData.role === 'admin' ? 'Admin' : formData.role === 'bidan' ? 'Bidan' : 'Orang Tua'
                    }!`
            });

            setFormData({
                name: '',
                phone: '',
                password: '',
                role: 'parent',
                wilayah: '',
            });
        } catch (err: any) {
            setMessage({ type: 'error', text: "Gagal: " + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 p-4 md:p-0">
            {/* Header Section */}
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
                <p className="text-gray-400 max-w-xl text-sm">
                    Daftarkan akun Admin, Bidan, atau Orang Tua dan tautkan ke wilayah tugas masing-masing.
                </p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-green-50 border-green-100 text-green-700'
                    : 'bg-red-50 border-red-100 text-red-600'
                    } text-sm`}>
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
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Nama lengkap"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-gray-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1">
                                    <FaUserTag className="text-pink-400 text-xs" /> Hak Akses
                                </label>
                                <select
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-gray-700 cursor-pointer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="parent">Orang Tua</option>
                                    <option value="bidan">Bidan (Petugas Wilayah)</option>
                                    <option value="admin">Admin Puskesmas</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1">
                                    <FaWhatsapp className="text-pink-400 text-xs" /> Nomor WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="08123456789"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-gray-700"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1">
                                    <FaLock className="text-gray-400 text-xs" /> Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Min. 6 karakter"
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-gray-700"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* INPUT WILAYAH BARU */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1">
                                <FaMapMarkerAlt className="text-pink-400 text-xs" /> Wilayah / Posyandu
                            </label>
                            <select
                                className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-gray-700 cursor-pointer"
                                value={formData.wilayah}
                                onChange={e => setFormData({ ...formData, wilayah: e.target.value })}
                                required={formData.role !== 'admin'} // Admin pusat boleh kosong wilayahnya
                            >
                                <option value="">Pilih Wilayah...</option>
                                {regions.map((region) => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-[10px] text-gray-400 italic">
                                * Data wilayah diambil dari Menu "Kelola Wilayah"
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium transition-all shadow-sm disabled:bg-pink-200 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memproses...' : 'Daftarkan Akun'}
                        </button>
                    </form>
                </Card>

                <div className="space-y-6">
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                        <h2 className="text-lg font-serif italic font-semibold mb-4 flex items-center gap-2 text-gray-700">
                            <FaUserShield className="text-pink-400" /> Aturan Role
                        </h2>
                        <ul className="text-xs text-gray-500 space-y-3">
                            <li className="flex gap-2">
                                <span className="text-pink-400">•</span>
                                <span><strong>Bidan</strong>: Hanya dapat melihat data Ibu & Anak di wilayah pilihannya.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-pink-400">•</span>
                                <span><strong>Orang Tua</strong>: Harus ditautkan ke wilayah agar dipantau bidan setempat.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}