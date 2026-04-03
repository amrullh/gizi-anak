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
    FaCog,
    FaPlus,
    FaVenusMars,
    FaUsers,
    FaSeedling
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clay"></div>
            </div>
        )
    }

    if (!user || user.role !== 'admin') {
        return null
    }

    const navItems = [
        { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { href: '/admin/users', icon: FaUsers, label: 'Manajemen User' },
        { href: '/admin/articles', icon: FaNewspaper, label: 'Kelola Artikel' },
        { href: '/admin/monitoring', icon: FaEye, label: 'Monitoring' },
        { href: '/admin/input', icon: FaPlus, label: 'Input Data' },
        { href: '/admin/pregnancy', icon: FaVenusMars, label: 'Data Ibu Hamil' },
        { href: '/admin/reports', icon: FaChartBar, label: 'Laporan' },
    ]

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A'

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            {/* MOBILE HEADER */}
            <header className="lg:hidden bg-white border-b border-tan/20 sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 py-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full hover:bg-sage/10 transition text-[#1A2A1A]">
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1A2A1A] rounded-full flex items-center justify-center text-white">
                            <FaSeedling size={14} />
                        </div>
                        <span className="font-serif italic font-bold text-[#1A2A1A]">Puskesmas</span>
                    </div>
                    <div className="w-8 h-8 bg-clay/10 rounded-full flex items-center justify-center text-clay text-xs font-bold border border-clay/20">
                        {initial}
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* SIDEBAR OVERLAY */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-[#1A2A1A]/40 backdrop-blur-sm lg:hidden z-50" onClick={() => setSidebarOpen(false)} />
                )}

                {/* SIDEBAR REVISED */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-white border-r border-tan/20
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 transition-transform duration-300 flex flex-col shadow-sm
                `}>
                    <div className="p-8 border-b border-tan/10 lg:block hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-[#1A2A1A] rounded-2xl flex items-center justify-center text-white rotate-3 shadow-lg shadow-moss/20">
                                <FaSeedling size={18} />
                            </div>
                            <h2 className="text-2xl font-serif italic font-black text-[#1A2A1A] tracking-tight">Puskesmas</h2>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-clay font-bold ml-1">Admin Portal</p>
                    </div>

                    <nav className="p-5 flex-1 overflow-y-auto space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-[#1A2A1A] text-white shadow-xl shadow-moss/30 scale-[1.02]'
                                            : 'text-[#1A2A1A]/70 hover:bg-[#1A2A1A] hover:text-white hover:shadow-lg hover:shadow-moss/20'
                                        }
                                    `}
                                >
                                    <item.icon size={20} className={`${isActive ? 'text-clay' : 'group-hover:scale-110 group-hover:text-clay'} transition-all`} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-5 border-t border-tan/10">
                        <Link href="/admin/settings" className="flex items-center gap-4 px-5 py-4 rounded-full text-[#1A2A1A]/70 hover:bg-clay hover:text-white transition-all text-sm font-bold group">
                            <FaCog size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            <span>Pengaturan</span>
                        </Link>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="hidden lg:block bg-white/80 backdrop-blur-md border-b border-tan/20 sticky top-0 z-40">
                        <div className="h-20 flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-1 bg-clay rounded-full"></div>
                                <div>
                                    <h1 className="font-serif italic font-black text-[#1A2A1A] text-xl">GiziAnak</h1>
                                    <p className="text-[10px] text-clay font-black uppercase tracking-[0.2em]">Dashboard Utama</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <button className="relative p-2 text-[#1A2A1A]/40 hover:text-[#1A2A1A] transition-colors">
                                    <FaBell size={22} />
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-clay rounded-full border-2 border-white"></span>
                                </button>

                                <div className="flex items-center gap-5 pl-8 border-l border-tan/20">
                                    <div className="text-right">
                                        <div className="font-black text-[#1A2A1A] text-sm leading-none mb-1">{user.name || 'Admin'}</div>
                                        <div className="text-[11px] text-clay font-bold">{user.email}</div>
                                    </div>
                                    <div className="w-12 h-12 bg-[#1A2A1A] text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-moss/20 border-2 border-white hover:scale-105 transition-transform cursor-pointer">
                                        {initial}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-8 lg:p-12 bg-cream">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}