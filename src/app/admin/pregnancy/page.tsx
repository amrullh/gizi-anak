'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaArrowLeft, FaCalendarCheck, FaChevronDown, FaChevronUp, FaTimes, FaCapsules, FaChartLine } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { usePregnancy } from '@/hooks/usePregnancy';
import { calculateGestationalAge, calculateEstimatedDueDate } from '@/utils/pregnancy';

export default function AdminPregnancyPage() {
    const [view, setView] = useState<'list' | 'select-user' | 'form'>('list');
    const [monitoringUser, setMonitoringUser] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [pregnantList, setPregnantList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showComplaints, setShowComplaints] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

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

    const [monthlyForm, setMonthlyForm] = useState({
        bb: '', tb: '', hb: '', lila: '', keluhan: ''
    });

    const { savePregnancy, loading: isSaving } = usePregnancy(selectedUser?.id || monitoringUser?.userId);

    const formatDateID = (date: any) => {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Hitung HPL dari HPHT
    const estimatedDate = useMemo(() => {
        if (!form.hpht) return null;
        const hphtDate = new Date(form.hpht);
        if (isNaN(hphtDate.getTime())) return null;
        return calculateEstimatedDueDate(hphtDate);
    }, [form.hpht]);

    // Hitung usia kehamilan (minggu + hari) dari HPHT untuk form
    const gestationalAgeDisplay = useMemo(() => {
        if (!form.hpht) return null;
        const { weeks, days } = calculateGestationalAge(form.hpht);
        return `${weeks} minggu ${days} hari`;
    }, [form.hpht]);

    // Otomatis update umurKehamilanMinggu (numerik) untuk keperluan penyimpanan
    useEffect(() => {
        if (form.hpht) {
            const { weeks } = calculateGestationalAge(form.hpht);
            setForm(prev => ({
                ...prev,
                umurKehamilanMinggu: weeks.toString()
            }));
        }
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

    // Pencarian user (filter di memori)
    useEffect(() => {
        if (search.trim() === '') {
            setUsers([]);
            setSearchError(null);
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            setSearchError(null);
            try {
                const q = query(
                    collection(db, 'users'),
                    where('role', '==', 'parent'),
                    limit(100)
                );
                const snap = await getDocs(q);
                const allParents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                const existingUserIds = pregnantList.map(p => p.userId);
                const lowerSearch = search.toLowerCase();
                const filtered = allParents.filter(user =>
                    !existingUserIds.includes(user.id) &&
                    (user.name as string)?.toLowerCase().includes(lowerSearch)
                );

                setUsers(filtered);
            } catch (err: any) {
                console.error(err);
                setSearchError('Gagal mencari user: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [search, pregnantList]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!estimatedDate || !selectedUser) return alert("Data HPHT atau User belum lengkap.");

        try {
            // Siapkan payload dasar
            const payload: any = {
                userId: selectedUser.id,
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
                pillProgress: 0,
                monthlyRecords: []
            };

            // Tambahkan abortusAnakKe hanya jika pernahAbortus true dan ada nilainya
            if (form.pernahAbortus && form.abortusAnakKe) {
                payload.abortusAnakKe = parseInt(form.abortusAnakKe);
            }

            await savePregnancy(payload);
            alert('Data Berhasil Disimpan!');
            setView('list');
            fetchPregnantList();
        } catch (err: any) {
            alert('Gagal simpan: ' + err.message);
        }
    };

    const handleUpdatePill = async (pregnancyId: string, newProgress: number) => {
        try {
            const pregnancyRef = doc(db, 'pregnancies', pregnancyId);
            await updateDoc(pregnancyRef, { pillProgress: newProgress });
            fetchPregnantList();
            if (monitoringUser?.id === pregnancyId) {
                setMonitoringUser((prev: any) => ({ ...prev, pillProgress: newProgress }));
            }
            alert('Progress pil berhasil diperbarui!');
        } catch (err: any) {
            alert('Gagal update progress: ' + err.message);
        }
    };

    const handleSaveMonthly = async () => {
        if (!monitoringUser) return;
        if (!monthlyForm.bb || !monthlyForm.tb || !monthlyForm.hb || !monthlyForm.lila) {
            alert('Harap isi semua data (BB, TB, HB, LILA)');
            return;
        }

        try {
            const newRecord = {
                tanggal: new Date(),
                bb: parseFloat(monthlyForm.bb),
                tb: parseFloat(monthlyForm.tb),
                hb: parseFloat(monthlyForm.hb),
                lila: parseFloat(monthlyForm.lila),
                keluhan: monthlyForm.keluhan || '',
            };
            const updatedRecords = [...(monitoringUser.monthlyRecords || []), newRecord];
            const pregnancyRef = doc(db, 'pregnancies', monitoringUser.id);
            await updateDoc(pregnancyRef, { monthlyRecords: updatedRecords });
            alert('Data bulanan berhasil disimpan!');
            setMonthlyForm({ bb: '', tb: '', hb: '', lila: '', keluhan: '' });
            fetchPregnantList();
            setMonitoringUser((prev: any) => ({ ...prev, monthlyRecords: updatedRecords }));
        } catch (err: any) {
            alert('Gagal simpan data bulanan: ' + err.message);
        }
    };

    // Helper untuk menampilkan usia kehamilan dari data pregnancy
    const getGestationalAgeDisplay = (hpht: any) => {
        if (!hpht) return '-';
        const hphtDate = hpht.toDate ? hpht.toDate() : new Date(hpht);
        if (isNaN(hphtDate.getTime())) return '-';
        const { weeks, days } = calculateGestationalAge(hphtDate);
        return `${weeks} minggu ${days} hari`;
    };

    // ================= RENDER =================
    if (view === 'form') return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <button onClick={() => setView('select-user')} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-medium transition-colors">
                <FaArrowLeft /> Pilih Ulang User
            </button>

            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-8 rounded-3xl shadow-lg">
                <h2 className="text-2xl font-black">Registrasi Kehamilan Baru</h2>
                <p className="opacity-80 font-medium">Ibu: {selectedUser.name} | Usia: {selectedUser.age || '-'} Tahun</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
                        <span className="w-2 h-6 bg-pink-500 rounded-full"></span> Riwayat Kehamilan
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Tanggal Periksa</label>
                            <input type="date" value={form.pemeriksaanTanggal} onChange={e => setForm({ ...form, pemeriksaanTanggal: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none transition-all" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Hamil Ke-</label>
                                <input type="number" value={form.kehamilanKe} onChange={e => setForm({ ...form, kehamilanKe: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Anak Hidup</label>
                                <input type="number" value={form.jumlahAnakHidup} onChange={e => setForm({ ...form, jumlahAnakHidup: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none" required />
                            </div>
                        </div>
                        <div className="md:col-span-2 p-4 bg-rose-50 rounded-2xl flex items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={form.pernahAbortus} onChange={e => setForm({ ...form, pernahAbortus: e.target.checked })} className="w-6 h-6 rounded-lg border-none bg-white text-pink-500 focus:ring-pink-400" />
                                <span className="font-bold text-rose-700">Pernah Abortus (Keguguran)?</span>
                            </label>
                            {form.pernahAbortus && (
                                <input type="number" placeholder="Anak Ke-" value={form.abortusAnakKe} onChange={e => setForm({ ...form, abortusAnakKe: e.target.value })} className="flex-1 p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-pink-400 outline-none shadow-sm" required />
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-pink-100 bg-white">
                    <h3 className="font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
                        <FaCalendarCheck className="text-pink-500" /> Perhitungan Medis (HPHT)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-black text-pink-500 uppercase mb-2 italic">Tanggal HPHT (Penting)*</label>
                            <input type="date" value={form.hpht} onChange={e => setForm({ ...form, hpht: e.target.value })} className="w-full p-4 bg-pink-50 border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:ring-0 outline-none transition-all font-bold text-pink-700" required />
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
                                <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Taksiran Persalinan (HPL)</p>
                                <p className="text-2xl font-black text-pink-600 mt-1">{formatDateID(estimatedDate)}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Umur Kehamilan Saat Ini (Minggu)</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <input type="number" value={form.umurKehamilanMinggu} readOnly className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-xl text-gray-700" />
                                        <span className="absolute right-4 top-5 font-bold text-gray-300">Minggu</span>
                                    </div>
                                    {form.hpht && (
                                        <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-black uppercase text-center leading-tight">
                                            Detail:<br />{calculateGestationalAge(form.hpht).weeks}m {calculateGestationalAge(form.hpht).days}h
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <button type="button" onClick={() => setShowComplaints(!showComplaints)} className="w-full p-5 flex justify-between items-center hover:bg-gray-50 transition-all">
                        <span className="font-black text-gray-700 text-sm uppercase tracking-wider">Catatan Keluhan (Opsional)</span>
                        {showComplaints ? <FaChevronUp className="text-pink-500" /> : <FaChevronDown className="text-gray-300" />}
                    </button>
                    {showComplaints && (
                        <div className="p-6 grid gap-4 bg-gray-50">
                            <textarea placeholder="Keluhan Trimester I" value={form.keluhanTrimester1} onChange={e => setForm({ ...form, keluhanTrimester1: e.target.value })} className="w-full p-4 border-none rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-pink-400 outline-none" />
                            <textarea placeholder="Keluhan Trimester II" value={form.keluhanTrimester2} onChange={e => setForm({ ...form, keluhanTrimester2: e.target.value })} className="w-full p-4 border-none rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-pink-400 outline-none" />
                            <textarea placeholder="Keluhan Trimester III" value={form.keluhanTrimester3} onChange={e => setForm({ ...form, keluhanTrimester3: e.target.value })} className="w-full p-4 border-none rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-pink-400 outline-none" />
                        </div>
                    )}
                </div>

                <Button type="submit" fullWidth disabled={isSaving} className="py-5 text-xl font-black rounded-3xl shadow-xl shadow-pink-200">
                    {isSaving ? <FaSpinner className="animate-spin" /> : 'KONFIRMASI DATA KEHAMILAN'}
                </Button>
            </form>
        </div>
    );

    // ================= VIEW LIST & SELECT USER =================
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Data Kehamilan Ibu</h1>
                    <p className="text-gray-500">Monitoring taksiran persalinan dan kesehatan bulanan.</p>
                </div>
                <Button onClick={() => setView('select-user')} className="rounded-full px-8 shadow-pink-200 shadow-lg">
                    <FaPlus className="mr-2" /> Tambah Ibu Hamil
                </Button>
            </div>

            {view === 'select-user' && (
                <Card className="bg-pink-50 border-pink-100 p-6 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-pink-700 uppercase tracking-widest text-sm">Pilih Calon Ibu Hamil</h3>
                        <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600 transition-colors"><FaTimes size={20} /></button>
                    </div>
                    <div className="flex gap-3 mb-6">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-4 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Cari nama ibu..."
                                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 shadow-sm transition-all"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {searchError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {searchError}
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                        {loading && (
                            <div className="col-span-2 text-center py-6">
                                <FaSpinner className="animate-spin mx-auto text-pink-500" />
                            </div>
                        )}
                        {!loading && users.length === 0 && search && (
                            <p className="col-span-2 text-center text-gray-400 py-6 text-sm font-medium italic">
                                Nama tidak ditemukan atau Ibu sudah terdaftar dalam program kehamilan.
                            </p>
                        )}
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => { setSelectedUser(u); setView('form'); }}
                                className="p-5 bg-white rounded-2xl border-2 border-transparent hover:border-pink-400 hover:shadow-xl transition-all cursor-pointer flex justify-between items-center group"
                            >
                                <div>
                                    <p className="font-black text-gray-700 group-hover:text-pink-600 transition-colors">{u.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {u.id.substring(0, 8)}</p>
                                </div>
                                <span className="text-[10px] bg-pink-100 text-pink-600 px-3 py-1 rounded-full font-black opacity-0 group-hover:opacity-100 transition-opacity">PILIH</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-gray-400 font-black uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="p-6">Nama Ibu</th>
                                <th className="p-6">Usia Kehamilan</th>
                                <th className="p-6 text-pink-600">HPL (Prediksi)</th>
                                <th className="p-6">Progress Pil</th>
                                <th className="p-6 text-center">Opsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pregnantList.map(p => (
                                <tr key={p.id} className="hover:bg-pink-50/30 transition-colors group">
                                    <td className="p-6">
                                        <p className="font-black text-gray-800 text-base">{p.nama}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">Terdaftar: {formatDateID(p.updatedAt)}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-black text-pink-600 text-sm leading-tight">
                                            {getGestationalAgeDisplay(p.hpht)}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-black text-pink-600 text-lg leading-tight">{formatDateID(p.taksiranPersalinan)}</div>
                                        <div className="text-[10px] text-gray-400 font-bold italic">HPHT: {formatDateID(p.hpht)}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                                                <div className="bg-gradient-to-r from-pink-500 to-rose-400 h-2 rounded-full" style={{ width: `${(p.pillProgress || 0) / 90 * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-gray-500">{p.pillProgress || 0}/90</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button onClick={() => setMonitoringUser(p)} className="bg-white border-2 border-pink-100 text-pink-600 px-6 py-2 rounded-2xl text-[10px] font-black hover:bg-pink-600 hover:text-white hover:border-pink-600 shadow-sm transition-all uppercase tracking-widest">Pantau</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pregnantList.length === 0 && !loading && (
                        <div className="py-20 text-center">
                            <p className="text-gray-300 font-black uppercase tracking-widest">Belum ada data ibu hamil</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Modal Pantau Bulanan */}
            {monitoringUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800">Monitoring Ibu Hamil</h2>
                                <div className="text-gray-500 text-sm space-y-1">
                                    <p>{monitoringUser.nama} | Hamil ke-{monitoringUser.kehamilanKe}</p>
                                    <p className="text-xs text-pink-600 font-medium">
                                        Usia kehamilan saat ini: {getGestationalAgeDisplay(monitoringUser.hpht)}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setMonitoringUser(null)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Progress Pil */}
                            <div className="bg-pink-50 p-5 rounded-2xl">
                                <h3 className="font-black text-pink-700 flex items-center gap-2 mb-4"><FaCapsules /> Progress Konsumsi Pil Zat Besi</h3>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="0" max="90" value={monitoringUser.pillProgress || 0} onChange={(e) => handleUpdatePill(monitoringUser.id, parseInt(e.target.value))} className="flex-1 accent-pink-500" />
                                    <span className="font-black text-pink-600 min-w-[60px] text-center">{monitoringUser.pillProgress || 0}/90</span>
                                </div>
                            </div>

                            {/* Form Input Bulanan */}
                            <div className="bg-gray-50 p-5 rounded-2xl">
                                <h3 className="font-black text-gray-700 flex items-center gap-2 mb-4"><FaChartLine /> Input Data Bulanan</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">BB (kg)</label>
                                        <input type="number" step="0.1" value={monthlyForm.bb} onChange={e => setMonthlyForm({ ...monthlyForm, bb: e.target.value })} className="w-full p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-pink-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">TB (cm)</label>
                                        <input type="number" step="0.1" value={monthlyForm.tb} onChange={e => setMonthlyForm({ ...monthlyForm, tb: e.target.value })} className="w-full p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-pink-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">HB (g/dL)</label>
                                        <input type="number" step="0.1" value={monthlyForm.hb} onChange={e => setMonthlyForm({ ...monthlyForm, hb: e.target.value })} className="w-full p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-pink-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-1">LILA (cm)</label>
                                        <input type="number" step="0.1" value={monthlyForm.lila} onChange={e => setMonthlyForm({ ...monthlyForm, lila: e.target.value })} className="w-full p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-pink-400 outline-none" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <textarea placeholder="Keluhan (opsional)" value={monthlyForm.keluhan} onChange={e => setMonthlyForm({ ...monthlyForm, keluhan: e.target.value })} className="w-full p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-pink-400 outline-none" rows={2} />
                                </div>
                                <Button onClick={handleSaveMonthly} className="mt-4 w-full">Simpan Data Bulanan</Button>
                            </div>

                            {/* Riwayat Bulanan */}
                            <div>
                                <h3 className="font-black text-gray-700 mb-3">Riwayat Pemeriksaan Bulanan</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {monitoringUser.monthlyRecords?.length > 0 ? (
                                        monitoringUser.monthlyRecords.slice().reverse().map((rec: any, idx: number) => (
                                            <div key={idx} className="bg-white border rounded-xl p-3 text-sm">
                                                <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
                                                    <span>{formatDateID(rec.tanggal)}</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div><span className="block text-[10px] text-gray-400">BB</span><span className="font-black">{rec.bb} kg</span></div>
                                                    <div><span className="block text-[10px] text-gray-400">TB</span><span className="font-black">{rec.tb} cm</span></div>
                                                    <div><span className="block text-[10px] text-gray-400">HB</span><span className="font-black">{rec.hb} g/dL</span></div>
                                                    <div><span className="block text-[10px] text-gray-400">LILA</span><span className="font-black">{rec.lila} cm</span></div>
                                                </div>
                                                {rec.keluhan && <p className="text-xs mt-2 text-gray-500 italic">Keluhan: {rec.keluhan}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm text-center py-4">Belum ada data bulanan</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}