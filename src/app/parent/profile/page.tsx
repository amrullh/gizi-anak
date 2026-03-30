'use client';

import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaBirthdayCake, FaSignOutAlt } from 'react-icons/fa';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Profil Saya</h1>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-700 transition"
                >
                    <FaSignOutAlt /> Keluar
                </button>
            </div>

            {/* Avatar & Ringkasan */}
            <Card className="p-8 text-center bg-gradient-to-b from-white to-pink-50/30">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{user?.name || '-'}</h2>
                <p className="text-gray-500 font-medium">Orang Tua / Wali</p>
            </Card>

            {/* Informasi Kontak & Alamat */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-3">
                    <FaUser className="text-pink-500" />
                    Informasi Akun
                </h2>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                            <FaEnvelope />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Alamat Email</p>
                            <p className="font-semibold text-gray-700">{user?.email || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                            <FaPhone />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nomor Telepon</p>
                            <p className="font-semibold text-gray-700">{user?.phone || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                            <FaBirthdayCake />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tempat, Tanggal Lahir</p>
                            <p className="font-semibold text-gray-700">{user?.ttl || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Alamat Lengkap</p>
                            <p className="font-semibold text-gray-700 leading-relaxed">{user?.address || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <Button fullWidth variant="outline" onClick={() => window.location.href = '/parent/complete-profile'}>
                        Ubah Profil
                    </Button>
                </div>
            </Card>

            <div className="text-center">
                <p className="text-xs text-gray-400">
                    ID Pengguna: {user?.uid}
                </p>
            </div>
        </div>
    );
}