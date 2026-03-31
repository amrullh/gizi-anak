'use client'

import { useState } from 'react'
import { FaFilePdf, FaFileExcel, FaFileAlt, FaCalendarAlt, FaDownload } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { useAdminData } from '@/hooks/useAdminData'
import { generateExcelReport, generatePDFReport, ReportData } from '@/lib/reportGenerator'
import { calculateNutritionalStatus } from '@/utils/nutrition'

export default function ReportsPage() {
    // Ambil data dari hook admin dengan casting 'any' agar TypeScript tidak protes soal childrenData
    const { stats, alerts, loading, childrenData } = useAdminData() as any;

    const [reportType, setReportType] = useState('monthly')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedYear, setSelectedYear] = useState('2026')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async (format: 'pdf' | 'excel') => {
        // Validasi ketersediaan data sebelum mapping
        if (!stats || !childrenData || childrenData.length === 0) {
            alert('Data belum siap atau tidak ditemukan. Mohon tunggu sebentar.');
            return;
        }

        let period = reportType === 'monthly' ? selectedMonth :
            reportType === 'yearly' ? selectedYear :
                `${startDate} s/d ${endDate}`;

        if ((reportType === 'monthly' && !selectedMonth) || (reportType === 'custom' && (!startDate || !endDate))) {
            alert('Lengkapi konfigurasi periode terlebih dahulu');
            return;
        }

        // Mapping detail anak dengan casting 'any' untuk menghindari error properti dinamis (weightVal, ageInMonths, dsb)
        const childrenList = childrenData.map((child: any) => {
            // Re-calculate status untuk memastikan teks status medis konsisten
            const result = calculateNutritionalStatus(
                child.ageInMonths || 0,
                child.gender || 'male',
                child.weightVal || 0,
                child.heightVal || 0
            );

            return {
                name: child.name || 'Tanpa Nama',
                gender: child.gender === 'male' ? 'L' : 'P',
                ageLabel: child.ageLabel || `${child.ageInMonths || 0} bln`,
                weight: child.weightVal > 0 ? `${child.weightVal} kg` : '-',
                height: child.heightVal > 0 ? `${child.heightVal} cm` : '-',
                imtStatus: child.weightVal > 0 ? result.nutrition.status : 'Data Kosong',
                tbuStatus: child.heightVal > 0 ? result.stunting.status : 'Data Kosong'
            };
        });

        const reportData: ReportData = {
            type: reportType as any,
            period,
            stats: {
                totalChildren: stats.totalChildren,
                totalParents: stats.totalParents,
                goodNutrition: Math.round((stats.goodNutritionPercentage / 100) * stats.totalChildren),
                warningNutrition: alerts.length,
                badNutrition: alerts.filter((a: any) => a.color === 'red').length,
                childrenList // Data tabel detail anak
            },
        }

        setIsGenerating(true)
        try {
            if (format === 'excel') {
                await generateExcelReport(reportData)
            } else {
                await generatePDFReport(reportData)
            }
        } catch (error) {
            console.error('Build Report Error:', error)
            alert('Gagal membuat file laporan');
        } finally {
            setIsGenerating(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Export Laporan Audit Gizi</h1>
                    <p className="text-gray-600 mt-2">Daftar lengkap status IMT/U & TB/U per anak (Standar WHO 2020).</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm p-6">
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

                    <Card className="border-none shadow-sm p-6">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">2. Tentukan Rentang Waktu</h2>
                        {reportType === 'monthly' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Bulan & Tahun</label>
                                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-200" />
                            </div>
                        )}
                        {reportType === 'yearly' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Tahun Laporan</label>
                                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-4 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-purple-200">
                                    {[2026, 2025, 2024].map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                </select>
                            </div>
                        )}
                        {reportType === 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Dari Tanggal</label>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-4 border rounded-2xl outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Sampai Tanggal</label>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-4 border rounded-2xl outline-none" />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white border-none shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><FaDownload /> Export Laporan</h2>
                        <div className="space-y-4">
                            <button onClick={() => handleGenerate('pdf')} disabled={isGenerating} className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group disabled:opacity-50">
                                <FaFilePdf size={20} />
                                <div className="text-left"><div className="font-bold text-sm">FORMAT PDF</div><div className="text-[10px] opacity-70">Laporan Resmi</div></div>
                            </button>
                            <button onClick={() => handleGenerate('excel')} disabled={isGenerating} className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group disabled:opacity-50">
                                <FaFileExcel size={20} />
                                <div className="text-left"><div className="font-bold text-sm">FORMAT EXCEL</div><div className="text-[10px] opacity-70">Data Mentah</div></div>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}