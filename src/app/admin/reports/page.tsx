'use client'

import { useState } from 'react'
import { FaFilePdf, FaFileExcel, FaFileAlt, FaCalendarAlt, FaDownload, FaChartLine } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAdminData } from '@/hooks/useAdminData'
import { generateExcelReport, generatePDFReport, ReportData } from '@/lib/reportGenerator'
import { calculateNutritionalStatus } from '@/utils/nutrition'

export default function ReportsPage() {
    // Hook useAdminData sekarang sudah mengembalikan childrenData yang lengkap (BB/TB terbaru)
    const { stats, alerts, loading, childrenData } = useAdminData() as any;

    const [reportType, setReportType] = useState('monthly')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedYear, setSelectedYear] = useState('2026')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async (format: 'pdf' | 'excel') => {
        if (!stats || !childrenData || childrenData.length === 0) {
            alert('Belum ada data untuk dilaporkan');
            return;
        }

        // Susun data tabel LANGSUNG dari childrenData hasil olahan hook
        const childrenDetails = childrenData.map((child: any) => ({
            name: child.name || 'Tanpa Nama',
            gender: child.gender === 'male' ? 'L' : 'P',
            ageLabel: child.ageLabel || '-',
            weight: child.weightVal > 0 ? `${child.weightVal} kg` : '-',
            height: child.heightVal > 0 ? `${child.heightVal} cm` : '-',
            imtStatus: child.imtStatus,
            tbuStatus: child.tbuStatus
        }));

        let period = reportType === 'monthly' ? selectedMonth :
            reportType === 'yearly' ? selectedYear :
                `${startDate} s/d ${endDate}`;

        const reportData: ReportData = {
            type: reportType as any,
            period,
            stats: {
                totalChildren: stats.totalChildren,
                totalParents: stats.totalParents,

                goodNutrition: Math.round((stats.goodNutritionPercentage / 100) * stats.totalChildren),
                warningNutrition: alerts.length,
                badNutrition: alerts.filter((a: any) => a.color === 'red').length,
                childrenList: childrenDetails
            },
        };

        setIsGenerating(true);
        try {
            if (format === 'excel') await generateExcelReport(reportData);
            else await generatePDFReport(reportData);
        } catch (error) {
            alert('Gagal membuat file');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Export Laporan Audit Gizi</h1>
                    <p className="text-gray-600 mt-2">Daftar lengkap status IMT/U & TB/U per anak (Standar WHO 2020).</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* FORMAT LAPORAN */}
                    <Card className="border-none shadow-sm">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">1. Pilih Format Periode</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {['monthly', 'yearly', 'custom'].map((type) => (
                                <label key={type} className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${reportType === type ? 'border-purple-500 bg-purple-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                    <input type="radio" name="reportType" value={type} checked={reportType === type} onChange={(e) => setReportType(e.target.value)} className="mr-4 accent-purple-600 w-5 h-5" />
                                    <span className="font-bold text-gray-700 capitalize">Laporan {type === 'monthly' ? 'Bulanan' : type === 'yearly' ? 'Tahunan' : 'Kustom Tanggal'}</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    {/* PILIH WAKTU */}
                    <Card className="border-none shadow-sm">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">2. Tentukan Rentang Waktu</h2>
                        <div className="p-2">
                            {reportType === 'monthly' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Bulan & Tahun</label>
                                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
                                </div>
                            )}
                            {reportType === 'yearly' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tahun Laporan</label>
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-4 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-purple-200">
                                        {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            )}
                            {reportType === 'custom' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Dari Tanggal</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Sampai Tanggal</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-200" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* EXPORT ACTIONS */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white border-none shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><FaDownload /> Export Laporan</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => handleGenerate('pdf')}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group disabled:opacity-50"
                            >
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><FaFilePdf size={20} /></div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">FORMAT PDF</div>
                                    <div className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Laporan Resmi & Tabel</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleGenerate('excel')}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group disabled:opacity-50"
                            >
                                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><FaFileExcel size={20} /></div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">FORMAT EXCEL</div>
                                    <div className="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Data Mentah & Analisis</div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-[10px] leading-relaxed italic opacity-60">
                                * Laporan ini mencakup data antropometri lengkap (BB, TB, IMT/U, TB/U) sesuai standar Antropometri Anak Kemenkes/WHO 2020.
                            </p>
                        </div>
                    </Card>

                    {/* STATUS PREVIEW */}
                    <Card className="border-none shadow-sm p-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ringkasan Data Saat Ini</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Anak Terpantau</span>
                                <span className="text-sm font-bold text-gray-800">{stats?.totalChildren || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Total Kasus Alert</span>
                                <span className="text-sm font-bold text-red-600">{alerts?.length || 0}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-1000"
                                    style={{ width: `${stats?.goodNutritionPercentage || 0}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center font-bold">{stats?.goodNutritionPercentage || 0}% Anak dalam Kondisi Gizi Baik</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}