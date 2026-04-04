'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUser, FaPhone, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

export default function CompleteProfilePage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingRegions, setFetchingRegions] = useState(true);
    const [regions, setRegions] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        wilayah: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                wilayah: user.wilayah || '',
            });
        }

        const fetchRegions = async () => {
            try {
                const snap = await getDocs(collection(db, 'regions'));
                setRegions(snap.docs.map(doc => doc.data().name));
            } catch (err) {
                console.error("Gagal load wilayah");
            } finally {
                setFetchingRegions(false);
            }
        };
        fetchRegions();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.wilayah) return;
        setLoading(true);
        try {
            await updateUser({
                name: formData.name,
                phone: formData.phone,
                wilayah: formData.wilayah,
            });
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
            <p className="text-gray-500 mb-8">Pilih wilayah posyandu Anda untuk pemantauan kesehatan anak.</p>

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
                            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Wilayah / Posyandu</label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.wilayah}
                                    onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                                    className="w-full p-4 border-2 rounded-2xl outline-none focus:border-pink-500 transition-all appearance-none bg-white"
                                >
                                    <option value="">{fetchingRegions ? 'Memuat wilayah...' : 'Pilih Wilayah'}</option>
                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Button type="submit" fullWidth className="h-16 rounded-2xl text-lg font-black shadow-xl" disabled={loading || fetchingRegions}>
                    {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'LANJUT KE DASHBOARD'}
                </Button>
            </form>
        </div>
    );
}