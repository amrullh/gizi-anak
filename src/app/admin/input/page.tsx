'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaBaby, FaSpinner, FaArrowLeft, FaEdit, FaHistory, FaWeight, FaRulerVertical, FaCalendarAlt, FaCalculator } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useChildren } from '@/hooks/useChildren';
import { useGrowthRecords } from '@/hooks/useGrowthRecords';
import { useAuth } from '@/context/AuthContext';
// Import utilitas perhitungan usia yang sudah direvisi sesuai standar klien
import { calculateDetailedAge } from '@/utils/nutrition';

export default function AdminInputPage() {
    const { user: currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Navigasi State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [view, setView] = useState<'list' | 'input-anak'>('list');

    // State untuk Anak & Pertumbuhan
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [editingChild, setEditingChild] = useState<any>(null);

    // State Baru: Menampilkan kalkulasi usia real-time (Poin Request)
    const [ageDisplay, setAgeDisplay] = useState<string>('');

    // Hooks
    const { children, addChild, updateChild } = useChildren(selectedUser?.id);
    const { records: growthRecords, addRecord, loading: loadingGrowth } = useGrowthRecords(selectedChildId || undefined);

    // Form States
    const [childForm, setChildForm] = useState({ name: '', birthDate: '', gender: 'male' });
    const [growthForm, setGrowthForm] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        notes: ''
    });

    // EFFECT: Menghitung usia otomatis saat tanggal lahir diisi
    useEffect(() => {
        if (childForm.birthDate) {
            const birthDate = new Date(childForm.birthDate);
            if (!isNaN(birthDate.getTime())) {
                // Menggunakan logika pembulatan >= 15 hari = +1 bulan
                const { label, totalMonths } = calculateDetailedAge(birthDate);
                setAgeDisplay(`${label} (${totalMonths} bulan)`);
            }
        } else {
            setAgeDisplay('');
        }
    }, [childForm.birthDate]);

    const fetchParents = async (searchQuery: string = '') => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            let q;
            if (currentUser.role === 'bidan' && currentUser.wilayah) {
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

    useEffect(() => {
        if (currentUser) fetchParents();
    }, [currentUser]);

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
            setAgeDisplay('');
            setEditingChild(null);
        } catch (err) { alert('Gagal menyimpan profil'); }
    };

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

    if (view === 'input-anak') return (
        <div className="space-y-6">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition-colors">
                <FaArrowLeft /> Kembali ke Daftar Orang Tua
            </button>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Card className={editingChild ? "border-amber-200 bg-amber-50" : "bg-blue-50 border-blue-100"}>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-700">
                            <FaBaby /> {editingChild ? `Edit Profil: ${editingChild.name}` : 'Daftarkan Anak Baru'}
                        </h3>
                        <form onSubmit={handleSaveChildProfile} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Nama Lengkap Anak</label>
                                <input type="text" placeholder="Masukkan nama lengkap" value={childForm.name} onChange={e => setChildForm({ ...childForm, name: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-200 transition-all" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tanggal Lahir</label>
                                    <input type="date" value={childForm.birthDate} onChange={e => setChildForm({ ...childForm, birthDate: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-200 transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Jenis Kelamin</label>
                                    <select value={childForm.gender} onChange={e => setChildForm({ ...childForm, gender: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none">
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            {/* TAMPILAN USIA OTOMATIS BERDASARKAN LOGIKA KLIEN */}
                            {ageDisplay && (
                                <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <FaCalculator size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Usia Terkalkulasi (Pembulatan):</p>
                                        <p className="text-sm font-black text-blue-700">{ageDisplay}</p>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" fullWidth variant={editingChild ? "secondary" : "primary"} className="py-3 shadow-md">
                                {editingChild ? 'Update Profil' : 'Simpan Profil Anak'}
                            </Button>
                            {editingChild && <button type="button" onClick={() => { setEditingChild(null); setChildForm({ name: '', birthDate: '', gender: 'male' }); }} className="text-xs text-gray-500 w-full text-center hover:underline italic">Batal Edit</button>}
                        </form>
                    </Card>

                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-widest px-1">Daftar Anak {selectedUser.name}:</h4>
                        {children.map(child => (
                            <div key={child.id}
                                onClick={() => { setSelectedChildId(child.id); setEditingChild(child); setChildForm({ name: child.name, birthDate: new Date(child.birthDate).toISOString().split('T')[0], gender: child.gender }); }}
                                className={`p-4 border rounded-xl cursor-pointer transition ${selectedChildId === child.id ? 'border-purple-500 bg-purple-50 shadow-md scale-[1.02]' : 'bg-white hover:bg-gray-50'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-gray-800">{child.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-medium">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                                    </div>
                                    <FaHistory className={selectedChildId === child.id ? "text-purple-600" : "text-gray-300"} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {selectedChildId ? (
                        <>
                            <Card className="border-purple-200 bg-purple-50/50">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-purple-700">
                                    <FaHistory /> Input Pengukuran Baru
                                </h3>
                                <form onSubmit={handleAddGrowth} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1 text-center sm:text-left">Tanggal Pengukuran</label>
                                        <div className="flex items-center gap-3 bg-white p-3 border rounded-xl focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <input type="date" value={growthForm.date} onChange={e => setGrowthForm({ ...growthForm, date: e.target.value })} className="w-full outline-none text-sm" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1 text-center sm:text-left">Berat Badan (kg)</label>
                                            <div className="flex items-center gap-3 bg-white p-3 border rounded-xl focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                                                <FaWeight className="text-pink-400" />
                                                <input type="number" step="0.1" placeholder="0.0" value={growthForm.weight} onChange={e => setGrowthForm({ ...growthForm, weight: e.target.value })} className="w-full outline-none text-sm font-bold" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1 text-center sm:text-left">Tinggi Badan (cm)</label>
                                            <div className="flex items-center gap-3 bg-white p-3 border rounded-xl focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                                                <FaRulerVertical className="text-blue-400" />
                                                <input type="number" step="0.1" placeholder="0.0" value={growthForm.height} onChange={e => setGrowthForm({ ...growthForm, height: e.target.value })} className="w-full outline-none text-sm font-bold" required />
                                            </div>
                                        </div>
                                    </div>
                                    <textarea placeholder="Catatan kunjungan (contoh: Posyandu Melati)" value={growthForm.notes} onChange={e => setGrowthForm({ ...growthForm, notes: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm" rows={2} />
                                    <Button type="submit" fullWidth disabled={loadingGrowth} className="py-3 bg-purple-600 hover:bg-purple-700 shadow-md">Simpan ke Riwayat Gizi</Button>
                                </form>
                            </Card>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-700 text-xs uppercase tracking-widest px-1">Riwayat Pengukuran Terakhir:</h4>
                                {growthRecords.slice(0, 3).map(rec => (
                                    <div key={rec.id} className="bg-white p-3 border rounded-xl flex justify-between items-center shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(rec.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-sm font-black text-purple-700">{rec.weight} kg | {rec.height} cm</span>
                                        </div>
                                        <span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold border border-purple-100 uppercase">Tercatat</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-3xl p-10 bg-gray-50/30">
                            <FaHistory size={40} className="mb-4 opacity-10" />
                            <p className="text-center text-sm italic font-medium">Pilih salah satu nama anak di kolom sebelah kiri untuk mulai menginput riwayat pertumbuhan (BB/TB).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Pusat Input Data Pasien</h1>
                <p className="text-sm text-gray-500">Daftarkan anak atau update perkembangan rutin sesuai wilayah {currentUser?.wilayah || 'Anda'}.</p>
            </div>

            <Card className="bg-gradient-to-r from-white to-gray-50">
                <form onSubmit={(e) => { e.preventDefault(); fetchParents(search); }} className="flex gap-2">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="text" placeholder="Masukkan nama orang tua untuk mencari..." className="w-full pl-11 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-200 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={loading} className="px-8 shadow-sm">
                        {loading ? <FaSpinner className="animate-spin" /> : 'Cari'}
                    </Button>
                </form>
            </Card>

            <div className="grid gap-3">
                {users.length === 0 && !loading && search && <p className="text-center py-10 text-gray-400 italic">Orang tua tidak ditemukan di wilayah ini.</p>}
                {users.map(u => (
                    <Card key={u.id} className="flex justify-between items-center hover:border-purple-300 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                {u.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">{u.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{u.phone} {u.wilayah ? `• Wilayah: ${u.wilayah}` : ''}</div>
                            </div>
                        </div>
                        <Button onClick={() => { setSelectedUser(u); setView('input-anak'); }} variant="outline" className="text-xs py-2 px-4">Kelola Anak</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}