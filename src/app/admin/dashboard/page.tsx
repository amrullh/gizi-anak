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
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const { loading, stats, alerts } = useAdminData();

    // Floating icons (seperti tema sebelumnya)
    const floatingIcons = [
        { icon: '❤️', left: '2%', top: '10%', delay: 0, duration: 7 },
        { icon: '🩺', left: '90%', top: '20%', delay: 1, duration: 8 },
        { icon: '👶', left: '5%', top: '85%', delay: 2, duration: 6 },
        { icon: '🌡️', left: '85%', top: '75%', delay: 3, duration: 9 },
        { icon: '💊', left: '50%', top: '50%', delay: 0.5, duration: 7 },
        { icon: '🫀', left: '15%', top: '40%', delay: 1.5, duration: 8 },
        { icon: '🍼', left: '80%', top: '60%', delay: 2.5, duration: 6 },
    ];

    // Warna status gizi (tetap menggunakan logika, tapi warna lebih cerah)
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
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FaHeartbeat className="text-pink-300 text-sm animate-pulse" />
                        </div>
                    </div>
                    <p className="text-pink-400 font-medium tracking-wide animate-pulse">
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
            color: 'bg-pink-100 text-pink-600',
        },
        {
            title: 'Gizi Baik',
            value: `${stats.goodNutritionPercentage}%`,
            desc: 'Status optimal',
            icon: FaChartBar,
            link: '/admin/monitoring?status=good',
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Orang Tua',
            value: stats.totalParents,
            desc: 'Wali aktif',
            icon: FaUsers,
            link: '/admin/users',
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Edukasi',
            value: stats.totalArticles,
            desc: 'Artikel kesehatan',
            icon: FaNewspaper,
            link: '/admin/articles',
            color: 'bg-yellow-100 text-yellow-600',
        },
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-24 overflow-x-hidden">
            {/* Floating medical icons (sama seperti tema sebelumnya) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {floatingIcons.map((item, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-2xl md:text-4xl opacity-20"
                        style={{ left: item.left, top: item.top }}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: item.duration,
                            delay: item.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {item.icon}
                    </motion.div>
                ))}
            </div>

            {/* Subtle gradient orbs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 space-y-14">
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-pink-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="h-px w-8 bg-pink-400"></span>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-pink-500">
                                Dashboard Puskesmas
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif italic font-semibold text-gray-800 tracking-tight leading-[1.2]">
                            Ringkasan
                            <br />
                            <span className="text-pink-500">Kesehatan Ibu & Anak</span>
                        </h1>
                        <p className="text-gray-500 max-w-lg text-base leading-relaxed pt-2">
                            Pantau status gizi, intervensi, dan kepatuhan orang tua dalam satu tampilan yang tenang dan terpercaya.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* Tombol Ekspor Laporan dengan hover pink */}
                        <Link
                            href="/admin/reports"
                            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-pink-500 text-white font-bold text-sm hover:bg-pink-600 transition-all duration-300 shadow-md hover:shadow-pink-200"
                        >
                            <FaFileDownload className="text-white group-hover:translate-y-0.5 transition-all" />
                            <span>Ekspor Laporan</span>
                        </Link>
                    </div>
                </header>

                {/* Bento Grid Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                    {statsProducts.map((stat, index) => (
                        <Link key={index} href={stat.link}>
                            <motion.div
                                whileHover={{ y: -6, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="h-full bg-white rounded-2xl border border-pink-100 p-6 shadow-sm hover:shadow-pink-200/50 hover:border-pink-300 transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl ${stat.color} group-hover:bg-pink-500 group-hover:text-white transition-colors`}>
                                        <stat.icon size={22} />
                                    </div>
                                    <div className="text-pink-200 group-hover:text-pink-400 transition-colors">
                                        <FaArrowRight size={14} />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-pink-400 transition-colors">
                                        {stat.title}
                                    </p>
                                    <p className="text-5xl font-serif italic font-black text-gray-800 mt-1 leading-none group-hover:text-pink-600 transition-colors">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-500 transition-colors">{stat.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Prioritas Intervensi + Sidebar */}
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Kolom prioritas intervensi */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-l-4 border-pink-400 pl-5">
                            <div>
                                <h2 className="text-3xl font-serif italic text-gray-800">Prioritas Intervensi</h2>
                                <p className="text-gray-500 text-sm mt-1">Anak dengan status gizi memerlukan perhatian segera</p>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider border border-pink-200">
                                {alerts.length} Perlu Tindakan
                            </span>
                        </div>

                        {alerts.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl bg-pink-50/30 border border-pink-100">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                                    <FaHeartbeat className="text-pink-400 text-3xl animate-pulse" />
                                </div>
                                <h3 className="text-xl font-serif italic font-semibold text-gray-700">Wilayah Terkendali</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
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
                                            className="group p-5 rounded-2xl bg-white border border-pink-100 hover:border-pink-300 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row justify-between items-center gap-4 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-serif italic text-xl font-bold group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                                    {alert.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-lg group-hover:text-pink-600 transition-colors">{alert.name}</h4>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                                                        <span>{alert.age}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-pink-300 self-center"></span>
                                                        <span>Ortu: {alert.parent}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase border transition-all duration-300 ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                                                >
                                                    {alert.status}
                                                </span>
                                                {/* Tombol WhatsApp dengan hover pink */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`https://wa.me/${alert.phone.replace(/[^0-9]/g, '')}`, '_blank');
                                                    }}
                                                    className="p-3 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-md shadow-pink-200"
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
                        <div className="p-9 rounded-3xl bg-white border border-pink-200 shadow-xl shadow-pink-100/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-serif italic mb-7 flex items-center gap-2.5 px-2 text-gray-800">
                                    <FaHeartbeat className="text-pink-500 text-xl" /> Akses Cepat
                                </h3>
                                <div className="space-y-4">
                                    {/* Tombol akses cepat dengan hover pink */}
                                    <Link
                                        href="/admin/articles/new"
                                        className="flex items-center justify-between p-4 px-6 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-500 hover:text-white border border-pink-200 transition-all group"
                                    >
                                        <span className="text-sm font-semibold">Tulis Artikel Edukasi</span>
                                        <FaPlus size={14} className="group-hover:rotate-90 transition" />
                                    </Link>
                                    <Link
                                        href="/admin/monitoring"
                                        className="flex items-center justify-between p-4 px-6 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-500 hover:text-white border border-pink-200 transition-all group"
                                    >
                                        <span className="text-sm font-semibold">Detail Monitoring Anak</span>
                                        <FaEye size={14} className="group-hover:scale-110 transition" />
                                    </Link>
                                    <Link
                                        href="/admin/pregnancy"
                                        className="flex items-center justify-between p-4 px-6 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-500 hover:text-white border border-pink-200 transition-all group"
                                    >
                                        <span className="text-sm font-semibold">Data Ibu Hamil</span>
                                        <FaBaby size={14} className="group-hover:scale-110 transition" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Catatan medis */}
                        <div className="p-8 rounded-2xl bg-white border border-pink-100 shadow-sm">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-pink-100 text-pink-600 h-fit">
                                    <FaExclamationTriangle size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-pink-400 mb-1">
                                        Standar WHO 2020
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Deteksi otomatis menggunakan <span className="font-bold text-pink-600">Z-Score</span>. Pastikan data
                                        berat dan tinggi badan diperbarui setiap bulan untuk akurasi intervensi.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-pink-400">Update terakhir: hari ini</span>
                                        <FaHeartbeat className="text-pink-300 text-xs animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 text-center text-xs text-pink-300 border-t border-pink-100">
                    <span>© 2026 • Sistem Pemantauan Gizi Puskesmas • Data real-time berdasarkan input petugas</span>
                </div>
            </div>
        </div>
    );
}