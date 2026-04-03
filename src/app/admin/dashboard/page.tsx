'use client';

import {
    FaUsers,
    FaChild,
    FaNewspaper,
    FaExclamationTriangle,
    FaChartBar,
    FaPlus,
    FaEye,
    FaWhatsapp,
    FaBaby,
    FaArrowRight,
    FaFileDownload,
    FaCalendarAlt,
    FaHeartbeat,
    FaSeedling,
} from 'react-icons/fa';
import { useAdminData } from '@/hooks/useAdminData';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { loading, stats, alerts } = useAdminData();

    // Fungsi untuk menentukan warna status gizi
    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('stunting') || s.includes('malnutrisi') || s.includes('buruk'))
            return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
        if (s.includes('overweight') || s.includes('gemuk'))
            return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
        if (s.includes('obesitas') || s.includes('gemuk'))
            return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
        if (s.includes('underweight') || s.includes('kurang'))
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
        return { bg: 'bg-clay/10', text: 'text-clay', border: 'border-clay/20' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clay"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FaSeedling className="text-sage/30 text-sm" />
                        </div>
                    </div>
                    <p className="text-moss/50 font-medium tracking-wide animate-pulse">
                        Menyiapkan data puskesmas...
                    </p>
                </div>
            </div>
        );
    }

    const statsProducts = [
        {
            title: 'Total Anak',
            value: stats.totalChildren,
            desc: 'Jiwa terdaftar',
            icon: FaChild,
            link: '/admin/monitoring',
            color: 'bg-sage/10 text-sage',
        },
        {
            title: 'Gizi Baik',
            value: `${stats.goodNutritionPercentage}%`,
            desc: 'Status optimal',
            icon: FaChartBar,
            link: '/admin/monitoring?status=good',
            color: 'bg-moss/10 text-moss',
        },
        {
            title: 'Orang Tua',
            value: stats.totalParents,
            desc: 'Wali aktif',
            icon: FaUsers,
            link: '/admin/users',
            color: 'bg-tan/20 text-clay',
        },
        {
            title: 'Edukasi',
            value: stats.totalArticles,
            desc: 'Artikel kesehatan',
            icon: FaNewspaper,
            link: '/admin/articles',
            color: 'bg-cream-dark text-sage/70',
        },
    ];

    return (
        <div className="min-h-screen bg-cream pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 space-y-14">
                {/* Hero Section */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-tan/20 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="h-px w-8 bg-clay/40"></span>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-clay/60">
                                Dashboard Puskesmas
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif italic font-semibold text-moss tracking-tight leading-[1.2]">
                            Ringkasan
                            <br />
                            <span className="text-clay/50">Kesehatan Ibu & Anak</span>
                        </h1>
                        <p className="text-moss/50 max-w-lg text-base leading-relaxed pt-2">
                            Pantau status gizi, intervensi, dan kepatuhan orang tua dalam satu tampilan yang tenang dan terpercaya.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* UPDATE: Link Ekspor Laporan (Sudah Hijau Moss) */}
                        <Link
                            href="/admin/reports"
                            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-[#1A2A1A]/10 text-[#1A2A1A] font-bold text-sm hover:bg-[#1A2A1A] hover:text-white hover:border-[#1A2A1A] transition-all duration-300 shadow-sm"
                        >
                            <FaFileDownload className="text-[#1A2A1A] group-hover:text-white group-hover:translate-y-0.5 transition-all" />
                            <span>Ekspor Laporan</span>
                        </Link>
                    </div>
                </header>

                {/* Bento Grid Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                    {statsProducts.map((stat, index) => (
                        <Link key={index} href={stat.link}>
                            <motion.div
                                whileHover={{ y: -6 }}
                                className="h-full bg-white rounded-4xl border border-tan/20 p-6 shadow-sm hover:bg-[#1A2A1A] hover:border-[#1A2A1A] transition-all duration-400 flex flex-col justify-between group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-2xl ${stat.color} group-hover:bg-white/10 group-hover:text-white transition-colors`}>
                                        <stat.icon size={22} />
                                    </div>
                                    <div className="text-moss/20 group-hover:text-white/50 transition-colors">
                                        <FaArrowRight size={14} />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-moss/40 group-hover:text-white/40 transition-colors">
                                        {stat.title}
                                    </p>
                                    <p className="text-5xl font-serif italic font-black text-moss mt-1 leading-none group-hover:text-white transition-colors">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-moss/40 mt-2 group-hover:text-white/40 transition-colors">{stat.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Prioritas Intervensi + Sidebar */}
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Kolom prioritas intervensi (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-l-4 border-clay pl-5">
                            <div>
                                <h2 className="text-3xl font-serif italic text-moss">Prioritas Intervensi</h2>
                                <p className="text-moss/40 text-sm mt-1">Anak dengan status gizi memerlukan perhatian segera</p>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-clay/10 text-clay text-xs font-bold uppercase tracking-wider border border-clay/20">
                                {alerts.length} Perlu Tindakan
                            </span>
                        </div>

                        {alerts.length === 0 ? (
                            <div className="p-12 text-center rounded-5xl bg-sage/5 border border-sage/10">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                                    <FaSeedling className="text-sage text-3xl" />
                                </div>
                                <h3 className="text-xl font-serif italic font-semibold text-moss">Wilayah Terkendali</h3>
                                <p className="text-moss/40 text-sm max-w-xs mx-auto mt-1">
                                    Semua anak dalam status gizi optimal. Tetap pantau secara berkala.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5">
                                {alerts.map((alert: any, idx: number) => {
                                    const statusColor = getStatusColor(alert.status);
                                    return (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group p-5 rounded-3xl bg-white border border-tan/20 hover:bg-[#1A2A1A] hover:border-[#1A2A1A] hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row justify-between items-center gap-4 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center text-clay font-serif italic text-xl font-bold group-hover:bg-white/10 group-hover:text-white transition-colors">
                                                    {alert.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-moss text-lg group-hover:text-white transition-colors">{alert.name}</h4>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-moss/50 group-hover:text-white/40 transition-colors">
                                                        <span>{alert.age}</span>
                                                        <span className="w-1 h-1 rounded-full bg-moss/30 group-hover:bg-white/20 self-center"></span>
                                                        <span>Ortu: {alert.parent}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border transition-all duration-300 ${statusColor.bg} ${statusColor.text} ${statusColor.border} group-hover:bg-white group-hover:text-[#1A2A1A] group-hover:border-white`}
                                                >
                                                    {alert.status}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`https://wa.me/${alert.phone.replace(/[^0-9]/g, '')}`, '_blank');
                                                    }}
                                                    className="p-3 rounded-full bg-clay text-white hover:bg-clay/80 transition-all shadow-md shadow-clay/20 group-hover:bg-white group-hover:text-[#1A2A1A]"
                                                >
                                                    <FaWhatsapp size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Kanan - Akses Cepat */}
                    <div className="space-y-8">
                        <div className="p-9 rounded-[40px] bg-[#1A2A1A] text-white shadow-2xl shadow-moss/30 relative overflow-hidden border border-white/10">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-clay/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-serif italic mb-7 flex items-center gap-2.5 px-2">
                                    <FaHeartbeat className="text-clay text-xl" /> Akses Cepat
                                </h3>
                                <div className="space-y-4">
                                    <Link
                                        href="/admin/articles/new"
                                        className="flex items-center justify-between p-4.5 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all group backdrop-blur-sm"
                                    >
                                        <span className="text-sm font-semibold text-white">Tulis Artikel Edukasi</span>
                                        <FaPlus size={14} className="text-clay group-hover:rotate-90 transition" />
                                    </Link>
                                    <Link
                                        href="/admin/monitoring"
                                        className="flex items-center justify-between p-4.5 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all group backdrop-blur-sm"
                                    >
                                        <span className="text-sm font-semibold text-white">Detail Monitoring Anak</span>
                                        <FaEye size={14} className="text-clay group-hover:scale-110 transition" />
                                    </Link>
                                    <Link
                                        href="/admin/pregnancy"
                                        className="flex items-center justify-between p-4.5 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all group backdrop-blur-sm"
                                    >
                                        <span className="text-sm font-semibold text-white">Data Ibu Hamil</span>
                                        <FaBaby size={14} className="text-clay group-hover:scale-110 transition" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Catatan medis (Non-Clickable tetap putih untuk kontras) */}
                        <div className="p-8 rounded-5xl bg-white border border-tan/30 shadow-sm">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-clay/10 text-clay h-fit">
                                    <FaExclamationTriangle size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-moss/40 mb-1">
                                        Standar WHO 2020
                                    </h4>
                                    <p className="text-sm text-moss/60 leading-relaxed">
                                        Deteksi otomatis menggunakan <span className="font-bold text-moss">Z-Score</span>. Pastikan data
                                        berat dan tinggi badan diperbarui setiap bulan untuk akurasi intervensi.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-tan/20 flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-clay/60">Update terakhir: hari ini</span>
                                        <FaSeedling className="text-sage/30 text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 text-center text-xs text-moss/30 border-t border-tan/20">
                    <span>© 2026 • Sistem Pemantauan Gizi Puskesmas • Data real-time berdasarkan input petugas</span>
                </div>
            </div>
        </div>
    );
}