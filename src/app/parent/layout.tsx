'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaBook, FaChartBar, FaPlusCircle, FaBell, FaExclamationTriangle, FaCheckCircle, FaPhoneAlt } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { useChildren } from '@/hooks/useChildren'
import { useAllGrowthRecords } from '@/hooks/useAllGrowthRecords'
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    // Ambil data anak & record untuk pengecekan status
    const { children: myChildren, loading: childrenLoading } = useChildren()
    const { records, loading: recordsLoading } = useAllGrowthRecords()

    const [showWarning, setShowWarning] = useState(false)
    const [agreedSteps, setAgreedSteps] = useState<string[]>([])
    const [stuntedChildren, setStuntedChildren] = useState<any[]>([])

    // 1. Logika Deteksi Status Gizi Buruk/Stunting
    useEffect(() => {
        if (!childrenLoading && !recordsLoading && myChildren.length > 0) {
            const problematicChildren: any[] = []

            myChildren.forEach(child => {
                const childRecords = records.filter(r => r.childId === child.id)
                if (childRecords.length > 0) {
                    const latest = [...childRecords].sort((a, b) => b.date.getTime() - a.date.getTime())[0]
                    const birthDate = child.birthDate instanceof Date ? child.birthDate : (child.birthDate as any).toDate()
                    const ageData = calculateDetailedAge(birthDate, latest.date)

                    const result = calculateNutritionalStatus(
                        ageData.totalMonths,
                        child.gender as 'male' | 'female',
                        latest.weight,
                        latest.height
                    )

                    // Jika gizi buruk (red) atau stunting (isStunted)
                    if (result.nutrition.color === 'red' || result.stunting.isStunted) {
                        problematicChildren.push({
                            name: child.name,
                            statusGizi: result.nutrition.status,
                            statusStunting: result.stunting.status,
                            isStunting: result.stunting.isStunted
                        })
                    }
                }
            })

            if (problematicChildren.length > 0) {
                setStuntedChildren(problematicChildren)
                setShowWarning(true)
            }
        }
    }, [myChildren, records, childrenLoading, recordsLoading])

    // 2. Auth Redirects
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== 'parent') {
                router.push('/login')
            } else if (!user.phone || !user.address) {
                router.push('/parent/complete-profile')
            }
        } else if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    const steps = [
        "Saya mengerti bahwa kondisi anak saya memerlukan perhatian khusus.",
        "Saya bersedia meningkatkan asupan protein hewani (telur, ikan, daging) setiap hari.",
        "Saya akan rutin membawa anak ke Posyandu/Puskesmas setiap bulan.",
        "Saya akan segera menghubungi petugas kesehatan untuk konsultasi lebih lanjut."
    ]

    const handleCheckStep = (step: string) => {
        if (agreedSteps.includes(step)) {
            setAgreedSteps(agreedSteps.filter(s => s !== step))
        } else {
            setAgreedSteps([...agreedSteps, step])
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (!user || user.role !== 'parent') return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* MODAL PERINGATAN GIZI (FORCE READ) */}
            {showWarning && (
                <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 md:p-8 flex items-center justify-center">
                    <Card className="max-w-2xl w-full p-6 md:p-8 border-t-8 border-red-500 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 mb-6">
                            <FaExclamationTriangle size={40} className="animate-bounce" />
                            <h1 className="text-2xl font-black uppercase tracking-tight">Peringatan Kesehatan Penting!</h1>
                        </div>

                        <div className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100">
                            <p className="text-gray-800 font-medium mb-3">Sistem mendeteksi indikasi masalah pertumbuhan pada:</p>
                            <div className="space-y-2">
                                {stuntedChildren.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-200">
                                        <span className="font-bold text-gray-800">{c.name}</span>
                                        <div className="text-right">
                                            <span className="text-[10px] block font-black text-red-600 uppercase">{c.statusGizi}</span>
                                            <span className="text-[10px] block font-black text-orange-600 uppercase">{c.statusStunting}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h3 className="font-bold text-gray-700">Langkah yang harus Ayah/Bunda lakukan:</h3>
                            {steps.map((step, idx) => (
                                <label key={idx} className="flex items-start gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 mt-0.5 accent-pink-500"
                                        onChange={() => handleCheckStep(step)}
                                        checked={agreedSteps.includes(step)}
                                    />
                                    <span className="text-sm text-gray-600 leading-relaxed">{step}</span>
                                </label>
                            ))}
                        </div>

                        {agreedSteps.length === steps.length ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-4">
                                    <div className="bg-emerald-500 text-white p-2 rounded-full"><FaPhoneAlt /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase">Kontak Darurat Gizi (Puskesmas)</p>
                                        <p className="text-lg font-black text-emerald-800">0812-4455-6677</p>
                                    </div>
                                </div>
                                <Button
                                    fullWidth
                                    className="h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-black shadow-xl"
                                    onClick={() => setShowWarning(false)}
                                >
                                    SAYA MENGERTI & LANJUT
                                </Button>
                            </div>
                        ) : (
                            <p className="text-center text-xs text-gray-400 italic">Centang semua poin di atas untuk melanjutkan ke dashboard</p>
                        )}
                    </Card>
                </div>
            )}

            {/* HEADER ASLI */}
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-black text-sm">G</span>
                        </div>
                        <span className="font-bold text-gray-800 tracking-tighter text-xl">GiziAnak</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-pink-500 transition-colors">
                            <FaBell size={20} />
                        </button>
                        <Link href="/parent/profile" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-sm border border-pink-200">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
                {children}
            </main>

            {/* BOTTOM NAVBAR ASLI */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="max-w-5xl mx-auto px-6 py-2">
                    <div className="flex justify-between items-center relative">
                        <Link href="/parent/articles" className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/articles' ? 'text-pink-500' : 'text-gray-400'}`}>
                            <FaBook size={22} />
                            <span className="text-[10px] font-bold mt-1 uppercase">Edukasi</span>
                        </Link>
                        <Link href="/parent/dashboard" className="flex flex-col items-center -mt-10">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${pathname === '/parent/dashboard' ? 'bg-pink-500 text-white scale-110 shadow-pink-200' : 'bg-white text-gray-400 border'}`}>
                                <FaChartBar size={24} />
                            </div>
                            <span className={`text-[10px] font-black mt-2 uppercase ${pathname === '/parent/dashboard' ? 'text-pink-600' : 'text-gray-400'}`}>Laporan</span>
                        </Link>
                        <Link href="/parent/input" className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/input' ? 'text-pink-500' : 'text-gray-400'}`}>
                            <FaPlusCircle size={22} />
                            <span className="text-[10px] font-bold mt-1 uppercase">Input</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}