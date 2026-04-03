'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaArrowLeft, FaCalendarCheck, FaChevronDown, FaChevronUp, FaTimes, FaCapsules, FaChartLine, FaHeartbeat } from 'react-icons/fa';
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
        <div className="space-y-6 animate-in fade-in duration-500 bg-white">
            <button onClick={() => setView('select-user')} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 font-medium transition-colors">
                <FaArrowLeft /> Pilih Ulang User
            </button>

            {/* Header minimalis */}
            <div className="bg-pink-50 border border-pink-100 p-6 rounded-2xl">
                <h2 className="text-xl font-serif italic font-semibold text-gray-800">Registrasi Kehamilan Baru</h2>
                <p className="text-gray-500 text-sm mt-1">Ibu: {selectedUser.name} | Usia: {selectedUser.age || '-'} Tahun</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-pink-400 rounded-full"></span> Riwayat Kehamilan
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tanggal Periksa</label>
                            <input type="date" value={form.pemeriksaanTanggal} onChange={e => setForm({ ...form, pemeriksaanTanggal: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Hamil Ke-</label>
                                <input type="number" value={form.kehamilanKe} onChange={e => setForm({ ...form, kehamilanKe: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-pink-300 focus:border-pink-300 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Anak Hidup</label>
                                <input type="number" value={form.jumlahAnakHidup} onChange={e => setForm({ ...form, jumlahAnakHidup: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-pink-300 focus:border-pink-300 outline-none" required />
                            </div>
                        </div>
                        <div className="md:col-span-2 p-4 bg-pink-50/30 border border-pink-100 rounded-xl flex flex-wrap items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.pernahAbortus} onChange={e => setForm({ ...form, pernahAbortus: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-300" />
                                <span className="text-sm text-gray-700">Pernah Abortus (Keguguran)?</span>
                            </label>
                            {form.pernahAbortus && (
                                <input type="number" placeholder="Anak Ke-" value={form.abortusAnakKe} onChange={e => setForm({ ...form, abortusAnakKe: e.target.value })} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 outline-none text-sm" required />
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <FaCalendarCheck className="text-pink-500 text-sm" /> Perhitungan Medis (HPHT)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-medium text-pink-500 uppercase mb-1">Tanggal HPHT *</label>
                            <input type="date" value={form.hpht} onChange={e => setForm({ ...form, hpht: e.target.value })} className="w-full p-3 bg-pink-50 border border-pink-200 rounded-xl focus:ring-1 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all text-gray-700" required />
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl">
                                <p className="text-[10px] font-medium text-pink-500 uppercase tracking-wider">Taksiran Persalinan (HPL)</p>
                                <p className="text-lg font-semibold text-gray-800 mt-0.5">{formatDateID(estimatedDate)}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Umur Kehamilan Saat Ini (Minggu)</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input type="number" value={form.umurKehamilanMinggu} readOnly className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700" />
                                    </div>
                                    {form.hpht && (
                                        <div className="px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-xs font-medium">
                                            {calculateGestationalAge(form.hpht).weeks}m {calculateGestationalAge(form.hpht).days}h
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <button type="button" onClick={() => setShowComplaints(!showComplaints)} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-all">
                        <span className="font-medium text-gray-600 text-xs uppercase tracking-wider">Catatan Keluhan (Opsional)</span>
                        {showComplaints ? <FaChevronUp className="text-pink-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                    </button>
                    {showComplaints && (
                        <div className="p-5 grid gap-4 bg-gray-50">
                            <textarea placeholder="Keluhan Trimester I" value={form.keluhanTrimester1} onChange={e => setForm({ ...form, keluhanTrimester1: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-pink-300 outline-none text-sm" rows={2} />
                            <textarea placeholder="Keluhan Trimester II" value={form.keluhanTrimester2} onChange={e => setForm({ ...form, keluhanTrimester2: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-pink-300 outline-none text-sm" rows={2} />
                            <textarea placeholder="Keluhan Trimester III" value={form.keluhanTrimester3} onChange={e => setForm({ ...form, keluhanTrimester3: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-pink-300 outline-none text-sm" rows={2} />
                        </div>
                    )}
                </div>

                <Button type="submit" fullWidth disabled={isSaving} className="py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all shadow-sm">
                    {isSaving ? <FaSpinner className="animate-spin mx-auto" /> : 'Konfirmasi Data Kehamilan'}
                </Button>
            </form>
        </div>
    );

    // ================= VIEW LIST & SELECT USER =================
    return (
        <div className="space-y-6 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-px w-6 bg-pink-300"></span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">Ibu Hamil</span>
                    </div>
                    <h1 className="text-2xl font-serif italic font-semibold text-gray-800">Data Kehamilan Ibu</h1>
                    <p className="text-gray-400 text-sm">Monitoring taksiran persalinan dan kesehatan bulanan.</p>
                </div>
                <Button onClick={() => setView('select-user')} className="rounded-full px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white shadow-sm">
                    <FaPlus className="mr-2" size={12} /> Tambah Ibu Hamil
                </Button>
            </div>

            {view === 'select-user' && (
                <Card className="bg-white border border-pink-100 p-6 rounded-2xl shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-pink-500 uppercase tracking-wider text-xs">Pilih Calon Ibu Hamil</h3>
                        <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600"><FaTimes size={18} /></button>
                    </div>
                    <div className="flex gap-3 mb-6">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 text-sm" />
                            <input
                                type="text"
                                placeholder="Cari nama ibu..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {searchError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
                            {searchError}
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                        {loading && (
                            <div className="col-span-2 text-center py-6">
                                <FaSpinner className="animate-spin mx-auto text-pink-400" />
                            </div>
                        )}
                        {!loading && users.length === 0 && search && (
                            <p className="col-span-2 text-center text-gray-400 py-6 text-sm italic">
                                Nama tidak ditemukan atau Ibu sudah terdaftar.
                            </p>
                        )}
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => { setSelectedUser(u); setView('form'); }}
                                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center group"
                            >
                                <div>
                                    <p className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">{u.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">ID: {u.id.substring(0, 8)}</p>
                                </div>
                                <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity">PILIH</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Nama Ibu</th>
                                <th className="p-4">Usia Kehamilan</th>
                                <th className="p-4 text-pink-600">HPL (Prediksi)</th>
                                <th className="p-4">Progress Pil</th>
                                <th className="p-4 text-center">Opsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pregnantList.map(p => (
                                <tr key={p.id} className="hover:bg-pink-50/30 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{p.nama}</p>
                                        <p className="text-[10px] text-gray-400">Terdaftar: {formatDateID(p.updatedAt)}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-pink-600 text-sm">
                                            {getGestationalAgeDisplay(p.hpht)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800 text-base">{formatDateID(p.taksiranPersalinan)}</div>
                                        <div className="text-[10px] text-gray-400">HPHT: {formatDateID(p.hpht)}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${(p.pillProgress || 0) / 90 * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500">{p.pillProgress || 0}/90</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => setMonitoringUser(p)} className="bg-white border border-pink-200 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-medium hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all uppercase tracking-wider shadow-sm">
                                            Pantau
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pregnantList.length === 0 && !loading && (
                        <div className="py-16 text-center">
                            <p className="text-gray-300 font-medium uppercase tracking-wider text-sm">Belum ada data ibu hamil</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Modal Pantau Bulanan */}
            {monitoringUser && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
                        <div className="sticky top-0 bg-white p-5 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-serif italic font-semibold text-gray-800">Monitoring Ibu Hamil</h2>
                                <div className="text-gray-500 text-sm space-y-0.5">
                                    <p>{monitoringUser.nama} | Hamil ke-{monitoringUser.kehamilanKe}</p>
                                    <p className="text-xs text-pink-500">Usia kehamilan: {getGestationalAgeDisplay(monitoringUser.hpht)}</p>
                                </div>
                            </div>
                            <button onClick={() => setMonitoringUser(null)} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Progress Pil */}
                            <div className="bg-pink-50/40 border border-pink-100 p-4 rounded-xl">
                                <h3 className="font-semibold text-pink-600 flex items-center gap-2 text-sm mb-3"><FaCapsules /> Progress Konsumsi Pil Zat Besi</h3>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="0" max="90" value={monitoringUser.pillProgress || 0} onChange={(e) => handleUpdatePill(monitoringUser.id, parseInt(e.target.value))} className="flex-1 accent-pink-500" />
                                    <span className="font-medium text-pink-600 min-w-[50px] text-center text-sm">{monitoringUser.pillProgress || 0}/90</span>
                                </div>
                            </div>

                            {/* Form Input Bulanan */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm mb-4"><FaChartLine className="text-pink-500" /> Input Data Bulanan</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase mb-0.5">BB (kg)</label>
                                        <input type="number" step="0.1" value={monthlyForm.bb} onChange={e => setMonthlyForm({ ...monthlyForm, bb: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase mb-0.5">TB (cm)</label>
                                        <input type="number" step="0.1" value={monthlyForm.tb} onChange={e => setMonthlyForm({ ...monthlyForm, tb: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase mb-0.5">HB (g/dL)</label>
                                        <input type="number" step="0.1" value={monthlyForm.hb} onChange={e => setMonthlyForm({ ...monthlyForm, hb: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase mb-0.5">LILA (cm)</label>
                                        <input type="number" step="0.1" value={monthlyForm.lila} onChange={e => setMonthlyForm({ ...monthlyForm, lila: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <textarea placeholder="Keluhan (opsional)" value={monthlyForm.keluhan} onChange={e => setMonthlyForm({ ...monthlyForm, keluhan: e.target.value })} className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-pink-300 outline-none text-sm" rows={2} />
                                </div>
                                <Button onClick={handleSaveMonthly} className="mt-3 w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium">Simpan Data Bulanan</Button>
                            </div>

                            {/* Riwayat Bulanan */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Riwayat Pemeriksaan Bulanan</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {monitoringUser.monthlyRecords?.length > 0 ? (
                                        monitoringUser.monthlyRecords.slice().reverse().map((rec: any, idx: number) => (
                                            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 text-sm shadow-sm">
                                                <div className="flex justify-between text-xs text-gray-400 font-medium mb-1">
                                                    <span>{formatDateID(rec.tanggal)}</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div><span className="block text-[9px] text-gray-400">BB</span><span className="font-medium text-gray-700">{rec.bb} kg</span></div>
                                                    <div><span className="block text-[9px] text-gray-400">TB</span><span className="font-medium text-gray-700">{rec.tb} cm</span></div>
                                                    <div><span className="block text-[9px] text-gray-400">HB</span><span className="font-medium text-gray-700">{rec.hb} g/dL</span></div>
                                                    <div><span className="block text-[9px] text-gray-400">LILA</span><span className="font-medium text-gray-700">{rec.lila} cm</span></div>
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