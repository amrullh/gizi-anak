'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaArrowLeft, FaCalendarCheck, FaChevronDown, FaChevronUp, FaTimes, FaCapsules, FaChartLine, FaHeartbeat, FaBirthdayCake } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { usePregnancy } from '@/hooks/usePregnancy';
import { calculateGestationalAge, calculateEstimatedDueDate } from '@/utils/pregnancy';
import { useAuth } from '@/context/AuthContext';

// Fungsi untuk menghitung usia dari tanggal lahir
const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
};

export default function AdminPregnancyPage() {
    const { user: currentUser } = useAuth();
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
        tanggalLahir: '',
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

    const estimatedDate = useMemo(() => {
        if (!form.hpht) return null;
        const hphtDate = new Date(form.hpht);
        if (isNaN(hphtDate.getTime())) return null;
        return calculateEstimatedDueDate(hphtDate);
    }, [form.hpht]);

    useEffect(() => {
        if (form.hpht) {
            const { weeks } = calculateGestationalAge(form.hpht);
            setForm(prev => ({ ...prev, umurKehamilanMinggu: weeks.toString() }));
        }
    }, [form.hpht]);

    const fetchPregnantList = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let q;
            if (currentUser.role === 'bidan' && currentUser.wilayah) {
                q = query(
                    collection(db, 'pregnancies'),
                    where('wilayah', '==', currentUser.wilayah),
                    orderBy('updatedAt', 'desc')
                );
            } else {
                q = query(collection(db, 'pregnancies'), orderBy('updatedAt', 'desc'), limit(50));
            }
            const snap = await getDocs(q);
            setPregnantList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error fetching pregnancy list:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPregnantList(); }, [currentUser]);

    useEffect(() => {
        if (search.trim() === '') {
            setUsers([]);
            setSearchError(null);
            return;
        }

        const performSearch = async () => {
            if (!currentUser) return;
            setLoading(true);
            setSearchError(null);
            try {
                let q;
                if (currentUser.role === 'bidan' && currentUser.wilayah) {
                    q = query(
                        collection(db, 'users'),
                        where('role', '==', 'parent'),
                        where('wilayah', '==', currentUser.wilayah),
                        limit(100)
                    );
                } else {
                    q = query(collection(db, 'users'), where('role', '==', 'parent'), limit(100));
                }
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
    }, [search, pregnantList, currentUser]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!estimatedDate || !selectedUser) return alert("Data HPHT atau User belum lengkap.");
        if (!form.tanggalLahir) return alert("Tanggal lahir ibu wajib diisi.");

        try {
            const payload: any = {
                userId: selectedUser.id,
                wilayah: selectedUser.wilayah || '',
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
                monthlyRecords: [],
                tanggalLahir: new Date(form.tanggalLahir),
            };

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
        } catch (err: any) { alert('Gagal update progress: ' + err.message); }
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
        } catch (err: any) { alert('Gagal simpan data bulanan: ' + err.message); }
    };

    const getGestationalAgeDisplay = (hpht: any) => {
        if (!hpht) return '-';
        const hphtDate = hpht.toDate ? hpht.toDate() : new Date(hpht);
        if (isNaN(hphtDate.getTime())) return '-';
        const { weeks, days } = calculateGestationalAge(hphtDate);
        return `${weeks} minggu ${days} hari`;
    };

    const renderAge = (birthDate: any) => {
        if (!birthDate) return '-';
        const date = birthDate.toDate ? birthDate.toDate() : new Date(birthDate);
        if (isNaN(date.getTime())) return '-';
        const { years, months, days } = calculateAge(date);
        return `${years} thn, ${months} bln`;
    };

    if (view === 'form') return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 bg-white">
            <button onClick={() => setView('select-user')} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 font-medium transition-colors">
                <FaArrowLeft /> Pilih Ulang User
            </button>
            <div className="bg-pink-50 border border-pink-100 p-6 rounded-2xl">
                <h2 className="text-xl font-serif italic font-semibold text-gray-800">Registrasi Kehamilan Baru</h2>
                <p className="text-gray-500 text-sm mt-1">Ibu: {selectedUser.name} | Wilayah: {selectedUser.wilayah || '-'}</p>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-pink-400 rounded-full"></span> Data Diri Ibu
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tanggal Lahir Ibu *</label>
                            <input
                                type="date"
                                value={form.tanggalLahir}
                                onChange={e => setForm({ ...form, tanggalLahir: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tanggal Periksa</label>
                            <input type="date" value={form.pemeriksaanTanggal} onChange={e => setForm({ ...form, pemeriksaanTanggal: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all" required />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-pink-400 rounded-full"></span> Riwayat Kehamilan
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
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
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Umur Kehamilan Saat Ini</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input type="text" value={form.hpht ? getGestationalAgeDisplay(form.hpht) : '-'} readOnly className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700" />
                                    </div>
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

    return (
        <div className="max-w-7xl mx-auto space-y-6 bg-white px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-px w-6 bg-pink-300"></span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">Ibu Hamil</span>
                    </div>
                    <h1 className="text-2xl font-serif italic font-semibold text-gray-800">Data Kehamilan Ibu</h1>
                    <p className="text-gray-400 text-sm">Monitoring wilayah: {currentUser?.wilayah || 'Semua'}</p>
                </div>
                <div className="shrink-0">
                    <Button onClick={() => setView('select-user')} className="rounded-full px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white shadow-sm flex items-center whitespace-nowrap transition-all">
                        <FaPlus className="mr-2" size={12} /> Tambah Ibu Hamil
                    </Button>
                </div>
            </div>

            {view === 'select-user' && (
                <Card className="bg-white border border-pink-100 p-6 rounded-2xl shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-pink-500 uppercase tracking-wider text-xs">Pilih Calon Ibu Hamil ({currentUser?.wilayah || 'Semua'})</h3>
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
                    <div className="grid sm:grid-cols-2 gap-3">
                        {loading && (
                            <div className="col-span-2 text-center py-6">
                                <FaSpinner className="animate-spin mx-auto text-pink-400" />
                            </div>
                        )}
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => { setSelectedUser(u); setView('form'); }}
                                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center group"
                            >
                                <div>
                                    <p className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">{u.name}</p>
                                    <p className="text-[10px] text-gray-400">Wilayah: {u.wilayah || '-'}</p>
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
                                <th className="p-4 text-pink-600">Taksiran Persalinan</th>
                                <th className="p-4 text-center">Opsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pregnantList.map(p => (
                                <tr key={p.id} className="hover:bg-pink-50/30 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{p.nama}</p>
                                        <p className="text-[10px] text-gray-400">Wilayah: {p.wilayah || '-'}</p>
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
                                    <td className="p-4 text-center">
                                        <button onClick={() => setMonitoringUser(p)} className="bg-white border border-pink-200 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-medium hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all uppercase tracking-wider shadow-sm">
                                            Pantau
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {monitoringUser && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-serif italic font-semibold text-gray-800">Monitoring {monitoringUser.nama}</h2>
                                {monitoringUser.tanggalLahir && (
                                    <p className="text-xs text-pink-500 mt-1 flex items-center gap-1">
                                        <FaBirthdayCake size={12} /> Usia: {renderAge(monitoringUser.tanggalLahir)}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setMonitoringUser(null)} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-pink-50/40 border border-pink-100 p-4 rounded-xl">
                                <h3 className="font-semibold text-pink-600 flex items-center gap-2 text-sm mb-3"><FaCapsules /> Progress Konsumsi Pil Zat Besi</h3>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="0" max="90" value={monitoringUser.pillProgress || 0} onChange={(e) => handleUpdatePill(monitoringUser.id, parseInt(e.target.value))} className="flex-1 accent-pink-500" />
                                    <span className="font-medium text-pink-600 min-w-[50px] text-center text-sm">{monitoringUser.pillProgress || 0}/90</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm mb-4"><FaChartLine className="text-pink-500" /> Input Data Bulanan</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase">BB (kg)</label>
                                        <input type="number" step="0.1" value={monthlyForm.bb} onChange={e => setMonthlyForm({ ...monthlyForm, bb: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase">TB (cm)</label>
                                        <input type="number" step="0.1" value={monthlyForm.tb} onChange={e => setMonthlyForm({ ...monthlyForm, tb: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase">HB</label>
                                        <input type="number" step="0.1" value={monthlyForm.hb} onChange={e => setMonthlyForm({ ...monthlyForm, hb: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase">LILA</label>
                                        <input type="number" step="0.1" value={monthlyForm.lila} onChange={e => setMonthlyForm({ ...monthlyForm, lila: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Keluhan (opsional)"
                                    value={monthlyForm.keluhan}
                                    onChange={e => setMonthlyForm({ ...monthlyForm, keluhan: e.target.value })}
                                    className="w-full mt-3 p-2 border rounded-lg text-sm"
                                    rows={2}
                                />
                                <Button onClick={handleSaveMonthly} className="mt-4 w-full py-2">Simpan Data Bulanan</Button>
                            </div>

                            {monitoringUser.monthlyRecords && monitoringUser.monthlyRecords.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">Riwayat Pemeriksaan</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {monitoringUser.monthlyRecords.slice().reverse().map((rec: any, idx: number) => (
                                            <div key={idx} className="bg-gray-50 p-3 rounded-lg border text-xs">
                                                <div className="flex justify-between text-gray-500 font-medium">
                                                    <span>{formatDateID(rec.tanggal)}</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 mt-1 text-center">
                                                    <div><span className="block text-gray-400">BB</span>{rec.bb} kg</div>
                                                    <div><span className="block text-gray-400">TB</span>{rec.tb} cm</div>
                                                    <div><span className="block text-gray-400">HB</span>{rec.hb} g/dL</div>
                                                    <div><span className="block text-gray-400">LILA</span>{rec.lila} cm</div>
                                                </div>
                                                {rec.keluhan && <p className="mt-1 text-gray-500 italic">Keluhan: {rec.keluhan}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}