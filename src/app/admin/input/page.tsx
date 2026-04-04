'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaBaby, FaSpinner, FaArrowLeft, FaEdit, FaHistory, FaWeight, FaRulerVertical, FaCalendarAlt } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useChildren } from '@/hooks/useChildren';
import { useGrowthRecords } from '@/hooks/useGrowthRecords';
import { useAuth } from '@/context/AuthContext'; // Import useAuth untuk akses data bidan

export default function AdminInputPage() {
    const { user: currentUser } = useAuth(); // Ambil data user yang sedang login
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Navigasi State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [view, setView] = useState<'list' | 'input-anak'>('list');

    // State untuk Anak & Pertumbuhan
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [editingChild, setEditingChild] = useState<any>(null);

    // Hooks
    const { children, addChild, updateChild, loading: loadingChildren } = useChildren(selectedUser?.id);
    const { records: growthRecords, addRecord, loading: loadingGrowth } = useGrowthRecords(selectedChildId || undefined);

    // Form States
    const [childForm, setChildForm] = useState({ name: '', birthDate: '', gender: 'male' });
    const [growthForm, setGrowthForm] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        notes: ''
    });

    const fetchParents = async (searchQuery: string = '') => {
        if (!currentUser) return; // Pastikan user sudah terload
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');

            // LOGIKA REVISI: Filter berdasarkan role dan wilayah
            let q;
            if (currentUser.role === 'bidan' && currentUser.wilayah) {
                // Jika Bidan: Filter berdasarkan role 'parent' DAN wilayah yang sama
                q = query(
                    usersRef,
                    where('role', '==', 'parent'),
                    where('wilayah', '==', currentUser.wilayah),
                    where('name', '>=', searchQuery),
                    where('name', '<=', searchQuery + '\uf8ff'),
                    orderBy('name'),
                    limit(20)
                );
            } else {
                // Jika Admin: Filter semua parent tanpa batasan wilayah
                q = query(
                    usersRef,
                    where('role', '==', 'parent'),
                    where('name', '>=', searchQuery),
                    where('name', '<=', searchQuery + '\uf8ff'),
                    orderBy('name'),
                    limit(20)
                );
            }

            const snap = await getDocs(q);
            setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch data saat komponen dimuat atau user login berubah
    useEffect(() => {
        if (currentUser) fetchParents();
    }, [currentUser]);

    // HANDLE: Save Profil Anak (Tambah/Update)
    const handleSaveChildProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingChild) {
                await updateChild(editingChild.id, {
                    name: childForm.name,
                    birthDate: new Date(childForm.birthDate),
                    gender: childForm.gender as 'male' | 'female',
                });
                alert('Profil anak berhasil diupdate!');
            } else {
                await addChild({
                    name: childForm.name,
                    birthDate: new Date(childForm.birthDate),
                    gender: childForm.gender as 'male' | 'female',
                });
                alert('Anak baru berhasil terdaftar!');
            }
            setChildForm({ name: '', birthDate: '', gender: 'male' });
            setEditingChild(null);
        } catch (err) { alert('Gagal menyimpan profil'); }
    };

    // HANDLE: Save Pengukuran BB/TB Baru
    const handleAddGrowth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChildId) return;
        try {
            await addRecord({
                childId: selectedChildId,
                date: new Date(growthForm.date),
                weight: parseFloat(growthForm.weight),
                height: parseFloat(growthForm.height),
                notes: growthForm.notes || "-",
            });
            alert('Data pertumbuhan berhasil dicatat!');
            setGrowthForm({ date: new Date().toISOString().split('T')[0], weight: '', height: '', notes: '' });
        } catch (err) { alert('Gagal menyimpan riwayat gizi'); }
    };

    // VIEW: DETAIL KELOLA ANAK
    if (view === 'input-anak') return (
        <div className="space-y-6">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                <FaArrowLeft /> Kembali ke Daftar Orang Tua
            </button>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* KOLOM KIRI: UPDATE PROFIL ANAK */}
                <div className="space-y-4">
                    <Card className={editingChild ? "border-amber-200 bg-amber-50" : "bg-blue-50 border-blue-100"}>
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <FaBaby className="text-blue-600" /> {editingChild ? `Edit Profil: ${editingChild.name}` : 'Daftarkan Anak Baru'}
                        </h3>
                        <form onSubmit={handleSaveChildProfile} className="space-y-3">
                            <input type="text" placeholder="Nama Lengkap" value={childForm.name} onChange={e => setChildForm({ ...childForm, name: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none" required />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" value={childForm.birthDate} onChange={e => setChildForm({ ...childForm, birthDate: e.target.value })} className="p-3 border rounded-xl bg-white outline-none" required />
                                <select value={childForm.gender} onChange={e => setChildForm({ ...childForm, gender: e.target.value })} className="p-3 border rounded-xl bg-white outline-none">
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                            </div>
                            <Button type="submit" fullWidth variant={editingChild ? "secondary" : "primary"}>
                                {editingChild ? 'Update Profil' : 'Daftar Anak'}
                            </Button>
                            {editingChild && <button type="button" onClick={() => setEditingChild(null)} className="text-xs text-gray-500 w-full text-center hover:underline">Batal Edit</button>}
                        </form>
                    </Card>

                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-700 text-sm">Daftar Anak {selectedUser.name}:</h4>
                        {children.map(child => (
                            <div key={child.id}
                                onClick={() => { setSelectedChildId(child.id); setEditingChild(child); setChildForm({ name: child.name, birthDate: new Date(child.birthDate).toISOString().split('T')[0], gender: child.gender }); }}
                                className={`p-4 border rounded-xl cursor-pointer transition ${selectedChildId === child.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'bg-white hover:bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold">{child.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">{child.gender}</div>
                                    </div>
                                    <FaHistory className={selectedChildId === child.id ? "text-purple-600" : "text-gray-300"} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KOLOM KANAN: INPUT RIWAYAT GIZI (BB/TB) */}
                <div className="space-y-4">
                    {selectedChildId ? (
                        <>
                            <Card className="border-purple-200 bg-purple-50/50">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <FaHistory className="text-purple-600" /> Input Pengukuran Baru
                                </h3>
                                <form onSubmit={handleAddGrowth} className="space-y-4">
                                    <div className="flex items-center gap-3 bg-white p-3 border rounded-xl">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <input type="date" value={growthForm.date} onChange={e => setGrowthForm({ ...growthForm, date: e.target.value })} className="w-full outline-none" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 bg-white p-3 border rounded-xl">
                                            <FaWeight className="text-pink-400" />
                                            <input type="number" step="0.1" placeholder="BB (kg)" value={growthForm.weight} onChange={e => setGrowthForm({ ...growthForm, weight: e.target.value })} className="w-full outline-none" required />
                                        </div>
                                        <div className="flex items-center gap-3 bg-white p-3 border rounded-xl">
                                            <FaRulerVertical className="text-blue-400" />
                                            <input type="number" step="0.1" placeholder="TB (cm)" value={growthForm.height} onChange={e => setGrowthForm({ ...growthForm, height: e.target.value })} className="w-full outline-none" required />
                                        </div>
                                    </div>
                                    <textarea placeholder="Catatan kunjungan (contoh: Posyandu Melati)" value={growthForm.notes} onChange={e => setGrowthForm({ ...growthForm, notes: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none" rows={2} />
                                    <Button type="submit" fullWidth disabled={loadingGrowth}>Simpan ke Riwayat Gizi</Button>
                                </form>
                            </Card>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-700 text-sm">Riwayat Terakhir:</h4>
                                {growthRecords.slice(0, 3).map(rec => (
                                    <div key={rec.id} className="bg-white p-3 border rounded-xl flex justify-between text-sm">
                                        <span className="font-medium text-gray-600">{new Date(rec.date).toLocaleDateString('id-ID')}</span>
                                        <span className="font-bold text-purple-700">{rec.weight} kg | {rec.height} cm</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-3xl p-10">
                            <FaHistory size={40} className="mb-4 opacity-20" />
                            <p className="text-center text-sm italic">Pilih nama anak di sebelah kiri untuk menginput riwayat pertumbuhan (BB/TB).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // TAMPILAN AWAL (SEARCH LIST)
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Pusat Input Data Pasien</h1>
            <Card>
                <form onSubmit={(e) => { e.preventDefault(); fetchParents(search); }} className="flex gap-2">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Cari Nama Orang Tua..." className="w-full pl-11 pr-4 py-3 border rounded-xl outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={loading}>{loading ? <FaSpinner className="animate-spin" /> : 'Cari'}</Button>
                </form>
            </Card>
            <div className="grid gap-3">
                {users.map(u => (
                    <Card key={u.id} className="flex justify-between items-center hover:border-purple-300 transition-colors">
                        <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.phone} {u.wilayah ? `• Wilayah: ${u.wilayah}` : ''}</div>
                        </div>
                        <Button onClick={() => { setSelectedUser(u); setView('input-anak'); }} variant="outline">Kelola Anak</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}