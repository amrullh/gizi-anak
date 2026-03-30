'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                ...formData,
                updatedAt: new Date(),
            });
            // LANGSUNG TEMBAK KE DASHBOARD
            router.replace('/parent/dashboard');
        } catch (error) {
            alert("Gagal menyimpan data dasar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-black text-gray-800 mb-2">Lengkapi Data Akun</h1>
            <p className="text-gray-500 mb-8">Hanya butuh nama dan nomor telepon untuk akses sistem.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 border-none shadow-sm">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-pink-500 transition-all"
                                placeholder="Nama Anda"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Nomor Telepon (WhatsApp)</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-pink-500 transition-all"
                                placeholder="0812..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Alamat Domisili</label>
                            <textarea
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-pink-500 transition-all h-32"
                                placeholder="Alamat lengkap"
                            />
                        </div>
                    </div>
                </Card>

                <Button type="submit" fullWidth className="h-16 rounded-2xl text-lg font-black shadow-xl" disabled={loading}>
                    {loading ? 'MEMPROSES...' : 'LANJUT KE DASHBOARD'}
                </Button>
            </form>
        </div>
    );
}