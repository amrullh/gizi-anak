'use client'

import { FaUsers, FaChild, FaNewspaper, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaEye, FaChartBar, FaPlus } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { useAdminData } from '@/hooks/useAdminData';
import Link from 'next/link';

export default function AdminDashboard() {
    const { loading, stats, alerts } = useAdminData();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const statsCards = [
        { title: 'Total Anak', value: stats.totalChildren.toString(), icon: FaChild, color: 'purple' },
        { title: 'Gizi Baik', value: `${stats.goodNutritionPercentage}%`, icon: FaUsers, color: 'green' },
        { title: 'Orang Tua', value: stats.totalParents.toString(), icon: FaUsers, color: 'blue' },
        { title: 'Artikel', value: stats.totalArticles.toString(), icon: FaNewspaper, color: 'pink' },
    ];

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard Puskesmas 🏥</h1>
                <p className="text-gray-600 mt-2">Overview monitoring gizi wilayah secara real-time</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition border-none shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                                <stat.icon className={`text-${stat.color}-600 text-xl`} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                        <div className="text-sm text-gray-500 font-medium">{stat.title}</div>
                    </Card>
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - ALERTS */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaExclamationTriangle className="text-red-500 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Perhatian Khusus</h2>
                                    <p className="text-sm text-gray-600">Anak dengan status gizi perlu tindakan</p>
                                </div>
                            </div>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                                {alerts.length} ALERT
                            </span>
                        </div>

                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                                    Semua anak dalam kondisi gizi baik ✨
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className="border border-red-100 rounded-xl p-4 bg-red-50/20 hover:bg-red-50/50 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-gray-800">{alert.name}</div>
                                                <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                                                    {alert.age} • {alert.parent}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    {alert.status}
                                                </span>
                                                <div className="text-[10px] text-gray-400 mt-2 italic">
                                                    Update: {alert.days === 0 ? 'Hari ini' : `${alert.days} hari lalu`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition">
                                                HUBUNGI ORANG TUA
                                            </button>
                                            <Link href={`/admin/monitoring`} className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition text-center">
                                                LIHAT DETAIL
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN - QUICK ACTIONS */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-none">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                        <div className="space-y-3">
                            <Link href="/admin/articles" className="w-full flex items-center gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition group border border-pink-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm">
                                    <FaPlus size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800 text-sm">Buat Artikel</div>
                                    <div className="text-[10px] text-pink-600 font-bold uppercase">Edukasi Kesehatan</div>
                                </div>
                            </Link>

                            <Link href="/admin/monitoring" className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition group border border-blue-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                    <FaEye size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800 text-sm">Monitoring Data</div>
                                    <div className="text-[10px] text-blue-600 font-bold uppercase">Analisis Wilayah</div>
                                </div>
                            </Link>

                            <Link href="/admin/reports" className="w-full flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition group border border-emerald-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                                    <FaChartBar size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800 text-sm">Laporan</div>
                                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Generate PDF/Excel</div>
                                </div>
                            </Link>
                        </div>
                    </Card>

                    {/* TIPS ADMIN */}
                    <Card className="bg-purple-600 text-white border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <FaNewspaper />
                            </div>
                            <span className="font-bold text-sm">Info Sistem</span>
                        </div>
                        <p className="text-xs text-purple-100 leading-relaxed">
                            Pastikan untuk memeriksa daftar **Perhatian Khusus** setiap hari untuk memantau anak dengan risiko gizi buruk di wilayah Anda.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}