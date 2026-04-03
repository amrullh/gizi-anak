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
    FaUser,
    FaBell,
    FaCog,
    FaPlus,
    FaVenusMars,
    FaUsers
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* MOBILE HEADER - Apple style minimal */}
            <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 py-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
                        {sidebarOpen ? <FaTimes size={20} className="text-gray-600" /> : <FaBars size={20} className="text-gray-600" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                        <span className="font-medium text-gray-800 text-sm">Puskesmas</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaBell className="text-gray-400 text-sm" />
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                            {initial}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* SIDEBAR OVERLAY */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-50" onClick={() => setSidebarOpen(false)} />
                )}

                {/* SIDEBAR - Apple style minimal, white, thin border */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-100
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 transition-transform duration-200 flex flex-col shadow-sm
                `}>
                    <div className="p-5 border-b border-gray-100 lg:block hidden">
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Puskesmas</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
                    </div>

                    <nav className="p-3 flex-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150
                                        ${isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <item.icon size={18} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-3 border-t border-gray-100">
                        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium">
                            <FaCog size={18} />
                            <span>Pengaturan</span>
                        </Link>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* DESKTOP HEADER - Apple style, clean */}
                    <header className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                        <div className="h-16 flex justify-between items-center px-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">P</span>
                                </div>
                                <div>
                                    <h1 className="font-semibold text-gray-900 text-sm leading-tight">Puskesmas GiziAnak</h1>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Administrator</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <button className="relative p-1 text-gray-400 hover:text-gray-600 transition">
                                    <FaBell size={18} />
                                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                </button>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                                    <div className="text-right">
                                        <div className="font-medium text-gray-800 text-sm">{user.name || 'Admin'}</div>
                                        <div className="text-[10px] text-gray-400">{user.email}</div>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                                        {initial}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 p-5 lg:p-8 bg-gray-50">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}