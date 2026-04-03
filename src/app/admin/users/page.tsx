'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUserPlus, FaUserShield, FaWhatsapp, FaLock, FaUserTag, FaSeedling } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'parent' as 'parent' | 'admin',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { registerByAdmin } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await registerByAdmin(
                formData.phone,
                formData.password,
                formData.name,
                formData.role
            );

            setMessage({
                type: 'success',
                text: `Berhasil mendaftarkan ${formData.name} sebagai ${formData.role === 'admin' ? 'Admin' : 'Orang Tua'}!`
            });

            setFormData({
                name: '',
                phone: '',
                password: '',
                role: 'parent',
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
            <div className="flex flex-col gap-2 border-b border-tan/20 pb-6">
                <div className="flex items-center gap-2">
                    <span className="h-px w-8 bg-clay/40"></span>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-clay/60">
                        Administrasi Akun
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif italic font-black text-moss leading-tight">
                    Manajemen <span className="text-clay/50">Pengguna</span>
                </h1>
                <p className="text-moss/50 max-w-xl">Daftarkan akun petugas Puskesmas atau Orang Tua secara manual untuk sinkronisasi data monitoring.</p>
            </div>

            {message.text && (
                <div className={`p-5 rounded-3xl border-2 animate-in fade-in slide-in-from-top-4 duration-500 font-bold text-sm ${message.type === 'success'
                    ? 'bg-sage/10 border-sage/20 text-moss'
                    : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-moss text-white' : 'bg-red-500 text-white'}`}>
                            {message.type === 'success' ? '✓' : '!'}
                        </div>
                        {message.text}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-10">
                {/* Form Registrasi */}
                <Card className="p-8 md:col-span-2 shadow-2xl shadow-moss/5 border-tan/20 rounded-[40px] bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <h2 className="text-2xl font-serif italic font-bold mb-8 flex items-center gap-3 text-moss relative z-10">
                        <FaUserPlus className="text-clay" /> Form Registrasi Akun
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-moss/40 ml-1">Nama Lengkap</label>
                            <input
                                type="text"
                                placeholder="Nama sesuai identitas petugas/ortu"
                                className="w-full p-4 bg-cream/30 border border-tan/30 rounded-2xl outline-none focus:ring-2 focus:ring-moss focus:border-transparent transition-all font-medium text-moss placeholder:text-moss/20"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-moss/40 ml-1 flex items-center gap-2">
                                    <FaWhatsapp className="text-moss" /> Nomor WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 08123456789"
                                    className="w-full p-4 bg-cream/30 border border-tan/30 rounded-2xl outline-none focus:ring-2 focus:ring-moss focus:border-transparent transition-all font-medium text-moss placeholder:text-moss/20"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-moss/40 ml-1 flex items-center gap-2">
                                    <FaLock className="text-moss/30" /> Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Min. 6 Karakter"
                                    className="w-full p-4 bg-cream/30 border border-tan/30 rounded-2xl outline-none focus:ring-2 focus:ring-moss focus:border-transparent transition-all font-medium text-moss placeholder:text-moss/20"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-moss/40 ml-1 flex items-center gap-2">
                                <FaUserTag className="text-clay" /> Hak Akses (Role)
                            </label>
                            <select
                                className="w-full p-4 bg-cream/30 border border-tan/30 rounded-2xl outline-none focus:ring-2 focus:ring-moss focus:border-transparent transition-all font-bold text-moss cursor-pointer appearance-none"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <option value="parent">Orang Tua (Akses Monitoring Anak)</option>
                                <option value="admin">Admin Puskesmas (Akses Dashboard Penuh)</option>
                            </select>
                        </div>

                        <div className="pt-6">
                            {/* FIX BUTTON: Background Moss Green pekat agar tidak pink */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-full bg-[#1A2A1A] hover:bg-moss text-white font-bold tracking-wide transition-all shadow-xl shadow-moss/20 active:scale-[0.98] disabled:bg-moss/50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Memproses Pendaftaran...' : 'Daftarkan Akun Sekarang'}
                            </button>
                        </div>
                    </form>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* FIX CARD: Background dipastikan Hijau Moss pekat agar teks terlihat */}
                    <div className="p-8 bg-[#1A2A1A] text-white border-none shadow-2xl shadow-moss/20 rounded-[40px] relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-clay/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                        <h2 className="text-xl font-serif italic font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                            <FaUserShield className="text-clay" /> Keamanan Akun
                        </h2>
                        <ul className="text-sm text-white/90 space-y-4 relative z-10 leading-relaxed font-medium">
                            <li className="flex gap-3">
                                <span className="text-clay font-bold">•</span>
                                <span><strong>WhatsApp ID</strong> sebagai identitas masuk sistem.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-clay font-bold">•</span>
                                <span>Role <strong>Admin</strong> memiliki akses penuh dashboard.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-clay font-bold">•</span>
                                <span>Role <strong>Orang Tua</strong> hanya melihat data anak mereka.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-clay font-bold">•</span>
                                <span>Serahkan password ke pengguna secara mandiri.</span>
                            </li>
                        </ul>
                    </div>

                    <Card className="p-8 bg-sage/10 border-2 border-sage/20 shadow-none rounded-[40px] flex items-start gap-4">
                        <FaSeedling className="text-moss text-2xl mt-1 shrink-0" />
                        <p className="text-sm text-moss/60 font-serif italic leading-relaxed">
                            "Pendaftaran manual mempermudah bidan dalam mendampingi orang tua yang belum akrab dengan registrasi digital mandiri."
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}