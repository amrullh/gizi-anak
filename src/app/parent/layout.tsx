'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaBook, FaChartBar, FaPlusCircle, FaBell, FaExclamationTriangle, FaPhoneAlt, FaBaby } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { useChildren } from '@/hooks/useChildren'
import { useAllGrowthRecords } from '@/hooks/useAllGrowthRecords'
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Definisikan Interface untuk Child yang bermasalah agar Type-Safe
interface ProblematicChild {
    name: string;
    statusGizi: string;
    statusStunting: string;
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    const { children: myChildren, loading: childrenLoading } = useChildren()
    const { records, loading: recordsLoading } = useAllGrowthRecords()

    const [showWarning, setShowWarning] = useState(false)
    const [agreedSteps, setAgreedSteps] = useState<string[]>([])
    const [stuntedChildren, setStuntedChildren] = useState<ProblematicChild[]>([])

    useEffect(() => {
        if (!childrenLoading && !recordsLoading && myChildren.length > 0) {
            const problematic: ProblematicChild[] = []

            myChildren.forEach(child => {
                const childRecords = records.filter(r => r.childId === child.id)
                if (childRecords.length > 0) {
                    const latest = [...childRecords].sort((a, b) => b.date.getTime() - a.date.getTime())[0]

                    const birthDateRaw = child.birthDate as any;
                    const birthDate = birthDateRaw?.seconds
                        ? new Date(birthDateRaw.seconds * 1000)
                        : new Date(birthDateRaw);

                    const ageData = calculateDetailedAge(birthDate, latest.date);

                    const result = calculateNutritionalStatus(
                        ageData.totalMonths,
                        child.gender as 'male' | 'female',
                        latest.weight,
                        latest.height
                    )

                    if (result.nutrition.color === 'red' || result.stunting.isStunted) {
                        problematic.push({
                            name: child.name,
                            statusGizi: result.nutrition.status,
                            statusStunting: result.stunting.status
                        })
                    }
                }
            })

            if (problematic.length > 0) {
                setStuntedChildren(problematic)
                setShowWarning(true)
            }
        }
    }, [myChildren, records, childrenLoading, recordsLoading])

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
        "Saya menyadari kondisi pertumbuhan anak saya saat ini memerlukan perhatian serius.",
        "Saya berkomitmen memberikan asupan protein hewani setiap hari untuk mengejar ketertinggalan.",
        "Saya akan memastikan anak mendapatkan pemeriksaan rutin di layanan kesehatan terdekat.",
        "Saya akan segera menghubungi nomor petugas kesehatan yang tertera untuk konsultasi."
    ]

    const handleCheckStep = (step: string) => {
        setAgreedSteps(prev =>
            prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
        )
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (!user || user.role !== 'parent') return null;

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U'

    return (
        <div className="min-h-screen bg-gray-50">
            {showWarning && (
                <div className="fixed inset-0 z-[999] bg-slate-900/90 backdrop-blur-xl overflow-y-auto p-4 flex items-center justify-center">
                    <Card className="max-w-xl w-full p-6 md:p-8 border-t-8 border-red-500 shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <FaExclamationTriangle size={32} />
                            </div>
                            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Peringatan Penting!</h1>
                        </div>

                        <div className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-100">
                            <div className="space-y-2">
                                {stuntedChildren.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                        <span className="font-bold text-gray-800 text-sm">{c.name}</span>
                                        <div className="text-right">
                                            <span className="text-[9px] block font-black text-red-600 uppercase">{c.statusGizi}</span>
                                            <span className="text-[9px] block font-black text-orange-600 uppercase">{c.statusStunting}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {steps.map((step, idx) => (
                                <label key={idx} className={`flex items-start gap-3 p-4 border-2 rounded-2xl transition-all cursor-pointer ${agreedSteps.includes(step) ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50/50'}`}>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 mt-0.5 accent-pink-500"
                                        onChange={() => handleCheckStep(step)}
                                        checked={agreedSteps.includes(step)}
                                    />
                                    <span className={`text-xs font-bold leading-relaxed ${agreedSteps.includes(step) ? 'text-pink-700' : 'text-gray-500'}`}>{step}</span>
                                </label>
                            ))}
                        </div>

                        {agreedSteps.length === steps.length ? (
                            <div className="space-y-4">
                                <div className="bg-emerald-500 p-4 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-emerald-200">
                                    <div className="flex items-center gap-3">
                                        <FaPhoneAlt />
                                        <div>
                                            <p className="text-[10px] font-black uppercase opacity-80">Hubungi Puskesmas</p>
                                            <p className="text-lg font-black">0812-4455-6677</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    fullWidth
                                    className="h-14 bg-gray-900 text-white font-black rounded-2xl shadow-xl"
                                    onClick={() => setShowWarning(false)}
                                >
                                    SAYA MENGERTI & LANJUT
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-[10px] text-gray-400 font-black uppercase">
                                    Selesaikan {steps.length - agreedSteps.length} Poin Lagi
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-pink-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-lg">G</span>
                        </div>
                        <span className="font-black text-gray-800 tracking-tighter text-xl">GiziAnak</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-pink-500 transition-colors"><FaBell size={20} /></button>
                        <Link href="/parent/profile">
                            <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-sm border border-pink-200">
                                {initial}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="max-w-5xl mx-auto px-6 py-2 flex justify-between items-center relative">
                    <Link href="/parent/articles" className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/articles' ? 'text-pink-500' : 'text-gray-400'}`}>
                        <FaBook size={20} /><span className="text-[10px] font-bold mt-1 uppercase">Edukasi</span>
                    </Link>

                    <Link href="/parent/pregnancy" className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/pregnancy' ? 'text-pink-500' : 'text-gray-400'}`}>
                        <FaBaby size={22} /><span className="text-[10px] font-bold mt-1 uppercase">Kehamilan</span>
                    </Link>

                    <Link href="/parent/dashboard" className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/dashboard' ? 'text-pink-500' : 'text-gray-400'}`}>
                        <FaChartBar size={22} /><span className="text-[10px] font-bold mt-1 uppercase">Laporan</span>
                    </Link>

                    <Link href="/parent/input" className={`flex flex-col items-center py-2 px-4 ${pathname === '/parent/input' ? 'text-pink-500' : 'text-gray-400'}`}>
                        <FaPlusCircle size={22} /><span className="text-[10px] font-bold mt-1 uppercase">Input</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}