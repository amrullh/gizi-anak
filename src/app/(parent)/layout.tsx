'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBook, FaChartBar, FaPlusCircle, FaUser, FaBell } from 'react-icons/fa'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        { href: '/parent/articles', icon: FaBook, label: 'Artikel', position: 'left' },
        { href: '/parent/dashboard', icon: FaChartBar, label: 'Laporan', position: 'center' },
        { href: '/parent/input', icon: FaPlusCircle, label: 'Input', position: 'right' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="font-semibold text-gray-800">GiziAnak</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-600 hover:text-pink-500 relative">
                            <FaBell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUser size={16} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
                {children}
            </main>

            {/* BOTTOM NAVBAR - FIXED */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="max-w-5xl mx-auto px-6 py-2">
                    <div className="flex justify-between items-center relative">
                        {/* LEFT - Artikel */}
                        <Link
                            href="/parent/articles"
                            className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/articles' ? 'text-pink-500' : 'text-gray-500'}`}
                        >
                            <FaBook size={24} />
                            <span className="text-xs mt-1">Artikel</span>
                        </Link>

                        {/* CENTER - Laporan (Floating Button) */}
                        <Link
                            href="/parent/dashboard"
                            className="flex flex-col items-center -mt-8"
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${pathname === '/parent/dashboard'
                                    ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                <FaChartBar size={26} />
                            </div>
                            <span className="text-xs mt-1 text-gray-600">Laporan</span>
                        </Link>

                        {/* RIGHT - Input */}
                        <Link
                            href="/parent/input"
                            className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/input' ? 'text-pink-500' : 'text-gray-500'}`}
                        >
                            <FaPlusCircle size={24} />
                            <span className="text-xs mt-1">Input</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}