'use client'

import { useState, useMemo } from 'react'
import {
    FaFilePdf, FaFileExcel, FaDownload, FaMapMarkerAlt,
    FaChartPie, FaChartBar, FaBaby, FaInfoCircle, FaCalendarAlt
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
    const { loading, childrenData } = useAdminData() as any;

    const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'custom'>('monthly')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedYear, setSelectedYear] = useState('2026')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // 1. DATA PROCESSING (Sertakan Properti WILAYAH agar bisa di-grouping)
    const processedReportData = useMemo(() => {
        if (!childrenData || childrenData.length === 0) return [];
        return childrenData
            .filter((child: any) => {
                if (user?.role === 'bidan' && user.wilayah) {
                    return child.wilayah === user.wilayah;
                }
                return true;
            })
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
                    // KUNCI PERBAIKAN: Property 'wilayah' harus di-pass ke generator laporan
                    wilayah: child.wilayah || user?.wilayah || 'UMUM'
                };
            });
    }, [childrenData, user]);

    // 2. DATA UNTUK VISUALISASI GRAFIK
    const chartStats = useMemo(() => {
        const counts = { green: 0, orange: 0, red: 0 };
        processedReportData.forEach((d: any) => {
            if (d.statusColor === 'green') counts.green++;
            else if (d.statusColor === 'orange') counts.orange++;
            else if (d.statusColor === 'red') counts.red++;
        });

        return [
            { name: 'Gizi Baik', value: counts.green, color: '#10b981' },
            { name: 'Waspada', value: counts.orange, color: '#f59e0b' },
            { name: 'Gizi Buruk', value: counts.red, color: '#ef4444' },
        ];
    }, [processedReportData]);

    const totalChildren = processedReportData.length;
    const baikCount = chartStats.find(s => s.name === 'Gizi Baik')?.value || 0;
    const waspadaCount = chartStats.find(s => s.name === 'Waspada')?.value || 0;
    const burukCount = chartStats.find(s => s.name === 'Gizi Buruk')?.value || 0;

    const handleGenerate = async (format: 'pdf' | 'excel') => {
        if (processedReportData.length === 0) return alert('Data belum tersedia untuk wilayah ini.');

        let period = reportType === 'monthly' ? selectedMonth :
            reportType === 'yearly' ? selectedYear :
                `${startDate} s/d ${endDate}`;

        if ((reportType === 'monthly' && !selectedMonth) || (reportType === 'custom' && (!startDate || !endDate))) {
            return alert('Harap pilih periode waktu terlebih dahulu.');
        }

        setIsGenerating(true)
        try {
            const reportPayload: any = {
                type: reportType,
                period,
                title: user?.role === 'bidan' ? `Laporan Gizi Wilayah ${user.wilayah}` : 'Laporan Audit Gizi Nasional',
                stats: {
                    totalChildren: processedReportData.length,
                    childrenList: processedReportData // Wilayah sudah ada di sini
                },
            };
            format === 'excel' ? await generateExcelReport(reportPayload) : await generatePDFReport(reportPayload);
        } catch (error) {
            console.error(error);
            alert('Gagal mengekspor laporan');
        } finally {
            setIsGenerating(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                <p className="text-xs font-bold text-pink-500 animate-pulse uppercase tracking-widest text-center">Menyiapkan Laporan...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-6 bg-white min-h-screen">
            <header className="border-b border-gray-100 pb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-px w-6 bg-pink-300"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                            {user?.role === 'bidan' ? `Wilayah: ${user.wilayah}` : 'Pusat Audit Nasional'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 italic font-serif uppercase tracking-tighter text-left">Laporan Audit Gizi</h1>
                </div>
            </header>

            {/* VISUALISASI DATA */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* DONUT CHART */}
                <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-gray-50/50">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 text-left">
                        <FaChartPie className="text-pink-500" /> Proporsi Status Gizi
                    </h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartStats} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                                    {chartStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#fff', color: '#1f2937' }} />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-2 text-center">
                        <div><p className="text-[8px] font-bold text-gray-400 uppercase">Total</p><p className="text-lg font-black text-gray-800">{totalChildren}</p></div>
                        <div><p className="text-[8px] font-bold text-gray-400 uppercase">Baik</p><p className="text-lg font-black text-green-600">{baikCount}</p></div>
                        <div><p className="text-[8px] font-bold text-gray-400 uppercase">Waspada</p><p className="text-lg font-black text-amber-500">{waspadaCount}</p></div>
                        <div><p className="text-[8px] font-bold text-gray-400 uppercase">Buruk</p><p className="text-lg font-black text-red-500">{burukCount}</p></div>
                    </div>
                </Card>

                {/* BAR CHART */}
                <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-gray-50/50">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 text-left">
                        <FaChartBar className="text-blue-500" /> Statistik Jumlah Anak
                    </h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '800', fill: '#374151' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '600', fill: '#374151' }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#fff' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                                    {chartStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* KONFIGURASI PERIODE */}
                <div className="lg:col-span-2 space-y-6 text-left">
                    <Card className="p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-xs font-black text-gray-400 uppercase mb-6 flex items-center gap-2">
                            <FaCalendarAlt className="text-pink-500" /> Filter Rentang Waktu
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Jenis Laporan</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as any)}
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-black text-gray-700"
                                >
                                    <option value="monthly">LAPORAN BULANAN</option>
                                    <option value="yearly">LAPORAN TAHUNAN</option>
                                    <option value="custom">RENTANG TANGGAL KUSTOM</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Pilih Periode</label>
                                {reportType === 'monthly' && (
                                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700" />
                                )}
                                {reportType === 'yearly' && (
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700">
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                    </select>
                                )}
                                {reportType === 'custom' && (
                                    <div className="flex gap-2">
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 p-4 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-700" />
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 p-4 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-700" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* DOWNLOAD ACTIONS */}
                <div className="space-y-4">
                    <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] text-white shadow-xl shadow-gray-200">
                        <h2 className="text-xs font-black uppercase mb-6 flex items-center gap-2 text-gray-400 tracking-widest"><FaDownload /> Export Document</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleGenerate('pdf')}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-pink-500 rounded-2xl transition-all group border border-white/5"
                            >
                                <span className="font-black text-[10px] uppercase tracking-widest">Download PDF</span>
                                <FaFilePdf size={24} className="group-hover:scale-110 transition-transform text-pink-400 group-hover:text-white" />
                            </button>
                            <button
                                onClick={() => handleGenerate('excel')}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-emerald-500 rounded-2xl transition-all group border border-white/5"
                            >
                                <span className="font-black text-[10px] uppercase tracking-widest">Download Excel</span>
                                <FaFileExcel size={24} className="group-hover:scale-110 transition-transform text-emerald-400 group-hover:text-white" />
                            </button>
                        </div>
                    </Card>
                    <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100 flex items-start gap-3 text-left">
                        <FaMapMarkerAlt className="text-pink-500 mt-1" />
                        <div>
                            <p className="text-[10px] font-black text-pink-600 uppercase">Verifikasi Akses</p>
                            <p className="text-[9px] font-bold text-pink-400 leading-relaxed mt-1">Laporan ini hanya mencakup data anak yang terdaftar di wilayah Puskesmas {user?.wilayah || 'Anda'}.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}