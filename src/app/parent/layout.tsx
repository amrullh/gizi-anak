'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaBook, FaChartBar, FaExclamationTriangle, FaBaby, FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { useChildren } from '@/hooks/useChildren'
import { useAllGrowthRecords } from '@/hooks/useAllGrowthRecords'
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Image from 'next/image' // Import Image untuk logo

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
    const [bidanPhone, setBidanPhone] = useState<string | null>(null)

    // 1. Logika Deteksi Masalah Gizi (Tetap Sama)
    useEffect(() => {
        if (!childrenLoading && !recordsLoading && myChildren.length > 0 && user) {
            const hasAgreed = localStorage.getItem(`agreed_warning_${user.uid}`)
            if (hasAgreed === 'true') return;

            const problematic: ProblematicChild[] = []

            myChildren.forEach(child => {
                const childRecords = records.filter(r => r.childId === child.id)
                if (childRecords.length > 0) {
                    const latest = [...childRecords].sort((a, b) => b.date.getTime() - a.date.getTime())[0]
                    const birthDateRaw = child.birthDate as any;
                    const birthDate = birthDateRaw?.seconds ? new Date(birthDateRaw.seconds * 1000) : new Date(birthDateRaw);

                    const ageData = calculateDetailedAge(birthDate, latest.date);
                    const method = ageData.totalMonths < 24 ? 'baring' : 'berdiri';

                    const result = calculateNutritionalStatus(
                        ageData.totalMonths,
                        child.gender as 'male' | 'female',
                        latest.weight,
                        latest.height,
                        method
                    )

                    if (result.weightStatus.color === 'red' || result.heightStatus.color === 'red') {
                        problematic.push({
                            name: child.name,
                            statusGizi: result.weightStatus.status,
                            statusStunting: result.heightStatus.status
                        })
                    }
                }
            })

            if (problematic.length > 0) {
                setStuntedChildren(problematic)
                setShowWarning(true)
                if (user.wilayah) {
                    fetchBidanContact(user.wilayah);
                }
            }
        }
    }, [myChildren, records, childrenLoading, recordsLoading, user])

    const fetchBidanContact = async (wilayah: string | null | undefined) => {
        if (!wilayah) return;
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', 'bidan'),
                where('wilayah', '==', wilayah),
                limit(1)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                setBidanPhone(snap.docs[0].data().phone);
            }
        } catch (err) {
            console.error("Gagal mengambil kontak bidan", err);
        }
    }

    // 3. Proteksi Route (Tetap Sama)
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'parent') {
                router.push('/login')
            }
        }
    }, [user, authLoading, router])

    const steps = [
        "Saya menyadari kondisi pertumbuhan anak saya memerlukan perhatian.",
        "Saya berkomitmen memberikan asupan nutrisi terbaik setiap hari.",
        "Saya akan memastikan anak mendapatkan pemeriksaan rutin oleh Bidan.",
        "Saya akan menghubungi petugas kesehatan jika diperlukan."
    ]

    const handleCheckStep = (step: string) => {
        setAgreedSteps(prev => prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step])
    }

    const handleConfirmWarning = () => {
        if (user) {
            localStorage.setItem(`agreed_warning_${user.uid}`, 'true');
            setShowWarning(false);
        }
    }

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <FaSpinner className="animate-spin text-green-600 text-3xl" />
        </div>
    )

    if (!user || user.role !== 'parent') return null;
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modal Warning (Pop-up Medis) */}
            {showWarning && (
                <div className="fixed inset-0 z-[999] bg-slate-900/90 backdrop-blur-xl overflow-y-auto p-4 flex items-center justify-center">
                    <Card className="max-w-xl w-full p-6 md:p-8 border-t-8 border-red-500 shadow-2xl rounded-3xl bg-white">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <FaExclamationTriangle size={32} />
                            </div>
                            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Peringatan Medis!</h1>
                        </div>

                        <div className="bg-red-50 rounded-2xl p-4 mb-6 space-y-3">
                            {stuntedChildren.map((c, i) => (
                                <div key={i} className="flex flex-col bg-white p-4 rounded-xl border border-red-100">
                                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                                        <span className="font-black text-gray-800 text-sm uppercase">{c.name}</span>
                                        <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">TINDAKAN SEGERA</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                                        <div className="text-gray-400">Status BB: <span className="text-red-600">{c.statusGizi}</span></div>
                                        <div className="text-gray-400 text-right">Status TB: <span className="text-red-600">{c.statusStunting}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 mb-8">
                            {steps.map((step, idx) => (
                                <label key={idx} className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${agreedSteps.includes(step) ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-100'}`}>
                                    <input type="checkbox" className="w-5 h-5 accent-green-600 mt-0.5" onChange={() => handleCheckStep(step)} checked={agreedSteps.includes(step)} />
                                    <span className="text-xs font-bold text-gray-600 leading-relaxed">{step}</span>
                                </label>
                            ))}
                        </div>

                        {agreedSteps.length === steps.length && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-emerald-600 p-5 rounded-2xl text-white text-center shadow-lg shadow-emerald-100">
                                    <p className="text-[10px] font-black uppercase text-white/70 tracking-widest">Hubungi Bidan Wilayah</p>
                                    <p className="text-xl font-black text-white mt-1">{bidanPhone || 'Cek Menu Profil'}</p>
                                </div>
                                <Button fullWidth className="h-16 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-black transition-colors" onClick={handleConfirmWarning}>
                                    SAYA MENGERTI & LANJUT
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Header: Update Branding MONIKEL */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                            <Image src="/icons/icon.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-green-800 text-xl tracking-tight">MONIKEL</span>
                    </div>
                    <Link href="/parent/profile">
                        <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm border border-green-200 shadow-sm">
                            {initial}
                        </div>
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
                {children}
            </main>

            {/* Bottom Nav: Update Colors */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-5xl mx-auto px-10 py-4 flex justify-around items-center">
                    <Link href="/parent/articles" className={`flex flex-col items-center gap-1.5 transition-colors ${pathname.includes('articles') ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaBook size={20} /><span className="text-[10px] font-bold uppercase tracking-tighter">Edukasi</span>
                    </Link>
                    <Link href="/parent/pregnancy" className={`flex flex-col items-center gap-1.5 transition-colors ${pathname.includes('pregnancy') ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaBaby size={22} /><span className="text-[10px] font-bold uppercase tracking-tighter">Kehamilan</span>
                    </Link>
                    <Link href="/parent/dashboard" className={`flex flex-col items-center gap-1.5 transition-colors ${pathname.includes('dashboard') ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaChartBar size={22} /><span className="text-[10px] font-bold uppercase tracking-tighter">Laporan</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}