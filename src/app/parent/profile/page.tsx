'use client';

import { useAuth } from '@/context/AuthContext';
import { usePregnancy } from '@/hooks/usePregnancy';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FaEdit, FaVenusMars, FaBaby, FaWeight, FaRulerVertical, FaTint, FaArrowsAlt } from 'react-icons/fa';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const { pregnancy, loading: pregLoading } = usePregnancy();

    if (authLoading || pregLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Profil Saya</h1>

            {/* Data Diri */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaVenusMars className="text-pink-500" />
                    Data Diri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Nama</p>
                        <p className="font-medium">{user?.name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Telepon</p>
                        <p className="font-medium">{user?.phone || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Alamat</p>
                        <p className="font-medium">{user?.address || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">TTL (Tempat, Tanggal Lahir)</p>
                        <p className="font-medium">{user?.ttl || '-'}</p>
                    </div>
                </div>
            </Card>

            {/* Data Gizi Ibu */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaWeight className="text-pink-500" />
                    Asesmen Gizi
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-pink-50 p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-500">Berat Badan</p>
                        <p className="text-2xl font-bold text-pink-600">{user?.beratBadan ?? '-'} kg</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-500">Tinggi Badan</p>
                        <p className="text-2xl font-bold text-blue-600">{user?.tinggiBadan ?? '-'} cm</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-500">Hb</p>
                        <p className="text-2xl font-bold text-red-600">{user?.hb ?? '-'} g/dL</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-500">LILA</p>
                        <p className="text-2xl font-bold text-green-600">{user?.lila ?? '-'} cm</p>
                    </div>
                </div>
            </Card>

            {/* Data Kehamilan (jika ada) */}
            {user?.isPregnant ? (
                <Card className="p-6 border-pink-200 bg-pink-50/30">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FaBaby className="text-pink-500" />
                            Data Kehamilan
                        </h2>
                        <Link href="/parent/pregnancy">
                            <Button variant="outline">
                                <FaEdit className="mr-2" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                    {pregnancy ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Kehamilan ke-</p>
                                <p className="font-medium">{pregnancy.kehamilanKe}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jumlah Anak Hidup</p>
                                <p className="font-medium">{pregnancy.jumlahAnakHidup}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pernah Abortus</p>
                                <p className="font-medium">{pregnancy.pernahAbortus ? `Ya, anak ke-${pregnancy.abortusAnakKe}` : 'Tidak'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">HPHT</p>
                                <p className="font-medium">{pregnancy.hpht?.toLocaleDateString('id-ID') || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Taksiran Persalinan</p>
                                <p className="font-medium">{pregnancy.taksiranPersalinan?.toLocaleDateString('id-ID') || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Umur Kehamilan</p>
                                <p className="font-medium">{pregnancy.umurKehamilanMinggu} minggu</p>
                            </div>
                            {pregnancy.keluhanTrimester1 && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Keluhan Trimester I</p>
                                    <p className="font-medium">{pregnancy.keluhanTrimester1}</p>
                                </div>
                            )}
                            {pregnancy.keluhanTrimester2 && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Keluhan Trimester II</p>
                                    <p className="font-medium">{pregnancy.keluhanTrimester2}</p>
                                </div>
                            )}
                            {pregnancy.keluhanTrimester3 && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Keluhan Trimester III</p>
                                    <p className="font-medium">{pregnancy.keluhanTrimester3}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">Data kehamilan belum lengkap. Silakan edit.</p>
                    )}
                </Card>
            ) : (
                <Card className="p-6 border-dashed border-2 border-gray-200 bg-gray-50">
                    <div className="text-center py-4">
                        <FaBaby className="text-4xl text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Data Kehamilan</h3>
                        <p className="text-sm text-gray-500 mb-4">Jika Anda sedang hamil, silakan isi data kehamilan.</p>
                        <Link href="/parent/pregnancy">
                            <Button>Isi Data Ibu dan kehamilan</Button>
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}