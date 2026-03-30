'use client'

import { FaUsers, FaChild, FaNewspaper, FaExclamationTriangle, FaChartBar, FaPlus, FaEye, FaWhatsapp, FaBaby } from 'react-icons/fa'
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
        { title: 'Total Anak', value: stats.totalChildren, icon: FaChild, bg: 'bg-purple-100', text: 'text-purple-600' },
        { title: 'Gizi Baik (IMT/U)', value: `${stats.goodNutritionPercentage}%`, icon: FaChartBar, bg: 'bg-emerald-100', text: 'text-emerald-600' },
        { title: 'Total Orang Tua', value: stats.totalParents, icon: FaUsers, bg: 'bg-blue-100', text: 'text-blue-600' },
        { title: 'Artikel Edukasi', value: stats.totalArticles, icon: FaNewspaper, bg: 'bg-pink-100', text: 'text-pink-600' },
    ];

    return (
        <div className="space-y-8 p-4 lg:p-0">
            {/* GREETING & HEADER */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight">Dashboard Puskesmas 🏥</h1>
                <p className="text-gray-500 mt-1 font-medium text-sm lg:text-base">Monitoring gizi dan stunting real-time wilayah Anda.</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm p-5 hover:scale-[1.03] transition-all duration-300">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center mb-4 shadow-inner`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tighter">{stat.value}</div>
                        <div className="text-[10px] lg:text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{stat.title}</div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ALERTS SECTION (LEFT) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-l-4 border-l-red-500 shadow-md p-6 bg-white">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                                    <FaExclamationTriangle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg lg:text-xl font-black text-gray-800">Prioritas Intervensi</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Anak berisiko Stunting & Wasting</p>
                                </div>
                            </div>
                            <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-red-200">
                                {alerts.length} KASUS
                            </div>
                        </div>

                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-lg">✨ Kondisi Wilayah Aman</p>
                                    <p className="text-xs mt-1">Semua anak memiliki status gizi optimal.</p>
                                </div>
                            ) : (
                                alerts.map((alert: any) => (
                                    <div key={alert.id} className="group border border-gray-100 rounded-2xl p-5 bg-gray-50/30 hover:bg-red-50/40 hover:border-red-100 transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="font-black text-gray-800 text-lg group-hover:text-red-700 transition-colors uppercase tracking-tight">{alert.name}</div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-[11px] bg-white px-2 py-1 rounded-md text-gray-500 font-bold border border-gray-200 shadow-sm">{alert.age}</span>
                                                    <span className="text-[11px] text-gray-400 font-bold uppercase">Ortu: {alert.parent}</span>
                                                </div>
                                                <div className="inline-flex bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                    {alert.status}
                                                </div>
                                            </div>

                                            <div className="flex flex-row sm:flex-col justify-end gap-2 shrink-0">
                                                <button
                                                    onClick={() => window.open(`https://wa.me/${alert.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                                                    className="flex-1 sm:flex-none bg-emerald-500 text-white px-6 py-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-100"
                                                >
                                                    <FaWhatsapp size={16} /> HUBUNGI WA
                                                </button>
                                                <Link
                                                    href="/admin/monitoring"
                                                    className="flex-1 sm:flex-none bg-white border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-[11px] font-black flex items-center justify-center hover:border-purple-500 hover:text-purple-600 active:scale-95 transition-all shadow-sm"
                                                >
                                                    LIHAT DATA
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* SIDEBAR ACTIONS (RIGHT) */}
                <div className="space-y-6">
                    <Card className="p-6 shadow-sm border-none bg-white">
                        <h2 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Navigasi Cepat</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <Link href="/admin/articles/new" className="flex items-center gap-4 p-4 bg-pink-50 hover:bg-pink-100 rounded-2xl transition-all border border-pink-100 group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <FaPlus size={18} />
                                </div>
                                <div className="text-xs font-black text-gray-800 uppercase tracking-tight">Tulis Artikel Baru</div>
                            </Link>

                            <Link href="/admin/monitoring" className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all border border-blue-100 group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                    <FaEye size={18} />
                                </div>
                                <div className="text-xs font-black text-gray-800 uppercase tracking-tight">Cek Monitoring Detail</div>
                            </Link>

                            <Link href="/admin/reports" className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all border border-purple-100 group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <FaNewspaper size={18} />
                                </div>
                                <div className="text-xs font-black text-gray-800 uppercase tracking-tight">Export Laporan Gizi</div>
                            </Link>
                        </div>
                    </Card>

                    {/* INFO BOX */}
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 border-none shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-100">Info Audit Medis</h3>
                            </div>
                            <p className="text-[11px] lg:text-xs text-indigo-50 leading-relaxed font-bold">
                                Algoritma deteksi saat ini menggunakan standar baku <b>Z-Score WHO 2020</b>.
                            </p>
                            <p className="text-[10px] text-indigo-200 mt-2 italic">
                                *Status Stunting didasarkan pada indikator Tinggi Badan menurut Umur (TB/U).
                            </p>
                        </div>
                        <FaBaby size={100} className="absolute -right-6 -bottom-6 text-white opacity-10 rotate-12" />
                    </Card>
                </div>
            </div>
        </div>
    )
}