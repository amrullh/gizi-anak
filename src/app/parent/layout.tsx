'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaBook, FaChartBar, FaPlusCircle, FaUser, FaBell } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { usePregnancy } from '@/hooks/usePregnancy'
import { useEffect } from 'react'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { pregnancy, loading: pregnancyLoading } = usePregnancy()

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== 'parent') {
                router.push('/login')
            } else if (!user.phone || !user.address) {
                // Jika data profil belum lengkap
                router.push('/parent/complete-profile')
            } else if (user.isPregnant === true && !pregnancy) {
                // Jika user hamil tapi data kehamilan belum ada, redirect
                router.push('/parent/pregnancy')
            } else if (user.isPregnant === undefined) {
                // Jika isPregnant belum diset, arahkan ke halaman pregnancy untuk memilih
                router.push('/parent/pregnancy')
            }
        } else if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, pregnancy, pregnancyLoading, router])

    if (authLoading || pregnancyLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (!user || user.role !== 'parent') {
        return null
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U'

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
                        <Link href="/parent/profile" className="flex items-center gap-2 hover:opacity-80 transition">
                            <span className="text-sm text-gray-700 hidden sm:inline">{user.name || user.email}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {initial}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
                {children}
            </main>

            {/* BOTTOM NAVBAR */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="max-w-5xl mx-auto px-6 py-2">
                    <div className="flex justify-between items-center relative">
                        <Link
                            href="/parent/articles"
                            className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/articles' ? 'text-pink-500' : 'text-gray-500'}`}
                        >
                            <FaBook size={24} />
                            <span className="text-xs mt-1">Artikel</span>
                        </Link>

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