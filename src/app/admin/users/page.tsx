'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUserPlus, FaUserShield, FaWhatsapp, FaLock, FaUserTag } from 'react-icons/fa';
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
            // Memanggil fungsi registerByAdmin (Nomor HP akan dikonversi ke email virtual di AuthContext)
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

            // Reset form setelah berhasil
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
        <div className="space-y-6 p-4 md:p-0">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-gray-800">Manajemen Pengguna</h1>
                <p className="text-gray-500">Daftarkan akun Admin Puskesmas atau Orang Tua secara manual.</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {/* Form Registrasi */}
                <Card className="p-6 md:col-span-2 shadow-sm border-gray-100">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FaUserPlus className="text-pink-600" /> Form Registrasi Akun
                    </h2>
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <FaWhatsapp className="text-green-500" /> Nomor WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 08123456789"
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <FaLock className="text-gray-400" /> Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Min. 6 Karakter"
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <FaUserTag className="text-blue-500" /> Hak Akses (Role)
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 bg-white transition cursor-pointer"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <option value="parent">Orang Tua (Parent)</option>
                                <option value="admin">Admin Puskesmas (Full Access)</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Sekarang'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-4">
                    <Card className="p-6 bg-blue-50 border-blue-100 shadow-none">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-700">
                            <FaUserShield /> Keamanan Akun
                        </h2>
                        <ul className="text-sm text-blue-600 space-y-3 list-disc ml-4 leading-relaxed">
                            <li><strong>Nomor WhatsApp</strong> digunakan sebagai ID untuk masuk (Login).</li>
                            <li>Gunakan format nomor standar (misal: 081234...).</li>
                            <li>Role <strong>Admin</strong> memiliki akses penuh ke laporan dan artikel.</li>
                            <li>Role <strong>Orang Tua</strong> hanya bisa melihat data anak mereka sendiri.</li>
                            <li>Jangan lupa memberikan password kepada pengguna setelah Anda mendaftarkannya.</li>
                        </ul>
                    </Card>

                    <Card className="p-6 bg-pink-50 border-pink-100 shadow-none">
                        <p className="text-sm text-pink-600 font-medium italic">
                            "Pendaftaran manual membantu menjangkau orang tua yang memiliki keterbatasan akses teknologi."
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}