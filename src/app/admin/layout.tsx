'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    FaHome,
    FaNewspaper,
    FaEye,
    FaChartBar,
    FaBars,
    FaTimes,
    FaBell,
    FaSignOutAlt, // Icon Logout
    FaPlus,
    FaVenusMars,
    FaUsers,
    FaSeedling,
    FaHeartbeat,
    FaMapMarkerAlt
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading, logout } = useAuth()

    // Teknik casting agar TypeScript tidak rewel saat pengecekan role
    const currentRole = (user?.role as unknown as string);

    useEffect(() => {
        // Izinkan 'admin', 'admin_puskesmas', dan 'bidan' untuk masuk ke Layout Admin
        const allowedRoles = ['admin', 'admin_puskesmas', 'bidan'];
        if (!loading && (!user || !allowedRoles.includes(currentRole))) {
            router.push('/login')
        }
    }, [user, loading, router, currentRole])

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/login')
        } catch (error) {
            console.error("Gagal logout:", error)
        }
    }

    // Floating icons dekoratif
    const floatingIcons = [
        { icon: '❤️', left: '2%', top: '15%', delay: 0, duration: 7 },
        { icon: '🩺', left: '95%', top: '30%', delay: 1, duration: 8 },
        { icon: '👶', left: '8%', top: '80%', delay: 2, duration: 6 },
        { icon: '🌡️', left: '88%', top: '85%', delay: 3, duration: 9 },
        { icon: '💊', left: '50%', top: '50%', delay: 0.5, duration: 7 },
        { icon: '🫀', left: '20%', top: '40%', delay: 1.5, duration: 8 },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaHeartbeat className="text-pink-300 text-sm animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!user || !['admin', 'admin_puskesmas', 'bidan'].includes(currentRole)) {
        return null
    }

    // DINAMIS NAV ITEMS
    const navItems = [
        { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { href: '/admin/articles', icon: FaNewspaper, label: 'Kelola Artikel' },
        { href: '/admin/monitoring', icon: FaEye, label: 'Monitoring' },
        { href: '/admin/input', icon: FaPlus, label: 'Data Anak' },
        { href: '/admin/pregnancy', icon: FaVenusMars, label: 'Data Ibu Hamil' },
        { href: '/admin/users', icon: FaUsers, label: 'Manajemen User' },

        ...(currentRole === 'admin' ? [
            { href: '/admin/regions', icon: FaMapMarkerAlt, label: 'Kelola Wilayah' },
            { href: '/admin/reports', icon: FaChartBar, label: 'Laporan Global' },
        ] : []),

        ...(currentRole === 'admin_puskesmas' ? [
            { href: '/admin/reports', icon: FaChartBar, label: 'Laporan Wilayah' },
        ] : []),
    ];

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A'

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex flex-col overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {floatingIcons.map((item, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-2xl opacity-20"
                        style={{ left: item.left, top: item.top }}
                        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {item.icon}
                    </motion.div>
                ))}
            </div>

            <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 py-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-pink-700">
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
                            <FaSeedling size={14} />
                        </div>
                        <span className="font-serif italic font-bold text-pink-700">Puskesmas</span>
                    </div>
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-xs font-bold border border-pink-200">
                        {initial}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative z-10">
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm lg:hidden z-50" onClick={() => setSidebarOpen(false)} />
                )}

                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-white/90 backdrop-blur-md border-r border-pink-100
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 transition-transform duration-300 flex flex-col shadow-xl shadow-pink-100/30
                `}>
                    <div className="p-8 border-b border-pink-100 lg:block hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md">
                                <FaSeedling size={18} />
                            </div>
                            <h2 className="text-2xl font-serif italic font-black text-gray-800">Puskesmas</h2>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-pink-500 font-bold ml-1">
                            {currentRole === 'admin' ? 'Admin Portal' :
                                currentRole === 'admin_puskesmas' ? `Puskesmas ${user.wilayah || ''}` :
                                    `Bidan ${user.wilayah || ''}`}
                        </p>
                    </div>

                    <nav className="p-5 flex-1 overflow-y-auto space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-300 ${isActive ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-600 hover:bg-pink-500 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span className="text-sm font-bold">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* REVISI: Tombol Logout menggantikan Pengaturan */}
                    <div className="p-5 border-t border-pink-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-5 py-4 rounded-full text-red-500 hover:bg-red-50 transition-all text-sm font-bold group"
                        >
                            <FaSignOutAlt size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Keluar Akun</span>
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="hidden lg:block bg-white/70 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
                        <div className="h-20 flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-1 bg-pink-400 rounded-full"></div>
                                <div>
                                    <h1 className="font-serif italic font-black text-gray-800 text-xl">GiziAnak</h1>
                                    <p className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em]">
                                        {currentRole === 'admin' ? 'Dashboard Utama' : `Wilayah: ${user.wilayah || '-'}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="text-right">
                                    <div className="font-black text-gray-800 text-sm leading-none mb-1">{user.name}</div>
                                    <div className="text-[11px] text-pink-500 font-bold capitalize">{currentRole.replace('_', ' ')}</div>
                                </div>
                                <div className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-md border-2 border-white">
                                    {initial}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-8 lg:p-12 bg-transparent">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}