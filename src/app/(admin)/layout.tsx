'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const navItems = [
        { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { href: '/admin/articles', icon: FaNewspaper, label: 'Kelola Artikel' },
        { href: '/admin/monitoring', icon: FaEye, label: 'Monitoring' },
        { href: '/admin/reports', icon: FaChartBar, label: 'Laporan' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* MOBILE HEADER */}
            <header className="lg:hidden bg-white border-b sticky top-0 z-40">
                <div className="flex justify-between items-center px-4 py-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="font-semibold text-gray-800">Puskesmas</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <FaBell className="text-gray-600" />
                        <FaUser className="text-gray-600" />
                    </div>
                </div>
            </header>

            {/* DESKTOP HEADER */}
            <header className="hidden lg:block bg-white border-b sticky top-0 z-40">
                <div className="flex justify-between items-center px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Puskesmas GiziAnak</h1>
                            <p className="text-sm text-gray-600">Admin Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative">
                            <FaBell size={20} className="text-gray-600" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <FaUser className="text-gray-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-800">Dr. Sari</div>
                                <div className="text-xs text-gray-500">Admin</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* SIDEBAR OVERLAY (MOBILE) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200
      `}>
                <div className="p-6 border-b lg:block hidden">
                    <h2 className="font-bold text-gray-800">Menu Admin</h2>
                    <p className="text-sm text-gray-600">Monitoring & Management</p>
                </div>

                <nav className="p-4 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition
                  ${isActive
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={18} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}

                    <div className="mt-8 pt-6 border-t">
                        <Link
                            href="/admin/settings"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                        >
                            <FaCog size={18} />
                            <span className="font-medium">Pengaturan</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:ml-64">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}