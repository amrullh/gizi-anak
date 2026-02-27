'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ phone: '', address: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                phone: form.phone,
                address: form.address,
            });
            router.push('/parent/dashboard');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 shadow-2xl border-0 relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-100 rounded-full opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full mb-4 shadow-lg">
                            <span className="text-white text-3xl font-bold">✨</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Lengkapi Profil</h1>
                        <p className="text-gray-600 mt-2">Hanya sekali aja, biar kami kenal kamu lebih dekat</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FaPhone className="mr-2 text-pink-500" />
                                Nomor Telepon
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="input-field w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                placeholder="0812 3456 7890"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-pink-500" />
                                Alamat Lengkap
                            </label>
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="input-field w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                rows={4}
                                placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                    Menyimpan...
                                </div>
                            ) : (
                                'Simpan & Lanjutkan'
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-6">
                        Data kamu aman dan hanya digunakan untuk kepentingan pemantauan gizi
                    </p>
                </div>
            </Card>
        </div>
    );
}