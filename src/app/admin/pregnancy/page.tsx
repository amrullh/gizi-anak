'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaArrowLeft, FaCalendarCheck, FaChevronDown, FaChevronUp, FaTimes, FaCapsules, FaChartLine, FaBirthdayCake, FaUserTie, FaGraduationCap, FaHistory } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { usePregnancy } from '@/hooks/usePregnancy';
import { calculateGestationalAge, calculateEstimatedDueDate } from '@/utils/pregnancy';
import { useAuth } from '@/context/AuthContext';

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
        // New Fields
        pendidikan: '',
        pekerjaan: '',
        jarakKehamilan: '',
        riwayatKomplikasi: ''
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
            return;
        }

        const performSearch = async () => {
            if (!currentUser) return;
            setLoading(true);
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
                pillLogs: [], // Initial empty logs
                monthlyRecords: [],
                tanggalLahir: new Date(form.tanggalLahir),
                // New demography fields
                pendidikan: form.pendidikan,
                pekerjaan: form.pekerjaan,
                jarakKehamilan: form.jarakKehamilan,
                riwayatKomplikasi: form.riwayatKomplikasi
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

    const handleAddPill = async (pregnancy: any) => {
        try {
            const currentProgress = pregnancy.pillProgress || 0;
            if (currentProgress >= 90) return alert("Target 90 pil sudah tercapai.");

            const newProgress = currentProgress + 1;
            const newLog = {
                date: Timestamp.now(),
                count: newProgress
            };

            const updatedLogs = [...(pregnancy.pillLogs || []), newLog];
            const pregnancyRef = doc(db, 'pregnancies', pregnancy.id);

            await updateDoc(pregnancyRef, {
                pillProgress: newProgress,
                pillLogs: updatedLogs
            });

            // Update local state for modal
            setMonitoringUser((prev: any) => ({
                ...prev,
                pillProgress: newProgress,
                pillLogs: updatedLogs
            }));
            fetchPregnantList();
        } catch (err: any) {
            alert('Gagal update pil: ' + err.message);
        }
    };

    const handleSaveMonthly = async () => {
        if (!monitoringUser) return;
        if (!monthlyForm.bb || !monthlyForm.tb || !monthlyForm.hb || !monthlyForm.lila) {
            alert('Harap isi semua data (BB, TB, HB, LILA)');
            return;
        }

        try {
            const lilaVal = parseFloat(monthlyForm.lila);
            const newRecord = {
                tanggal: Timestamp.now(),
                bb: parseFloat(monthlyForm.bb),
                tb: parseFloat(monthlyForm.tb),
                hb: parseFloat(monthlyForm.hb),
                lila: lilaVal,
                statusLila: lilaVal < 23.5 ? 'KEK' : 'Normal',
                keluhan: monthlyForm.keluhan || '',
            };
            const updatedRecords = [...(monitoringUser.monthlyRecords || []), newRecord];
            const pregnancyRef = doc(db, 'pregnancies', monitoringUser.id);
            await updateDoc(pregnancyRef, { monthlyRecords: updatedRecords });

            alert('Data bulanan berhasil disimpan!');
            setMonthlyForm({ bb: '', tb: '', hb: '', lila: '', keluhan: '' });
            setMonitoringUser((prev: any) => ({ ...prev, monthlyRecords: updatedRecords }));
            fetchPregnantList();
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
        const { years, months } = calculateAge(date);
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
                {/* Section 1: Data Diri & Demografi */}
                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-pink-400 rounded-full"></span> Data Demografi Ibu
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tanggal Lahir Ibu *</label>
                            <input type="date" value={form.tanggalLahir} onChange={e => setForm({ ...form, tanggalLahir: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Pendidikan Terakhir</label>
                            <select value={form.pendidikan} onChange={e => setForm({ ...form, pendidikan: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                <option value="">Pilih Pendidikan</option>
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA/SMK">SMA/SMK</option>
                                <option value="Diploma/Sarjana">Diploma/Sarjana</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Pekerjaan</label>
                            <input type="text" placeholder="Contoh: IRT, Guru" value={form.pekerjaan} onChange={e => setForm({ ...form, pekerjaan: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tanggal Periksa</label>
                            <input type="date" value={form.pemeriksaanTanggal} onChange={e => setForm({ ...form, pemeriksaanTanggal: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
                        </div>
                    </div>
                </Card>

                {/* Section 2: Riwayat Kehamilan & Paritas */}
                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-pink-400 rounded-full"></span> Paritas & Gravida
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Kehamilan Ke- (Gravida)</label>
                                <input type="number" value={form.kehamilanKe} onChange={e => setForm({ ...form, kehamilanKe: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Anak Hidup (Paritas)</label>
                                <input type="number" value={form.jumlahAnakHidup} onChange={e => setForm({ ...form, jumlahAnakHidup: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
                            </div>
                        </div>

                        {parseInt(form.kehamilanKe) > 1 && (
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Jarak Kehamilan (Tahun/Bulan)</label>
                                <input type="text" placeholder="Misal: 2 Tahun" value={form.jarakKehamilan} onChange={e => setForm({ ...form, jarakKehamilan: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Riwayat Kehamilan/Persalinan Sebelumnya (Komplikasi)</label>
                            <textarea placeholder="Tuliskan jika ada riwayat operasi caesar, pendarahan, dll" value={form.riwayatKomplikasi} onChange={e => setForm({ ...form, riwayatKomplikasi: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" rows={2} />
                        </div>

                        <div className="md:col-span-2 p-4 bg-pink-50/30 border border-pink-100 rounded-xl flex flex-wrap items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.pernahAbortus} onChange={e => setForm({ ...form, pernahAbortus: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-pink-500" />
                                <span className="text-sm text-gray-700 font-medium">Pernah Abortus?</span>
                            </label>
                            {form.pernahAbortus && (
                                <input type="number" placeholder="Abortus Kehamilan Ke-" value={form.abortusAnakKe} onChange={e => setForm({ ...form, abortusAnakKe: e.target.value })} className="flex-1 p-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" required />
                            )}
                        </div>
                    </div>
                </Card>

                {/* Section 3: HPHT & HPL */}
                <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
                    <h3 className="font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <FaCalendarCheck className="text-pink-500 text-sm" /> Perhitungan Medis (HPHT)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-medium text-pink-500 uppercase mb-1">Tanggal HPHT *</label>
                            <input type="date" value={form.hpht} onChange={e => setForm({ ...form, hpht: e.target.value })} className="w-full p-3 bg-pink-50 border border-pink-200 rounded-xl outline-none" required />
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl">
                                <p className="text-[10px] font-medium text-pink-500 uppercase tracking-wider">Taksiran Persalinan (HPL)</p>
                                <p className="text-lg font-semibold text-gray-800 mt-0.5">{formatDateID(estimatedDate)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] font-medium text-gray-400 uppercase">Usia Kehamilan Saat Ini</p>
                                <p className="text-lg font-semibold text-gray-700">{form.hpht ? getGestationalAgeDisplay(form.hpht) : '-'}</p>
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
                        <div className="p-5 grid gap-4 bg-gray-50 border-t">
                            <textarea placeholder="Keluhan Trimester I" value={form.keluhanTrimester1} onChange={e => setForm({ ...form, keluhanTrimester1: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none text-sm" rows={2} />
                            <textarea placeholder="Keluhan Trimester II" value={form.keluhanTrimester2} onChange={e => setForm({ ...form, keluhanTrimester2: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none text-sm" rows={2} />
                            <textarea placeholder="Keluhan Trimester III" value={form.keluhanTrimester3} onChange={e => setForm({ ...form, keluhanTrimester3: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none text-sm" rows={2} />
                        </div>
                    )}
                </div>

                <Button type="submit" fullWidth disabled={isSaving} className="py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-all shadow-lg">
                    {isSaving ? <FaSpinner className="animate-spin mx-auto" /> : 'SIMPAN DATA KEHAMILAN'}
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
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">Monitoring Petugas</span>
                    </div>
                    <h1 className="text-2xl font-serif italic font-semibold text-gray-800">Daftar Ibu Hamil</h1>
                </div>
                <Button onClick={() => setView('select-user')} className="rounded-full px-5 py-2.5 bg-pink-500 text-white shadow-sm flex items-center">
                    <FaPlus className="mr-2" size={12} /> Tambah Ibu Hamil
                </Button>
            </div>

            {view === 'select-user' && (
                <Card className="bg-white border border-pink-100 p-6 rounded-2xl shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-pink-500 uppercase tracking-wider text-xs">Pilih Calon Ibu Hamil</h3>
                        <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600"><FaTimes size={18} /></button>
                    </div>
                    <div className="relative mb-6">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 text-sm" />
                        <input type="text" placeholder="Cari nama ibu..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {loading && <div className="col-span-2 text-center py-6"><FaSpinner className="animate-spin mx-auto text-pink-400" /></div>}
                        {users.map(u => (
                            <div key={u.id} onClick={() => { setSelectedUser(u); setView('form'); }} className="p-4 bg-white border border-gray-100 rounded-xl hover:border-pink-300 transition-all cursor-pointer flex justify-between items-center group">
                                <div>
                                    <p className="font-medium text-gray-800 group-hover:text-pink-600">{u.name}</p>
                                    <p className="text-[10px] text-gray-400">Puskesmas: {u.wilayah || '-'}</p>
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
                        <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Identitas Ibu</th>
                                <th className="p-4">Usia Kehamilan</th>
                                <th className="p-4 text-pink-600">Taksiran Persalinan</th>
                                <th className="p-4 text-center">Opsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pregnantList.map(p => (
                                <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">{p.nama}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Gravida: {p.kehamilanKe}</span>
                                            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Paritas: {p.jumlahAnakHidup}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-pink-600">
                                        {getGestationalAgeDisplay(p.hpht)}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800">{formatDateID(p.taksiranPersalinan)}</div>
                                        
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => setMonitoringUser(p)} className="bg-white border border-pink-200 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-pink-500 hover:text-white transition-all uppercase tracking-wider">
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-pink-50 to-white">
                            <div>
                                <h2 className="text-xl font-serif italic font-bold text-gray-800">Detail Monitoring</h2>
                                <p className="text-xs text-pink-500 font-medium">{monitoringUser.nama} • {renderAge(monitoringUser.tanggalLahir)}</p>
                            </div>
                            <button onClick={() => setMonitoringUser(null)} className="p-2 hover:bg-pink-100 rounded-full text-pink-500 transition-colors"><FaTimes size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            {/* Demographic & Pregnancy Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><FaGraduationCap /> Pendidikan</p>
                                    <p className="text-sm font-semibold text-gray-700">{monitoringUser.pendidikan || '-'}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1"><FaUserTie /> Pekerjaan</p>
                                    <p className="text-sm font-semibold text-gray-700">{monitoringUser.pekerjaan || '-'}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Status Paritas</p>
                                    <p className="text-sm font-semibold text-gray-700">G{monitoringUser.kehamilanKe} P{monitoringUser.jumlahAnakHidup}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Jarak Kehamilan</p>
                                    <p className="text-sm font-semibold text-gray-700">{monitoringUser.jarakKehamilan || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Section: Pill Fe Monitoring (Improved) */}
                            <div className="bg-pink-50/50 border border-pink-100 p-5 rounded-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-pink-600 flex items-center gap-2 text-sm uppercase"><FaCapsules /> Kontrol Pil Zat Besi (Fe)</h3>
                                    <span className="text-2xl font-black text-pink-600">{monitoringUser.pillProgress || 0}<span className="text-xs text-pink-300 font-normal">/90</span></span>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <div className="flex-1 bg-white h-3 rounded-full overflow-hidden border border-pink-100">
                                        <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${((monitoringUser.pillProgress || 0) / 90) * 100}%` }} />
                                    </div>
                                    <button
                                        onClick={() => handleAddPill(monitoringUser)}
                                        className="bg-pink-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                                    >
                                        <FaPlus size={20} />
                                    </button>
                                </div>

                                {monitoringUser.pillLogs && monitoringUser.pillLogs.length > 0 && (
                                    <div className="mt-4 border-t border-pink-100 pt-3">
                                        <p className="text-[10px] font-bold text-pink-400 uppercase mb-2 flex items-center gap-1"><FaHistory /> 3 Riwayat Terakhir</p>
                                        <div className="space-y-1.5">
                                            {monitoringUser.pillLogs.slice(-3).reverse().map((log: any, i: number) => (
                                                <div key={i} className="flex justify-between text-[11px] bg-white/60 px-3 py-1.5 rounded-lg border border-pink-50 text-gray-600">
                                                    <span>Minum Pil Ke-{log.count}</span>
                                                    <span className="font-bold">{formatDateID(log.date)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section: Monthly Record Form */}
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm mb-4 uppercase"><FaChartLine className="text-pink-500" /> Input Pemeriksaan Bulanan</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">BB (kg)</label>
                                        <input type="number" value={monthlyForm.bb} onChange={e => setMonthlyForm({ ...monthlyForm, bb: e.target.value })} className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-1 focus:ring-pink-300" placeholder="0.0" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">TB (cm)</label>
                                        <input type="number" value={monthlyForm.tb} onChange={e => setMonthlyForm({ ...monthlyForm, tb: e.target.value })} className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-1 focus:ring-pink-300" placeholder="0" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">HB (g/dL)</label>
                                        <input type="number" value={monthlyForm.hb} onChange={e => setMonthlyForm({ ...monthlyForm, hb: e.target.value })} className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-1 focus:ring-pink-300" placeholder="0.0" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">LILA (cm)</label>
                                        <input
                                            type="number"
                                            value={monthlyForm.lila}
                                            onChange={e => setMonthlyForm({ ...monthlyForm, lila: e.target.value })}
                                            className={`w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:ring-1 ${parseFloat(monthlyForm.lila) < 23.5 ? 'border-red-500 focus:ring-red-200' : 'focus:ring-pink-300'}`}
                                            placeholder="0.0"
                                        />
                                        {monthlyForm.lila && (
                                            <p className={`text-[9px] font-black italic mt-1 ${parseFloat(monthlyForm.lila) < 23.5 ? 'text-red-500' : 'text-green-600'}`}>
                                                {parseFloat(monthlyForm.lila) < 23.5 ? '⚠️ STATUS: KEK' : '✅ STATUS: NORMAL'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <textarea placeholder="Catatan/Keluhan bulan ini..." value={monthlyForm.keluhan} onChange={e => setMonthlyForm({ ...monthlyForm, keluhan: e.target.value })} className="w-full mt-4 p-3 bg-white border rounded-xl text-sm outline-none" rows={2} />
                                <Button onClick={handleSaveMonthly} className="mt-4 w-full py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-black transition-all">SIMPAN DATA BULANAN</Button>
                            </div>

                            {/* Section: History Records */}
                            {monitoringUser.monthlyRecords && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-widest">Riwayat Pemeriksaan</h3>
                                    <div className="space-y-3">
                                        {monitoringUser.monthlyRecords.slice().reverse().map((rec: any, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-2xl border transition-all ${rec.statusLila === 'KEK' ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100 shadow-sm'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-gray-500">{formatDateID(rec.tanggal)}</span>
                                                    {rec.statusLila === 'KEK' && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">RISIKO KEK</span>}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 text-center border-t border-gray-50 pt-3">
                                                    <div><p className="text-[9px] text-gray-400 uppercase">BB</p><p className="font-bold text-gray-700">{rec.bb}kg</p></div>
                                                    <div><p className="text-[9px] text-gray-400 uppercase">TB</p><p className="font-bold text-gray-700">{rec.tb}cm</p></div>
                                                    <div><p className="text-[9px] text-gray-400 uppercase">HB</p><p className="font-bold text-gray-700">{rec.hb}</p></div>
                                                    <div><p className="text-[9px] text-gray-400 uppercase">LILA</p><p className="font-bold text-gray-700">{rec.lila}cm</p></div>
                                                </div>
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