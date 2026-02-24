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
    FaCog
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!user || user.role !== 'admin') {
        return null
    }

    const navItems = [
        { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { href: '/admin/articles', icon: FaNewspaper, label: 'Kelola Artikel' },
        { href: '/admin/monitoring', icon: FaEye, label: 'Monitoring' },
        { href: '/admin/reports', icon: FaChartBar, label: 'Laporan' },
    ]

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A'

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* MOBILE HEADER */}
            <header className="lg:hidden bg-white border-b sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 py-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">P</div>
                        <span className="font-semibold text-gray-800 text-sm">Puskesmas</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaBell className="text-gray-600" />
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                            {initial}
                        </div>
                    </div>
                </div>
            </header>

            {/* WRAPPER SIDEBAR + CONTENT */}
            <div className="flex flex-1">
                {/* SIDEBAR OVERLAY (MOBILE) */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 lg:hidden z-50" onClick={() => setSidebarOpen(false)} />
                )}

                {/* SIDEBAR */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-white border-r
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 transition-transform duration-200 flex flex-col
                `}>
                    <div className="p-6 border-b lg:block hidden">
                        <h2 className="font-bold text-gray-800">Menu Admin</h2>
                        <p className="text-xs text-gray-500">Monitoring & Management</p>
                    </div>

                    <nav className="p-4 flex-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${isActive
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all">
                            <FaCog size={18} />
                            <span className="font-medium text-sm">Pengaturan</span>
                        </Link>
                    </div>
                </aside>

                {/* AREA KANAN: HEADER DESKTOP + CONTENT */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* DESKTOP HEADER */}
                    <header className="hidden lg:block bg-white border-b sticky top-0 z-40 h-20">
                        <div className="h-full flex justify-between items-center px-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <span className="text-white font-bold text-xl">P</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-gray-900 leading-none">Puskesmas GiziAnak</h1>
                                    <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Administrator</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors relative">
                                    <FaBell size={20} />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                                <div className="flex items-center gap-3 pl-6 border-l">
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 text-sm">{user.name || 'Admin'}</div>
                                        <div className="text-[10px] text-purple-600 font-bold uppercase tracking-tighter">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-full border-2 border-purple-200 flex items-center justify-center text-purple-600 font-bold">
                                        {initial}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main className="p-4 lg:p-10 flex-1">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}