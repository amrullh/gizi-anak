'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUser, FaWhatsapp, FaMapMarkerAlt, FaHome, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function CompleteProfilePage() {
    const { user, updateUser, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        wilayah: '',
        address: '',
        ttl: ''
    });

    const [regions, setRegions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchingRegions, setFetchingRegions] = useState(true);

    // 1. Ambil data awal user jika sudah ada & ambil daftar wilayah
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                wilayah: user.wilayah || '',
                address: user.address || '',
                ttl: user.ttl || ''
            });
        }

        const fetchRegions = async () => {
            try {
                const snap = await getDocs(collection(db, 'regions'));
                const list = snap.docs.map(doc => doc.data().name);
                setRegions(list);
            } catch (err) {
                console.error("Gagal memuat wilayah:", err);
            } finally {
                setFetchingRegions(false);
            }
        };
        fetchRegions();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.wilayah) return alert("Silakan pilih wilayah domisili Anda.");

        setIsSubmitting(true);
        try {
            await updateUser({
                name: formData.name,
                phone: formData.phone,
                wilayah: formData.wilayah,
                address: formData.address,
                ttl: formData.ttl,
                updatedAt: new Date() // Sesuai tipe data di context
            } as any);

            alert("Profil berhasil dilengkapi!");
            router.push('/parent/dashboard');
        } catch (error) {
            console.error(error);
            alert("Gagal memperbarui profil.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || fetchingRegions) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <FaSpinner className="animate-spin text-pink-500" size={32} />
                <p className="text-gray-400 font-bold text-xs uppercase">Menyiapkan Form...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-xl mx-auto space-y-6">
                <header className="text-center space-y-2">
                    <div className="w-16 h-16 bg-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-pink-200 rotate-3">
                        <FaUser size={28} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Lengkapi Profil</h1>
                    <p className="text-gray-500 text-sm">Data ini diperlukan agar Bidan wilayah dapat memantau kesehatan Anda dan anak.</p>
                </header>

                <Card className="p-8 border-t-4 border-pink-500">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nama */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Nama Lengkap Bunda/Ayah</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                                    placeholder="Contoh: Siti Aminah"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Nomor WhatsApp Aktif</label>
                            <div className="relative">
                                <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" />
                                <input
                                    type="tel"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                                    placeholder="08123456789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Wilayah */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Pilih Wilayah Domisili</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" />
                                <select
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 transition-all appearance-none"
                                    value={formData.wilayah}
                                    onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                                >
                                    <option value="">-- Pilih Wilayah --</option>
                                    {regions.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Alamat Lengkap */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Alamat Lengkap</label>
                            <div className="relative">
                                <FaHome className="absolute left-4 top-4 text-gray-300" />
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                                    placeholder="Nama jalan, nomor rumah, RT/RW..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isSubmitting}
                            className="py-4 bg-pink-500 hover:bg-pink-600 text-white font-black shadow-lg shadow-pink-100"
                        >
                            {isSubmitting ? <FaSpinner className="animate-spin mx-auto" /> : "SIMPAN & LANJUTKAN"}
                        </Button>
                    </form>
                </Card>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                    <FaCheckCircle className="text-blue-500 mt-1 shrink-0" />
                    <p className="text-[10px] text-blue-700 leading-relaxed italic">
                        Pastikan data wilayah benar agar Anda mendapatkan informasi edukasi dan jadwal posyandu yang sesuai dengan lokasi tempat tinggal Anda.
                    </p>
                </div>
            </div>
        </div>
    );
}