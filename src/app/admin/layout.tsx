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
    FaMapMarkedAlt,
    FaSignOutAlt,
    FaPlus,
    FaVenusMars,
    FaUsers,
    FaHeartbeat,
    FaMapMarkerAlt
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import Image from 'next/image' // Import Image untuk logo

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading, logout } = useAuth()

    const currentRole = (user?.role as unknown as string);

    useEffect(() => {
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

    // Floating icons dekoratif bertema sehat/kelor
    const floatingIcons = [
        { icon: '🍃', left: '2%', top: '15%', delay: 0, duration: 7 },
        { icon: '🩺', left: '95%', top: '30%', delay: 1, duration: 8 },
        { icon: '👶', left: '8%', top: '80%', delay: 2, duration: 6 },
        { icon: '🥗', left: '88%', top: '85%', delay: 3, duration: 9 },
        { icon: '💊', left: '50%', top: '50%', delay: 0.5, duration: 7 },
        { icon: '🤰', left: '20%', top: '40%', delay: 1.5, duration: 8 },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-pink-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaHeartbeat className="text-green-300 text-sm animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!user || !['admin', 'admin_puskesmas', 'bidan'].includes(currentRole)) {
        return null
    }

    const navItems = [
        { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { href: '/admin/articles', icon: FaNewspaper, label: 'Kelola Artikel' },
        { href: '/admin/mapping', icon: FaMapMarkedAlt, label: 'Mapping User' },
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
        <div className="relative min-h-screen bg-[#FDFCF0] flex flex-col overflow-x-hidden">
            {/* Decorative Background */}
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

            {/* Mobile Header */}
            <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 py-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-green-700">
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="relative w-7 h-7">
                            <Image src="/icons/icon.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-green-800 tracking-tight">MONIKEL</span>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold border border-green-200">
                        {initial}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative z-10">
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-green-900/20 backdrop-blur-sm lg:hidden z-50" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-white/90 backdrop-blur-md border-r border-green-50
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 transition-transform duration-300 flex flex-col shadow-xl shadow-green-100/20
                `}>
                    <div className="p-8 border-b border-green-50 lg:block hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative w-10 h-10 shadow-sm overflow-hidden rounded-xl">
                                <Image src="/icons/icon.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-green-900">MONIKEL</h2>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-green-600 font-bold ml-1">
                            {currentRole === 'admin' ? 'Portal Pusat' :
                                currentRole === 'admin_puskesmas' ? `Puskesmas ${user.wilayah || ''}` :
                                    `Bidan ${user.wilayah || ''}`}
                        </p>
                    </div>

                    <nav className="p-5 flex-1 overflow-y-auto space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-5 border-t border-green-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold group"
                        >
                            <FaSignOutAlt size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Keluar Akun</span>
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Desktop Top Header */}
                    <header className="hidden lg:block bg-white/70 backdrop-blur-md border-b border-green-50 sticky top-0 z-40">
                        <div className="h-20 flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                                <div>
                                    <h1 className="font-bold text-gray-800 text-lg tracking-tight uppercase">Admin Panel</h1>
                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-[0.1em]">
                                        {currentRole === 'admin' ? 'Pemantauan Seluruh Wilayah' : `Petugas Wilayah: ${user.wilayah || '-'}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="text-right">
                                    <div className="font-bold text-gray-800 text-sm leading-none mb-1">{user.name}</div>
                                    <div className="text-[11px] text-green-600 font-bold capitalize tracking-wide">{currentRole.replace('_', ' ')}</div>
                                </div>
                                <div className="w-11 h-11 bg-green-600 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-md border-2 border-white">
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