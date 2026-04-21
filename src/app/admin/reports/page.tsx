'use client'

import { useState, useMemo } from 'react'
import {
    FaFilePdf, FaFileExcel, FaDownload,
    FaBaby, FaCalendarAlt, FaFemale, FaCapsules
} from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { useAdminData } from '@/hooks/useAdminData'
import { generateExcelReport, generatePDFReport } from '@/lib/reportGenerator'
import { calculateNutritionalStatus } from '@/utils/nutrition'
import { useAuth } from '@/context/AuthContext'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

export default function ReportsPage() {
    const { user } = useAuth();
    const { loading, childrenData, pregnancyData } = useAdminData() as any;

    const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'custom'>('monthly')
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // ================= DATA ANAK =================
    const processedChildren = useMemo(() => {
        if (!childrenData) return [];
        return childrenData
            .filter((c: any) => user?.role === 'admin' || c.wilayah === user?.wilayah)
            .map((child: any) => {
                const res = calculateNutritionalStatus(
                    child.ageInMonths || 0,
                    child.gender || 'male',
                    child.weightVal || 0,
                    child.heightVal || 0,
                    (child.ageInMonths || 0) < 24 ? 'baring' : 'berdiri'
                );
                return {
                    name: child.name || 'Tanpa Nama',
                    gender: child.gender === 'male' ? 'L' : 'P',
                    ageLabel: child.ageLabel || `${child.ageInMonths || 0} bln`,
                    weight: `${child.weightVal || 0} kg`,
                    height: `${child.heightVal || 0} cm`,
                    bbu: res.weightStatus.status,
                    tbu: res.heightStatus.status,
                    bbtb: res.whStatus.status,
                    statusColor: res.whStatus.color,
                    wilayah: child.wilayah || 'UMUM'
                };
            });
    }, [childrenData, user]);

    // ================= DATA IBU =================
    const processedPregnancies = useMemo(() => {
        if (!pregnancyData) return [];
        return pregnancyData
            .filter((p: any) => user?.role === 'admin' || p.wilayah === user?.wilayah)
            .map((p: any) => ({
                nama: p.nama || 'Tanpa Nama',
                wilayah: p.wilayah || 'UMUM',
                status: p.isBorn ? 'Sudah Lahir' : 'Hamil',
                usiaHamil: `${p.umurKehamilanMinggu || 0} Minggu`,
                hpl: p.taksiranPersalinan ? (p.taksiranPersalinan.toDate ? p.taksiranPersalinan.toDate() : new Date(p.taksiranPersalinan)).toLocaleDateString('id-ID') : '-',
                feProgress: p.pillFeProgress || 0,
                kelorProgress: p.pillKelorProgress || 0,
                caraLahir: p.caraPersalinan || '-',
                kondisiLahir: p.statusLahir || '-'
            }));
    }, [pregnancyData, user]);

    // ================= RINGKASAN & DETAIL WILAYAH =================
    const summaryStats = useMemo(() => {
        const pregPerWilayah: Record<string, number> = {};
        processedPregnancies.forEach((p: any) => {
            pregPerWilayah[p.wilayah] = (pregPerWilayah[p.wilayah] || 0) + 1;
        });

        const childPerWilayah: Record<string, number> = {};
        processedChildren.forEach((c: any) => {
            childPerWilayah[c.wilayah] = (childPerWilayah[c.wilayah] || 0) + 1;
        });

        return {
            totalChildren: processedChildren.length,
            totalPregnancy: processedPregnancies.length,
            pregDetails: Object.entries(pregPerWilayah).map(([wilayah, jumlah]) => ({ wilayah, jumlah })),
            childDetails: Object.entries(childPerWilayah).map(([wilayah, jumlah]) => ({ wilayah, jumlah }))
        };
    }, [processedChildren, processedPregnancies]);

    // ================= CHART DATA =================
    const childChartStats = useMemo(() => {
        const counts = { Baik: 0, Waspada: 0, Buruk: 0 };
        processedChildren.forEach((d: any) => {
            if (d.statusColor === 'green') counts.Baik++;
            else if (d.statusColor === 'orange') counts.Waspada++;
            else if (d.statusColor === 'red') counts.Buruk++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [processedChildren]);

    const pregnancyChartStats = useMemo(() => {
        const hamil = processedPregnancies.filter((p: any) => p.status === 'Hamil').length;
        const lahir = processedPregnancies.filter((p: any) => p.status === 'Sudah Lahir').length;
        return [
            { name: 'Sedang Hamil', value: hamil, color: '#ec4899' },
            { name: 'Sudah Lahir', value: lahir, color: '#8b5cf6' }
        ];
    }, [processedPregnancies]);

    const supplementStats = useMemo(() => {
        if (processedPregnancies.length === 0) return [];
        const avgFe = processedPregnancies.reduce((a: number, c: any) => a + (c.feProgress || 0), 0) / processedPregnancies.length;
        const avgKelor = processedPregnancies.reduce((a: number, c: any) => a + (c.kelorProgress || 0), 0) / processedPregnancies.length;

        return [
            { name: 'Tablet Fe', value: Math.round(avgFe), color: '#db2777' },
            { name: 'Kapsul Kelor', value: Math.round(avgKelor), color: '#059669' }
        ];
    }, [processedPregnancies]);

    // ================= EXPORT LOGIC =================
    const handleGenerate = async (format: 'pdf' | 'excel') => {
        if (processedChildren.length === 0 && processedPregnancies.length === 0) return alert('Data tidak tersedia.');

        let period = '';
        if (reportType === 'monthly') {
            const [year, month] = selectedMonth.split('-');
            period = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        } else if (reportType === 'yearly') {
            period = `Tahun ${selectedYear}`;
        } else if (reportType === 'custom') {
            period = `${startDate} s/d ${endDate}`;
        }

        setIsGenerating(true);
        try {
            const payload = {
                type: reportType,
                period,
                title: user?.role === 'bidan' ? `LAPORAN KIA WILAYAH ${user.wilayah}` : 'LAPORAN AUDIT KIA NASIONAL',
                stats: {
                    totalChildren: processedChildren.length,
                    childrenList: processedChildren,
                    pregnancyList: processedPregnancies
                },
            };
            format === 'excel' ? await generateExcelReport(payload) : await generatePDFReport(payload);
        } catch (err) {
            alert('Gagal membuat laporan');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-pink-600">MENYIAPKAN DATA...</div>;

    return (
        <div className="space-y-8 p-6 bg-white min-h-screen text-gray-800 text-left">
            <header className="border-b pb-4">
                <h1 className="text-3xl font-black italic font-serif">AUDIT GIZI & KIA</h1>
                <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mt-1">
                    {user?.role === 'bidan' ? `Wilayah: ${user.wilayah}` : 'Laporan Nasional'}
                </p>
            </header>

            {/* GRAFIK & DETAIL */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* STATUS GIZI ANAK */}
                <Card className="p-6 rounded-[2rem] shadow-sm border border-gray-100 bg-white">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 uppercase text-gray-400">
                        <FaBaby className="text-pink-500" /> Status Gizi Anak
                    </h3>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="h-[200px]">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={childChartStats} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        <Cell fill="#10b981" /> <Cell fill="#f59e0b" /> <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Anak</p>
                            <p className="text-3xl font-black">{summaryStats.totalChildren}</p>
                            <div className="mt-4 space-y-1 max-h-[100px] overflow-auto pr-2">
                                {summaryStats.childDetails.map((w, i) => (
                                    <div key={i} className="flex justify-between text-[11px] font-bold py-1 border-b border-gray-50">
                                        <span className="text-gray-500 truncate mr-2">{w.wilayah}</span>
                                        <span className="text-gray-800">{w.jumlah}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* STATUS KEHAMILAN */}
                <Card className="p-6 rounded-[2rem] shadow-sm border border-gray-100 bg-white">
                    <h3 className="text-xs font-black mb-6 flex items-center gap-2 uppercase text-gray-400">
                        <FaFemale className="text-purple-600" /> Status Kehamilan
                    </h3>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="h-[200px]">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pregnancyChartStats} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {pregnancyChartStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Ibu</p>
                            <p className="text-3xl font-black">{summaryStats.totalPregnancy}</p>
                            <div className="mt-4 space-y-1 max-h-[100px] overflow-auto pr-2">
                                {summaryStats.pregDetails.map((w, i) => (
                                    <div key={i} className="flex justify-between text-[11px] font-bold py-1 border-b border-gray-50">
                                        <span className="text-gray-500 truncate mr-2">{w.wilayah}</span>
                                        <span className="text-gray-800">{w.jumlah}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* KEPATUHAN SUPLEMEN */}
            <Card className="p-6 rounded-[2rem] shadow-sm border border-gray-100 bg-white">
                <h3 className="text-xs font-black mb-6 flex items-center gap-2 uppercase text-gray-400">
                    <FaCapsules className="text-pink-600" /> Rata-rata Kepatuhan Suplemen (%)
                </h3>
                <div className="h-[200px]">
                    <ResponsiveContainer>
                        <BarChart data={supplementStats} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 'bold' }} width={80} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                                {supplementStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* FILTER & EXPORT */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 rounded-[2rem] border border-gray-100 shadow-sm bg-white">
                    <h2 className="text-xs font-black text-gray-400 uppercase mb-6 flex items-center gap-2">
                        <FaCalendarAlt className="text-pink-500" /> Filter Rentang Waktu
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jenis Laporan</label>
                            <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm">
                                <option value="monthly">BULANAN</option>
                                <option value="yearly">TAHUNAN</option>
                                <option value="custom">KUSTOM (TANGGAL)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Periode</label>
                            {reportType === 'monthly' && (
                                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                            )}
                            {reportType === 'yearly' && (
                                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold">
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            )}
                            {reportType === 'custom' && (
                                <div className="flex gap-2">
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 p-4 bg-gray-50 rounded-2xl text-[10px] font-bold" />
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 p-4 bg-gray-50 rounded-2xl text-[10px] font-bold" />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-900 rounded-[2rem] text-white shadow-xl flex flex-col justify-center">
                    <h2 className="text-xs font-black uppercase mb-6 flex items-center gap-2 text-gray-400 tracking-widest"><FaDownload /> Export Document</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleGenerate('pdf')}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-pink-500 rounded-2xl transition-all group text-black"
                        >
                            <span className="font-black text-[10px] uppercase text-black">
                                Download PDF
                            </span>
                            <FaFilePdf size={20} className="text-pink-400 group-hover:text-white" />
                        </button>

                        <button
                            onClick={() => handleGenerate('excel')}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-emerald-500 rounded-2xl transition-all group text-black"
                        >
                            <span className="font-black text-[10px] uppercase text-black">
                                Download Excel
                            </span>
                            <FaFileExcel size={20} className="text-emerald-400 group-hover:text-white" />
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}