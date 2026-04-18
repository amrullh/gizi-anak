'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaBaby, FaSpinner, FaArrowLeft, FaEdit, FaHistory, FaWeight, FaRulerVertical, FaCalendarAlt, FaCalculator, FaUserCircle } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useChildren } from '@/hooks/useChildren';
import { useGrowthRecords } from '@/hooks/useGrowthRecords';
import { useAuth } from '@/context/AuthContext';
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

    // Perhitungan usia otomatis saat input tanggal lahir
    useEffect(() => {
        if (childForm.birthDate) {
            const birthDate = new Date(childForm.birthDate);
            if (!isNaN(birthDate.getTime())) {
                const { label, totalMonths } = calculateDetailedAge(birthDate);
                setAgeDisplay(`${label} (${totalMonths} bulan)`);
            }
        } else {
            setAgeDisplay('');
        }
    }, [childForm.birthDate]);

    // FETCH PARENTS DENGAN FILTER BIDAN ID (SINKRONISASI MANAJEMEN AKUN)
    const fetchParents = async (searchQuery: string = '') => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            let q;

            if (currentUser.role === 'bidan') {
                // BIDAN: Hanya bisa melihat Ibu yang ditugaskan kepadanya (berdasarkan bidanId)
                q = query(
                    usersRef,
                    where('role', '==', 'parent'),
                    where('bidanId', '==', currentUser.uid), // Filter krusial bgst
                    where('name', '>=', searchQuery),
                    where('name', '<=', searchQuery + '\uf8ff'),
                    orderBy('name'),
                    limit(20)
                );
            } else {
                // ADMIN PUSAT: Bisa melihat semua Ibu
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
            console.error("Gagal mengambil data orang tua:", err);
            // Catatan: Jika error di console muncul "The query requires an index", klik link yang disediakan Firebase.
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

    // ----- VIEW: INPUT DETAIL ANAK -----
    if (view === 'input-anak') return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 font-bold transition-colors text-sm uppercase tracking-wider">
                    <FaArrowLeft /> Kembali ke Daftar
                </button>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Mengelola Pasien:</p>
                    <p className="font-bold text-gray-800">{selectedUser?.name}</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* FORM PROFIL ANAK */}
                <div className="space-y-4">
                    <Card className={editingChild ? "border-amber-200 bg-amber-50/50 shadow-inner" : "bg-white border-gray-100 shadow-sm"}>
                        <h3 className="font-black mb-6 flex items-center gap-2 text-gray-700 uppercase text-xs tracking-widest">
                            <FaBaby className="text-pink-500" /> {editingChild ? `Update: ${editingChild.name}` : 'Registrasi Anak Baru'}
                        </h3>
                        <form onSubmit={handleSaveChildProfile} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Nama Lengkap Anak</label>
                                <input type="text" placeholder="Nama sesuai akta" value={childForm.name} onChange={e => setChildForm({ ...childForm, name: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm font-semibold" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tanggal Lahir</label>
                                    <input type="date" value={childForm.birthDate} onChange={e => setChildForm({ ...childForm, birthDate: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm font-semibold" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Jenis Kelamin</label>
                                    <select value={childForm.gender} onChange={e => setChildForm({ ...childForm, gender: e.target.value })} className="w-full p-3 border rounded-xl bg-white outline-none text-sm font-semibold">
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            {ageDisplay && (
                                <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-pink-500 shadow-sm">
                                        <FaCalculator size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-pink-400 uppercase tracking-wider">Usia Saat Ini (Sistem):</p>
                                        <p className="text-sm font-black text-pink-700">{ageDisplay}</p>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" fullWidth className="py-4 bg-gray-800 hover:bg-black text-white font-black rounded-2xl shadow-lg">
                                {editingChild ? 'UPDATE DATA ANAK' : 'DAFTARKAN ANAK'}
                            </Button>
                            {editingChild && (
                                <button type="button" onClick={() => { setEditingChild(null); setChildForm({ name: '', birthDate: '', gender: 'male' }); }} className="text-[10px] text-gray-400 w-full text-center hover:text-red-500 font-bold uppercase tracking-widest">Batal Edit</button>
                            )}
                        </form>
                    </Card>

                    <div className="space-y-2">
                        <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] px-1">Anak Terdaftar:</h4>
                        {children.map(child => (
                            <div key={child.id}
                                onClick={() => { setSelectedChildId(child.id); setEditingChild(child); setChildForm({ name: child.name, birthDate: new Date(child.birthDate).toISOString().split('T')[0], gender: child.gender }); }}
                                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center ${selectedChildId === child.id ? 'border-pink-500 bg-pink-50 shadow-md' : 'bg-white border-gray-50 hover:border-pink-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedChildId === child.id ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {child.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-800 text-sm uppercase tracking-tight">{child.name}</div>
                                        <div className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                                    </div>
                                </div>
                                <FaHistory className={selectedChildId === child.id ? "text-pink-500" : "text-gray-200"} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* FORM INPUT PENGUKURAN */}
                <div className="space-y-4">
                    {selectedChildId ? (
                        <>
                            <Card className="border-emerald-100 bg-emerald-50/30">
                                <h3 className="font-black mb-6 flex items-center gap-2 text-emerald-700 uppercase text-xs tracking-widest">
                                    <FaHistory /> Input Hasil Penimbangan
                                </h3>
                                <form onSubmit={handleAddGrowth} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tanggal Kunjungan/Ukur</label>
                                        <div className="flex items-center gap-3 bg-white p-3 border-2 border-emerald-100 rounded-xl focus-within:border-emerald-400 transition-all">
                                            <FaCalendarAlt className="text-emerald-400" />
                                            <input type="date" value={growthForm.date} onChange={e => setGrowthForm({ ...growthForm, date: e.target.value })} className="w-full outline-none text-sm font-bold bg-transparent" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Berat (kg)</label>
                                            <div className="flex items-center gap-3 bg-white p-4 border-2 border-emerald-100 rounded-2xl">
                                                <FaWeight className="text-pink-400" />
                                                <input type="number" step="0.1" placeholder="0.0" value={growthForm.weight} onChange={e => setGrowthForm({ ...growthForm, weight: e.target.value })} className="w-full outline-none text-lg font-black text-gray-800" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Tinggi (cm)</label>
                                            <div className="flex items-center gap-3 bg-white p-4 border-2 border-emerald-100 rounded-2xl">
                                                <FaRulerVertical className="text-blue-400" />
                                                <input type="number" step="0.1" placeholder="0.0" value={growthForm.height} onChange={e => setGrowthForm({ ...growthForm, height: e.target.value })} className="w-full outline-none text-lg font-black text-gray-800" required />
                                            </div>
                                        </div>
                                    </div>
                                    <textarea placeholder="Catatan tambahan (Posyandu, keluhan, dll)..." value={growthForm.notes} onChange={e => setGrowthForm({ ...growthForm, notes: e.target.value })} className="w-full p-4 border-2 border-emerald-100 rounded-2xl bg-white outline-none focus:border-emerald-400 transition-all text-sm font-medium" rows={2} />
                                    <Button type="submit" fullWidth disabled={loadingGrowth} className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg">
                                        SIMPAN DATA PERTUMBUHAN
                                    </Button>
                                </form>
                            </Card>

                            <div className="space-y-2">
                                <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] px-1">3 Riwayat Terakhir:</h4>
                                {growthRecords.slice(0, 3).map(rec => (
                                    <div key={rec.id} className="bg-white p-4 border rounded-2xl flex justify-between items-center shadow-sm border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(rec.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-base font-black text-gray-800">{rec.weight} kg <span className="text-gray-300 font-normal mx-2">|</span> {rec.height} cm</p>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100 italic">Valid</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-300 border-4 border-dashed rounded-[3rem] p-10 bg-gray-50/50">
                            <FaBaby size={60} className="mb-6 opacity-20 text-pink-400" />
                            <p className="text-center text-sm italic font-bold uppercase tracking-widest max-w-xs">Pilih anak untuk mulai mencatat pertumbuhan bulanan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // ----- VIEW: LIST CARI ORANG TUA -----
    return (
        <div className="space-y-8 animate-in fade-in duration-700 px-2">
            <header className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="h-px w-8 bg-pink-500"></span>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-pink-500">Input Data</span>
                </div>
                <h1 className="text-3xl font-black text-gray-800 italic font-serif tracking-tighter">Manajemen Pasien</h1>
                <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-tight">Wilayah Tugas: <span className="text-pink-600 font-bold">{currentUser?.wilayah || 'Nasional'}</span></p>
            </header>

            <Card className="p-2 rounded-[2rem] bg-gray-100/50 border-none shadow-inner">
                <form onSubmit={(e) => { e.preventDefault(); fetchParents(search); }} className="flex gap-2 p-1">
                    <div className="flex-1 relative group">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                        <input type="text" placeholder="Cari nama orang tua..." className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-[1.5rem] outline-none shadow-sm text-sm font-bold focus:ring-2 focus:ring-pink-200 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={loading} className="px-10 rounded-[1.5rem] bg-gray-800 hover:bg-black font-black uppercase tracking-widest shadow-md">
                        {loading ? <FaSpinner className="animate-spin" /> : 'CARI'}
                    </Button>
                </form>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.length === 0 && !loading && search && (
                    <div className="col-span-full py-20 text-center">
                        <FaUserCircle size={48} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 italic font-bold uppercase text-xs tracking-widest">Pasien tidak ditemukan di wilayah Anda.</p>
                    </div>
                )}
                {users.map(u => (
                    <Card key={u.id} className="p-6 rounded-[2rem] border-2 border-transparent hover:border-pink-500 hover:shadow-2xl transition-all cursor-pointer group bg-white">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-pink-100 rounded-[1.5rem] flex items-center justify-center text-pink-600 font-black text-2xl group-hover:bg-pink-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-800 uppercase tracking-tight text-lg line-clamp-1">{u.name}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{u.phone}</p>
                            </div>
                            <div className="pt-2 w-full">
                                <Button onClick={() => { setSelectedUser(u); setView('input-anak'); }} variant="outline" fullWidth className="rounded-xl font-black text-[10px] py-3 uppercase tracking-[0.2em] border-2 group-hover:bg-pink-50 transition-all">
                                    Kelola Anak
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}