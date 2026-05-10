"use client";

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase/client';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
    uid: string;
    name: string;
    phone: string;
    role: string;
    wilayah?: string;
}

export default function UserManagementPage() {
    // 1. Ambil 'loading' dari AuthContext untuk mencegah pengecekan prematur
    const { user: currentUser, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    // 2. Fetch data user secara real-time
    useEffect(() => {
        // Hanya fetch jika auth sudah selesai dan user adalah admin
        if (!authLoading && currentUser?.role === 'admin') {
            const q = query(collection(db, 'users'), orderBy('name', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const usersData = snapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                })) as UserData[];
                setUsers(usersData);
                setDataLoading(false);
            }, (error) => {
                console.error("Firestore Error:", error);
                setDataLoading(false);
            });
            return () => unsubscribe();
        }
    }, [authLoading, currentUser]);

    // 3. Logika Pencarian yang dioptimalkan
    // Perbaikan Logika Pencarian: Menambahkan pengecekan keberadaan properti (Optional Chaining & Fallback)
    const filteredUsers = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim();

        return users.filter(u => {
            // Pastikan properti ada sebelum melakukan operasi string, jika tidak ada gunakan string kosong ""
            const name = (u.name || "").toLowerCase();
            const phone = (u.phone || "");
            const wilayah = (u.wilayah || "").toLowerCase();
            const role = (u.role || "").toLowerCase();

            return (
                name.includes(lowerSearch) ||
                phone.includes(lowerSearch) ||
                wilayah.includes(lowerSearch) ||
                role.includes(lowerSearch)
            );
        });
    }, [users, searchTerm]);

    // 4. Proteksi Render: Tangani status Loading Auth
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFCF0]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Memverifikasi Sesi Admin...</p>
            </div>
        );
    }

    // 5. Proteksi Render: Tangani Akses Ditolak
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FDFCF0] p-6">
                <Card className="max-w-md p-8 text-center border-red-100">
                    <div className="text-5xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-500 mb-6">Halaman ini hanya dapat diakses oleh Administrator MONIKEL.</p>
                    <Button onClick={() => window.location.href = '/'} className="bg-green-600 text-white w-full">
                        Kembali ke Beranda
                    </Button>
                </Card>
            </div>
        );
    }

    const handleUpdateName = async (uid: string, newName: string) => {
        const trimmedName = newName.trim();
        if (!trimmedName || !uid) {
            setEditingUser(null);
            return;
        }

        try {
            await updateDoc(doc(db, 'users', uid), {
                name: trimmedName,
                updatedAt: new Date()
            });
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert('Gagal memperbarui nama. Pastikan koneksi internet stabil.');
        }
    };

    const handleDeleteAccount = async (uid: string) => {
        if (window.confirm("Hapus akun ini secara permanen?")) {
            try {
                const firebaseUser = auth.currentUser;
                if (!firebaseUser) return;

                const token = await firebaseUser.getIdToken();

                const response = await fetch(`/api/admin/delete-user?uid=${uid}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Akun berhasil dihapus total!');
                } else {
                    // PENANGANAN KHUSUS ERROR TERSEBUT
                    if (result.error.includes("no user record")) {
                        if (window.confirm("User tidak ditemukan di Authentication (sudah terhapus). Hapus sisa data di Database saja?")) {
                            // Langsung hapus dari Firestore jika Auth sudah tidak ada
                            await deleteDoc(doc(db, 'users', uid));
                            alert("Data profil berhasil dibersihkan.");
                        }
                    } else {
                        alert(`Gagal: ${result.error}`);
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                alert('Terjadi kesalahan koneksi.');
            }
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Akun Pengguna</h1>
                <p className="text-gray-500">
                    {dataLoading ? "Memuat data..." : `Total: ${filteredUsers.length} pengguna ditemukan`}
                </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="mb-6 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Cari nama, HP, wilayah, atau role..."
                    className="w-full md:w-1/2 pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 md:right-1/2 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredUsers.map((u) => (
                        <motion.div
                            key={u.uid}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="p-5 border-none shadow-sm hover:shadow-md transition-all bg-white border-l-4 border-l-transparent hover:border-l-green-500">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        {editingUser?.uid === u.uid ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        className="text-lg font-bold border-b-2 border-green-500 outline-none bg-green-50 px-2 py-1 rounded-t w-full max-w-sm"
                                                        defaultValue={u.name}
                                                        autoFocus
                                                        onBlur={(e) => handleUpdateName(u.uid, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateName(u.uid, e.currentTarget.value);
                                                            if (e.key === 'Escape') setEditingUser(null);
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-green-600 font-bold">Tekan ENTER untuk simpan • ESC untuk batal</span>
                                            </div>
                                        ) : (
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                                                {u.name.toUpperCase()}
                                                <span className={`text-[9px] tracking-wider px-2 py-0.5 rounded-md font-black uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' :
                                                    u.role === 'bidan' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </h3>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="opacity-60">📞 {u.phone}</span>
                                            <span className="opacity-60">•</span>
                                            <span className="opacity-60">📍 {u.wilayah || 'WILAYAH TIDAK TERDAFTAR'}</span>
                                        </p>
                                    </div>

                                    {/* Letakkan di dalam Card, biasanya di samping tombol EDIT NAMA */}
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingUser(u)}
                                            className="flex-1 md:flex-none text-blue-600 border-blue-100 hover:bg-blue-50 py-2.5 rounded-xl font-bold"
                                        >
                                            EDIT NAMA
                                        </Button>

                                        {/* Tombol Hapus dengan proteksi diri sendiri */}
                                        {u.uid !== currentUser?.uid && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDeleteAccount(u.uid)}
                                                className="flex-1 md:flex-none text-red-600 border-red-100 hover:bg-red-50 py-2.5 rounded-xl font-bold"
                                            >
                                                HAPUS
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {!dataLoading && filteredUsers.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 mt-4"
                >
                    <div className="text-6xl mb-6 opacity-20">🔍</div>
                    <p className="text-gray-400 font-medium text-lg">
                        Tidak ditemukan pengguna dengan kata kunci <br />
                        <span className="text-gray-600 font-bold">"{searchTerm}"</span>
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6 border-green-200 text-green-600 hover:bg-green-50 px-8"
                        onClick={() => setSearchTerm('')}
                    >
                        Bersihkan Pencarian
                    </Button>
                </motion.div>
            )}
        </div>
    );
}