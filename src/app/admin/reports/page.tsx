'use client'

import { useState } from 'react'
import { FaFilePdf, FaFileExcel, FaFileAlt, FaCalendarAlt, FaDownload, FaChartLine } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAdminStats } from '@/hooks/useAdminStats'
import { generateExcelReport, generatePDFReport, ReportData } from '@/lib/reportGenerator'

export default function ReportsPage() {
    const { stats, loading } = useAdminStats()
    const [reportType, setReportType] = useState('monthly')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedYear, setSelectedYear] = useState('2024')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async (format: 'pdf' | 'excel') => {
        if (!stats) return

        let period = ''
        if (reportType === 'monthly') {
            if (!selectedMonth) {
                alert('Pilih bulan terlebih dahulu')
                return
            }
            period = selectedMonth
        } else if (reportType === 'yearly') {
            period = selectedYear
        } else {
            if (!startDate || !endDate) {
                alert('Pilih rentang tanggal')
                return
            }
            period = `${startDate} s/d ${endDate}`
        }

        const reportData: ReportData = {
            type: reportType as any,
            period,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            stats: {
                totalChildren: stats.totalChildren,
                totalParents: stats.totalParents,
                totalArticles: stats.totalArticles,
                goodNutrition: stats.goodNutrition,
                warningNutrition: stats.warningNutrition,
                badNutrition: stats.badNutrition,
                childrenByRegion: stats.childrenByRegion,
            },
        }

        setIsGenerating(true)
        try {
            if (format === 'excel') {
                generateExcelReport(reportData)
            } else {
                generatePDFReport(reportData)
            }
        } catch (error) {
            console.error(error)
            alert('Gagal generate laporan')
        } finally {
            setIsGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Generate Laporan</h1>
                <p className="text-gray-600 mt-2">Buat dan export laporan monitoring gizi</p>
            </div>

            {/* MAIN GRID */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - REPORT OPTIONS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* JENIS LAPORAN */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Jenis Laporan</h2>
                        <div className="space-y-4">
                            <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition ${reportType === 'monthly' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                                }`}>
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="monthly"
                                    checked={reportType === 'monthly'}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="mt-1 mr-4"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FaCalendarAlt className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">Laporan Bulanan</div>
                                            <div className="text-sm text-gray-600">Ringkasan data monitoring per bulan</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border">
                                        Format: PDF/Excel • Termasuk grafik trend dan statistik
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition ${reportType === 'yearly' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                                }`}>
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="yearly"
                                    checked={reportType === 'yearly'}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="mt-1 mr-4"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <FaChartLine className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">Laporan Tahunan</div>
                                            <div className="text-sm text-gray-600">Analisis trend gizi tahunan</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border">
                                        Format: PDF/Excel • Termasuk perbandingan tahun sebelumnya
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition ${reportType === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                                }`}>
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="custom"
                                    checked={reportType === 'custom'}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="mt-1 mr-4"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <FaFileAlt className="text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">Laporan Kustom</div>
                                            <div className="text-sm text-gray-600">Pilih periode dan data spesifik</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border">
                                        Format: PDF/Excel • Filter wilayah dan status gizi
                                    </div>
                                </div>
                            </label>
                        </div>
                    </Card>

                    {/* PERIODE LAPORAN */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Periode</h2>

                        {reportType === 'monthly' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Bulan & Tahun</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        )}

                        {reportType === 'yearly' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Tahun</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="input-field"
                                >
                                    {[2024, 2023, 2022, 2021, 2020].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {reportType === 'custom' && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* RIGHT COLUMN - EXPORT OPTIONS */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Format Export</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => handleGenerate('pdf')}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition border-2 border-transparent hover:border-purple-300 disabled:opacity-50"
                            >
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaFilePdf className="text-red-600 text-xl" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-800">PDF Document</div>
                                    <div className="text-xs text-gray-500">Full report with charts</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleGenerate('excel')}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition border-2 border-transparent hover:border-purple-300 disabled:opacity-50"
                            >
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <FaFileExcel className="text-emerald-600 text-xl" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-800">Excel Spreadsheet</div>
                                    <div className="text-xs text-gray-500">Raw data for analysis</div>
                                </div>
                            </button>

                            <button
                                disabled
                                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition border-2 border-transparent opacity-50 cursor-not-allowed"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaChartLine className="text-blue-600 text-xl" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-800">Charts Only</div>
                                    <div className="text-xs text-gray-500">Visualization graphs (coming soon)</div>
                                </div>
                            </button>
                        </div>
                    </Card>

                    {/* PREVIEW & GENERATE */}
                    <Card>
                        <div className="text-center p-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaFileAlt className="text-purple-600 text-3xl" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">Siap Generate Laporan</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Laporan akan mencakup data statistik dan grafik perkembangan
                            </p>
                            <Button
                                fullWidth
                                disabled={isGenerating}
                                onClick={() => handleGenerate('pdf')}
                            >
                                <FaDownload className="inline mr-2" />
                                {isGenerating ? 'Memproses...' : 'Generate Laporan'}
                            </Button>
                        </div>
                    </Card>

                    {/* RECENT REPORTS (masih dummy) */}
                    <Card>
                        <h3 className="font-semibold text-gray-800 mb-4">Laporan Terakhir</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-800">Laporan Bulanan Jan 2024</div>
                                    <div className="text-xs text-gray-500">2 Feb 2024 • 2.3 MB</div>
                                </div>
                                <button className="text-purple-500 hover:text-purple-700">
                                    <FaDownload size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-800">Laporan Tahunan 2023</div>
                                    <div className="text-xs text-gray-500">5 Jan 2024 • 5.1 MB</div>
                                </div>
                                <button className="text-purple-500 hover:text-purple-700">
                                    <FaDownload size={16} />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}