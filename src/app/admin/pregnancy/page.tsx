'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaArrowLeft, FaCalendarCheck, FaChevronDown, FaChevronUp, FaTimes, FaCapsules, FaChartLine } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { usePregnancy } from '@/hooks/usePregnancy';

export default function AdminPregnancyPage() {
    const [view, setView] = useState<'list' | 'select-user' | 'form'>('list');
    const [monitoringUser, setMonitoringUser] = useState<any>(null); // State untuk Modal Pantau
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [pregnantList, setPregnantList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showComplaints, setShowComplaints] = useState(false);

    const [form, setForm] = useState({
        pemeriksaanTanggal: new Date().toISOString().split('T')[0],
        kehamilanKe: '1',
        jumlahAnakHidup: '0',
        pernahAbortus: false,
        abortusAnakKe: '',
        hpht: '',
        umurKehamilanMinggu: '',
        keluhanTrimester1: '',
        keluhanTrimester2: '',
        keluhanTrimester3: '',
    });

    // State untuk Form Bulanan di dalam Modal
    const [monthlyForm, setMonthlyForm] = useState({
        bb: '', tb: '', hb: '', lila: '', keluhan: ''
    });

    const { savePregnancy, loading: isSaving } = usePregnancy(selectedUser?.id || monitoringUser?.userId);

    const formatDateID = (date: any) => {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const estimatedDate = useMemo(() => {
        if (!form.hpht) return null;
        const date = new Date(form.hpht);
        date.setDate(date.getDate() + 7);
        date.setMonth(date.getMonth() + 9);
        return date;
    }, [form.hpht]);

    const fetchPregnantList = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'pregnancies'), orderBy('updatedAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            setPregnantList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchPregnantList(); }, []);

    // Live Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search.trim() === '') { setUsers([]); return; }
            const performSearch = async () => {
                setLoading(true);
                try {
                    const searchStr = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();
                    const q = query(collection(db, 'users'), where('role', '==', 'parent'), where('name', '>=', searchStr), where('name', '<=', searchStr + '\uf8ff'), limit(10));
                    const snap = await getDocs(q);
                    setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (err) { console.error(err); } finally { setLoading(false); }
            };
            performSearch();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!estimatedDate || !selectedUser) return alert("Lengkapi data terlebih dahulu");

        try {
            const payload: any = {
                isPregnant: true,
                pemeriksaanTanggal: new Date(form.pemeriksaanTanggal),
                nama: selectedUser.name || '',
                umur: selectedUser.age || 0,
                kehamilanKe: parseInt(form.kehamilanKe) || 1,
                jumlahAnakHidup: parseInt(form.jumlahAnakHidup) || 0,
                pernahAbortus: form.pernahAbortus,
                hpht: new Date(form.hpht),
                taksiranPersalinan: estimatedDate,
                umurKehamilanMinggu: parseInt(form.umurKehamilanMinggu) || 0,
                keluhanTrimester1: form.keluhanTrimester1 || '',
                keluhanTrimester2: form.keluhanTrimester2 || '',
                keluhanTrimester3: form.keluhanTrimester3 || '',
                beratBadan: selectedUser.beratBadan || 0,
                tinggiBadan: selectedUser.tinggiBadan || 0,
                pillProgress: 0, // Inisialisasi awal
            };

            if (form.pernahAbortus && form.abortusAnakKe) {
                payload.abortusAnakKe = parseInt(form.abortusAnakKe);
            }

            await savePregnancy(payload);
            alert('Data Berhasil Disimpan!');
            setView('list');
            fetchPregnantList();
        } catch (err: any) { alert('Gagal simpan: ' + err.message); }
    };

    // LOGIC BARU: Update Pil & Simpan Data Bulanan
    const handleUpdatePill = async (newCount: number) => {
        if (newCount > 90) return;
        try {
            await savePregnancy({ ...monitoringUser, pillProgress: newCount });
            setMonitoringUser({ ...monitoringUser, pillProgress: newCount });
            fetchPregnantList();
        } catch (err) { alert('Gagal update pil'); }
    };

    const handleSaveMonthly = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newRecord = {
                tanggal: new Date(),
                beratBadan: parseFloat(monthlyForm.bb),
                tinggiBadan: parseFloat(monthlyForm.tb),
                hb: parseFloat(monthlyForm.hb),
                lila: parseFloat(monthlyForm.lila),
                keluhan: monthlyForm.keluhan || null
            };

            const existingRecords = monitoringUser.monthlyRecords || [];
            await savePregnancy({
                ...monitoringUser,
                monthlyRecords: [...existingRecords, newRecord]
            });

            alert('Data bulanan berhasil ditambahkan!');
            setMonthlyForm({ bb: '', tb: '', hb: '', lila: '', keluhan: '' });
            setMonitoringUser(null);
            fetchPregnantList();
        } catch (err) { alert('Gagal simpan data bulanan'); }
    };

    if (view === 'form') return (
        <div className="space-y-6">
            <button onClick={() => setView('select-user')} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium">
                <FaArrowLeft /> Kembali ke Pemilihan User
            </button>
            <div className="bg-purple-600 text-white p-6 rounded-3xl shadow-lg">
                <h2 className="text-xl font-bold">Input Data Kehamilan</h2>
                <p className="opacity-90">Pasien: {selectedUser.name}</p>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Informasi Utama</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tanggal Pemeriksaan</label>
                            <input type="date" value={form.pemeriksaanTanggal} onChange={e => setForm({ ...form, pemeriksaanTanggal: e.target.value })} className="w-full p-3 border rounded-xl" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Hamil Ke-</label>
                                <input type="number" value={form.kehamilanKe} onChange={e => setForm({ ...form, kehamilanKe: e.target.value })} className="w-full p-3 border rounded-xl" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Anak Hidup</label>
                                <input type="number" value={form.jumlahAnakHidup} onChange={e => setForm({ ...form, jumlahAnakHidup: e.target.value })} className="w-full p-3 border rounded-xl" required />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                <input type="checkbox" checked={form.pernahAbortus} onChange={e => setForm({ ...form, pernahAbortus: e.target.checked })} className="w-5 h-5 accent-purple-600" /> Pernah Abortus?
                            </label>
                            {form.pernahAbortus && <input type="number" placeholder="Anak Ke-" value={form.abortusAnakKe} onChange={e => setForm({ ...form, abortusAnakKe: e.target.value })} className="p-2 border rounded-lg w-28 bg-white" required />}
                        </div>
                    </div>
                </Card>
                <Card className="border-pink-200 bg-pink-50/30">
                    <h3 className="font-bold text-pink-700 mb-4 flex items-center gap-2">
                        <FaCalendarCheck /> Prediksi Persalinan
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-pink-600 mb-1 italic">HPHT (Hari Pertama Haid Terakhir) *</label>
                            <input type="date" lang="id-ID" value={form.hpht} onChange={e => setForm({ ...form, hpht: e.target.value })} className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-pink-400 outline-none" required />
                        </div>
                        <div className="flex flex-col justify-center p-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Hasil Prediksi Taksiran:</span>
                            <span className="text-xl font-black text-pink-600">{formatDateID(estimatedDate)}</span>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Umur Kehamilan Saat Ini (Minggu)</label>
                            <input type="number" value={form.umurKehamilanMinggu} onChange={e => setForm({ ...form, umurKehamilanMinggu: e.target.value })} className="w-full p-3 border rounded-xl" required />
                        </div>
                    </div>
                </Card>

                {/* --- KELUHAN OPSIONAL --- */}
                <div className="border rounded-2xl overflow-hidden">
                    <button type="button" onClick={() => setShowComplaints(!showComplaints)} className="w-full p-4 bg-gray-100 flex justify-between items-center hover:bg-gray-200 transition-colors">
                        <span className="font-bold text-gray-700">Keluhan Selama Kehamilan (Opsional)</span>
                        {showComplaints ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {showComplaints && (
                        <div className="p-4 bg-white space-y-4">
                            <textarea placeholder="Trimester I" value={form.keluhanTrimester1} onChange={e => setForm({ ...form, keluhanTrimester1: e.target.value })} className="w-full p-3 border rounded-xl" />
                            <textarea placeholder="Trimester II" value={form.keluhanTrimester2} onChange={e => setForm({ ...form, keluhanTrimester2: e.target.value })} className="w-full p-3 border rounded-xl" />
                            <textarea placeholder="Trimester III" value={form.keluhanTrimester3} onChange={e => setForm({ ...form, keluhanTrimester3: e.target.value })} className="w-full p-3 border rounded-xl" />
                        </div>
                    )}
                </div>
                <Button type="submit" fullWidth disabled={isSaving} className="py-4 text-lg">
                    {isSaving ? <FaSpinner className="animate-spin" /> : 'Simpan Data Kehamilan'}
                </Button>
            </form>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Data Kehamilan Ibu</h1>
                    <p className="text-gray-500">Monitoring taksiran persalinan dan kesehatan bulanan.</p>
                </div>
                <Button onClick={() => setView('select-user')} className="rounded-full px-8 shadow-purple-200 shadow-lg">
                    <FaPlus className="mr-2" /> Tambah Ibu Hamil
                </Button>
            </div>

            {view === 'select-user' && (
                <Card className="bg-purple-50 border-purple-200">
                    <div className="flex gap-2 mb-4">
                        <input type="text" placeholder="Masukkan nama ibu..." className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" value={search} onChange={e => setSearch(e.target.value)} />
                        <Button><FaSearch /></Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {users.map(u => (
                            <div key={u.id} onClick={() => { setSelectedUser(u); setView('form'); }} className="p-4 bg-white rounded-2xl border border-purple-100 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all flex justify-between items-center group">
                                <span className="font-bold text-gray-700">{u.name}</span>
                                <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">PILIH</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-gray-400 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="p-4">Nama Ibu</th>
                                <th className="p-4">Kehamilan</th>
                                <th className="p-4 text-pink-600">Prediksi Persalinan</th>
                                <th className="p-4">Progress Pil</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pregnantList.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">{p.nama}</td>
                                    <td className="p-4">Anak ke-{p.kehamilanKe}</td>
                                    <td className="p-4">
                                        <div className="font-black text-pink-600 underline">{formatDateID(p.taksiranPersalinan)}</div>
                                        <div className="text-[10px] text-gray-400 italic">HPHT: {formatDateID(p.hpht)}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${(p.pillProgress || 0) / 90 * 100}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">{p.pillProgress || 0}/90</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => setMonitoringUser(p)} className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-[10px] font-black hover:bg-purple-600 hover:text-white transition-all">PANTAU</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* --- MODAL PANTAU BULANAN --- */}
            {monitoringUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200 p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 leading-none">Pantau Ibu: {monitoringUser.nama}</h2>
                                <p className="text-sm text-gray-500 mt-2 uppercase tracking-widest font-bold">Pemeriksaan Rutin & Tracker Pil</p>
                            </div>
                            <button onClick={() => setMonitoringUser(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaTimes size={20} className="text-gray-400" /></button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Widget Pil */}
                            <div className="bg-pink-50 border border-pink-100 p-5 rounded-3xl">
                                <h3 className="font-black text-pink-600 flex items-center gap-2 text-sm mb-4"><FaCapsules /> PROGRESS PIL (90 HARI)</h3>
                                <div className="text-4xl font-black text-pink-700 mb-2">{monitoringUser.pillProgress || 0}<span className="text-sm text-pink-300">/90</span></div>
                                <div className="w-full bg-pink-200 rounded-full h-3 mb-4"><div className="bg-pink-500 h-3 rounded-full" style={{ width: `${(monitoringUser.pillProgress || 0) / 90 * 100}%` }}></div></div>
                                <Button fullWidth className="py-2 text-xs shadow-pink-200 shadow-md" onClick={() => handleUpdatePill((monitoringUser.pillProgress || 0) + 1)}>+ KONFIRMASI MINUM HARI INI</Button>
                            </div>

                            {/* Info Terakhir */}
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl">
                                <h3 className="font-black text-blue-600 flex items-center gap-2 text-sm mb-4"><FaChartLine /> TERAKHIR DIUPDATE</h3>
                                <div className="text-xl font-black text-blue-800">{formatDateID(monitoringUser.updatedAt)}</div>
                                <p className="text-[10px] text-blue-400 mt-1 uppercase font-bold tracking-widest">Gunakan data ini sebagai referensi pemeriksaan hari ini.</p>
                            </div>
                        </div>

                        {/* Form Input Bulanan */}
                        <form onSubmit={handleSaveMonthly} className="space-y-4 bg-gray-50 p-6 rounded-3xl">
                            <h3 className="font-black text-gray-700 text-sm mb-2">INPUT PEMERIKSAAN BULANAN</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">BERAT BADAN (KG)</label>
                                    <input type="number" step="0.1" value={monthlyForm.bb} onChange={e => setMonthlyForm({ ...monthlyForm, bb: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" placeholder="00.0" required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">TINGGI BADAN (CM)</label>
                                    <input type="number" value={monthlyForm.tb} onChange={e => setMonthlyForm({ ...monthlyForm, tb: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" placeholder="000" required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">KADAR Hb (g/dL)</label>
                                    <input type="number" step="0.1" value={monthlyForm.hb} onChange={e => setMonthlyForm({ ...monthlyForm, hb: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" placeholder="00.0" required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">LILA (CM)</label>
                                    <input type="number" step="0.1" value={monthlyForm.lila} onChange={e => setMonthlyForm({ ...monthlyForm, lila: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" placeholder="00.0" required /></div>
                            </div>
                            <div><label className="text-[10px] font-bold text-gray-400 block mb-1">KELUHAN BULAN INI (OPSIONAL)</label>
                                <textarea rows={2} value={monthlyForm.keluhan} onChange={e => setMonthlyForm({ ...monthlyForm, keluhan: e.target.value })} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400" placeholder="Contoh: Sering pusing atau nyeri punggung..." /></div>
                            <Button type="submit" fullWidth className="py-4 shadow-lg shadow-purple-100">SIMPAN DATA PEMERIKSAAN</Button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}