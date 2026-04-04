'use client'

import { useState } from 'react'
import { FaFilePdf, FaFileExcel, FaFileAlt, FaCalendarAlt, FaDownload, FaHeartbeat, FaMapMarkerAlt } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { useAdminData } from '@/hooks/useAdminData'
import { generateExcelReport, generatePDFReport, ReportData } from '@/lib/reportGenerator'
import { calculateNutritionalStatus } from '@/utils/nutrition'
import { useAuth } from '@/context/AuthContext'

export default function ReportsPage() {
    const { user } = useAuth();
    const { stats, alerts, loading, childrenData } = useAdminData() as any;

    const [reportType, setReportType] = useState('monthly')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedYear, setSelectedYear] = useState('2026')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async (format: 'pdf' | 'excel') => {
        if (!stats || !childrenData || childrenData.length === 0) {
            alert('Data belum siap atau tidak ditemukan di wilayah ini.');
            return;
        }

        let period = reportType === 'monthly' ? selectedMonth :
            reportType === 'yearly' ? selectedYear :
                `${startDate} s/d ${endDate}`;

        if ((reportType === 'monthly' && !selectedMonth) || (reportType === 'custom' && (!startDate || !endDate))) {
            alert('Lengkapi konfigurasi periode terlebih dahulu');
            return;
        }

        const childrenList = childrenData.map((child: any) => {
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

        // FIX: Casting ke 'any' pada reportData agar tidak error jika 'title' belum ada di Interface ReportData
        const reportData: any = {
            type: reportType,
            period,
            title: user?.role === 'bidan'
                ? `Laporan Gizi Wilayah ${user.wilayah}`
                : 'Laporan Audit Gizi Puskesmas (Pusat)',
            stats: {
                totalChildren: stats.totalChildren,
                totalParents: stats.totalParents,
                goodNutrition: Math.round((stats.goodNutritionPercentage / 100) * stats.totalChildren),
                warningNutrition: alerts.length,
                badNutrition: alerts.filter((a: any) => a.color === 'red').length,
                childrenList
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
        <div className="space-y-8 p-4 md:p-6 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-px w-6 bg-pink-300"></span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">
                            {user?.role === 'bidan' ? `Wilayah: ${user.wilayah}` : 'Laporan Pusat'}
                        </span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-serif italic font-semibold text-gray-800">Laporan Audit Gizi</h1>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">1. Pilih Format Periode</h2>
                        <div className="grid grid-cols-1 gap-2">
                            {['monthly', 'yearly', 'custom'].map((type) => (
                                <label key={type} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${reportType === type ? 'border-pink-300 bg-pink-50/30' : 'border-gray-100'}`}>
                                    <input type="radio" name="reportType" value={type} checked={reportType === type} onChange={(e) => setReportType(e.target.value)} className="mr-3 accent-pink-500" />
                                    <span className="text-sm font-medium capitalize">{type} Report</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">2. Tentukan Rentang Waktu</h2>
                        {reportType === 'monthly' && (
                            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-sm" />
                        )}
                        {reportType === 'yearly' && (
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none text-sm">
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        )}
                        {reportType === 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-sm" />
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-sm" />
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaDownload className="text-pink-400" /> Export Laporan
                        </h2>
                        <div className="space-y-3">
                            <button onClick={() => handleGenerate('pdf')} disabled={isGenerating} className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-all disabled:opacity-50">
                                <FaFilePdf className="text-pink-500" />
                                <div className="text-left font-semibold text-gray-700 text-sm">FORMAT PDF</div>
                            </button>
                            <button onClick={() => handleGenerate('excel')} disabled={isGenerating} className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-all disabled:opacity-50">
                                <FaFileExcel className="text-pink-500" />
                                <div className="text-left font-semibold text-gray-700 text-sm">FORMAT EXCEL</div>
                            </button>
                        </div>
                    </Card>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-pink-300 mt-1" size={14} />
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                <span className="font-semibold text-pink-400">Scope Wilayah:</span> Laporan ini diekspor berdasarkan Wilayah {user?.wilayah || 'Nasional'}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}