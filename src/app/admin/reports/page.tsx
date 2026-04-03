'use client'

import { useState } from 'react'
import { FaFilePdf, FaFileExcel, FaFileAlt, FaCalendarAlt, FaDownload, FaHeartbeat } from 'react-icons/fa'
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
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-400"></div>
                <p className="text-xs text-pink-400 animate-pulse">Memuat data laporan...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header minimalis */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-px w-6 bg-pink-300"></span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">Laporan & Ekspor</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-serif italic font-semibold text-gray-800">Laporan Audit Gizi</h1>
                    <p className="text-gray-400 text-sm mt-1">Daftar status IMT/U & TB/U per anak (Standar WHO 2020).</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Card pilih format periode */}
                    <Card className="border border-gray-100 shadow-sm rounded-2xl p-6 bg-white">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">1. Pilih Format Periode</h2>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { value: 'monthly', label: 'Laporan Bulanan' },
                                { value: 'yearly', label: 'Laporan Tahunan' },
                                { value: 'custom', label: 'Kustom Tanggal' }
                            ].map((type) => (
                                <label
                                    key={type.value}
                                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${reportType === type.value
                                        ? 'border-pink-300 bg-pink-50/30'
                                        : 'border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="reportType"
                                        value={type.value}
                                        checked={reportType === type.value}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="mr-3 accent-pink-500 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    {/* Card rentang waktu */}
                    <Card className="border border-gray-100 shadow-sm rounded-2xl p-6 bg-white">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">2. Tentukan Rentang Waktu</h2>
                        {reportType === 'monthly' && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bulan & Tahun</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-sm"
                                />
                            </div>
                        )}
                        {reportType === 'yearly' && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tahun Laporan</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-sm"
                                >
                                    {[2026, 2025, 2024].map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                </select>
                            </div>
                        )}
                        {reportType === 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar export - dengan aksen pink minimal */}
                <div className="space-y-6">
                    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaDownload className="text-pink-400 text-sm" /> Export Laporan
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleGenerate('pdf')}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-all group disabled:opacity-50"
                            >
                                <FaFilePdf className="text-pink-500 text-lg" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-700 text-sm">FORMAT PDF</div>
                                    <div className="text-[10px] text-gray-400">Laporan resmi</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleGenerate('excel')}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-all group disabled:opacity-50"
                            >
                                <FaFileExcel className="text-pink-500 text-lg" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-700 text-sm">FORMAT EXCEL</div>
                                    <div className="text-[10px] text-gray-400">Data mentah</div>
                                </div>
                            </button>
                        </div>
                        {isGenerating && (
                            <div className="mt-4 text-center text-xs text-pink-500 animate-pulse flex items-center justify-center gap-2">
                                <FaHeartbeat className="animate-pulse" /> Sedang membuat file...
                            </div>
                        )}
                    </Card>

                    {/* Info tambahan minimalis */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            <span className="font-semibold text-pink-400">Catatan:</span> Laporan mencakup status gizi berdasarkan standar WHO 2020 (Z-Score). Pastikan data anak sudah lengkap sebelum ekspor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}