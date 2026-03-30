'use client'

import { FaChild, FaHeartbeat, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import GrowthChart from '@/components/features/GrowthChart'
import { useChildren } from '@/hooks/useChildren'
import { useAllGrowthRecords } from '@/hooks/useAllGrowthRecords'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition'

export default function ParentDashboard() {
    const { user } = useAuth()
    const { children, loading: childrenLoading } = useChildren()
    const { records: allRecords, loading: recordsLoading } = useAllGrowthRecords()
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id)
        }
    }, [children, selectedChildId])

    const selectedChild = children.find(c => c.id === selectedChildId)

    // Mapping Warna Tailwind berdasarkan hasil logic Z-Score
    const colorClassMap: Record<string, string> = {
        'green': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'orange': 'bg-amber-100 text-amber-800 border-amber-200',
        'red': 'bg-red-100 text-red-800 border-red-200',
    }

    const getChildNutritionalStatus = (childId: string) => {
        const childRecords = allRecords.filter(r => r.childId === childId)
        if (childRecords.length === 0) return { status: 'Belum Ada Data', color: 'bg-gray-100 text-gray-800', isStunted: false }

        const latest = [...childRecords].sort((a, b) => b.date.getTime() - a.date.getTime())[0]
        const child = children.find(c => c.id === childId)
        if (!child) return { status: 'Tidak Diketahui', color: 'bg-gray-100 text-gray-800', isStunted: false }

        const birthDate = child.birthDate instanceof Date ? child.birthDate : (child.birthDate as any).toDate()
        const ageData = calculateDetailedAge(birthDate, latest.date)

        // PANGGIL UTILS BARU (Output: nutrition, stunting, zBmi, zHeight)
        const result = calculateNutritionalStatus(
            ageData.totalMonths,
            child.gender as 'male' | 'female',
            latest.weight,
            latest.height
        )

        return {
            status: result.nutrition.status,
            color: colorClassMap[result.nutrition.color] || 'bg-gray-100 text-gray-800',
            stunting: result.stunting
        }
    }

    const currentStatus = selectedChild ? getChildNutritionalStatus(selectedChild.id) : null

    const getLastUpdate = (childId: string) => {
        const childRecords = allRecords.filter(r => r.childId === childId)
        if (childRecords.length === 0) return '-'
        const latest = childRecords.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
        const diffDays = Math.floor((new Date().getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return 'Hari ini'
        if (diffDays === 1) return 'Kemarin'
        return `${diffDays} hari lalu`
    }

    if (childrenLoading || recordsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* GREETING */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Halo, {user?.name || 'Ayah/Bunda'}! 👋</h1>
                <p className="text-base md:text-lg text-gray-600">Pantau pertumbuhan si kecil sesuai standar WHO</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 p-4 md:p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs md:text-sm text-pink-600 font-medium">Total Anak</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800">{children.length}</p>
                        </div>
                        <FaChild className="text-pink-500 text-2xl md:text-3xl" />
                    </div>
                </Card>

                <Card className={`bg-gradient-to-br border-2 p-4 md:p-5 transition-all ${currentStatus ? currentStatus.color : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs md:text-sm font-medium">Status Gizi (IMT/U)</p>
                            <p className="text-lg md:text-xl font-bold leading-tight">
                                {currentStatus ? currentStatus.status : 'Pilih Anak'}
                            </p>
                        </div>
                        <FaHeartbeat className="text-2xl md:text-3xl opacity-50" />
                    </div>
                </Card>
            </div>

            {/* STUNTING ALERT (DASHBOARD WIDE) */}
            {currentStatus?.stunting?.isStunted && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-4 animate-pulse">
                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-red-800 font-bold text-sm">PERHATIAN KHUSUS: POTENSI STUNTING</h4>
                        <p className="text-red-700 text-xs">
                            {selectedChild?.name} terdeteksi <b>{currentStatus.stunting.status}</b>. Segera konsultasikan ke dokter atau petugas Puskesmas.
                        </p>
                    </div>
                </div>
            )}

            {/* CHILDREN LIST */}
            <Card className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Anak Saya</h2>
                    <Link href="/parent/input" className="text-pink-500 text-sm md:text-base font-bold flex items-center gap-1 hover:underline">
                        Tambah Data <FaArrowRight size={12} />
                    </Link>
                </div>

                {children.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 italic border-2 border-dashed rounded-xl">
                        Belum ada data anak. Silakan tambah anak terlebih dahulu.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {children.map(child => {
                            const birthDate = child.birthDate instanceof Date ? child.birthDate : (child.birthDate as any).toDate()
                            const ageInfo = calculateDetailedAge(birthDate)
                            const status = getChildNutritionalStatus(child.id)

                            return (
                                <div
                                    key={child.id}
                                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${selectedChildId === child.id
                                        ? 'border-pink-500 bg-pink-50 shadow-md scale-[1.01]'
                                        : 'border-transparent bg-gray-50 hover:border-pink-200'
                                        }`}
                                    onClick={() => setSelectedChildId(child.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-base md:text-lg">{child.name}</h3>
                                            <p className="text-xs text-gray-500 font-medium">{ageInfo.label}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                                                {status.status}
                                            </span>
                                            {status.stunting?.isStunted && (
                                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                                    Stunting
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-xs">
                                        <span className="text-gray-400 font-medium">Update: {getLastUpdate(child.id)}</span>
                                        <Link href={`/parent/growth-detail/${child.id}`} className="text-pink-600 font-bold hover:underline flex items-center gap-1">
                                            Analisis Detail <FaArrowRight size={10} />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Card>

            {/* GROWTH CHART */}
            <Card className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Grafik Perkembangan</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div>
                            <span className="text-[10px] text-gray-600 font-bold uppercase">Berat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <span className="text-[10px] text-gray-600 font-bold uppercase">Tinggi</span>
                        </div>
                    </div>
                </div>

                {selectedChild ? (
                    allRecords.filter(r => r.childId === selectedChildId).length > 0 ? (
                        <>
                            <GrowthChart
                                data={allRecords
                                    .filter(r => r.childId === selectedChildId)
                                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                                    .map(record => ({
                                        month: record.date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
                                        weight: record.weight,
                                        height: record.height,
                                    }))
                                }
                                type="area"
                                height={250}
                            />
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-[11px] text-blue-700 leading-relaxed border border-blue-100">
                                <b>Tips:</b> Grafik di atas menunjukkan tren pertumbuhan {selectedChild.name}. Pastikan garis cenderung naik setiap bulannya.
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-400 py-12 italic border-2 border-dashed rounded-xl">
                            Belum ada data pengukuran untuk {selectedChild.name}.
                        </p>
                    )
                ) : (
                    <p className="text-center text-gray-400 py-12 italic border-2 border-dashed rounded-xl">
                        Silakan pilih data anak untuk melihat grafik.
                    </p>
                )}
            </Card>
        </div>
    )
}