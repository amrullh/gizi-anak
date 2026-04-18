'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    FaChild,
    FaHeartbeat,
    FaArrowRight,
    FaExclamationTriangle,
    FaChartBar,
    FaWeight,
    FaArrowsAltV,
    FaChartLine // TAMBAHKAN INI BGST
} from 'react-icons/fa'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import GrowthChart from '@/components/features/GrowthChart'
import ZScoreChart from '@/components/features/ZScoreChart'
import { useChildren } from '@/hooks/useChildren'
import { useAllGrowthRecords } from '@/hooks/useAllGrowthRecords'
import { useAuth } from '@/context/AuthContext'
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

    // Helper warna badge status gizi (Identik dengan Admin)
    const getBadgeColor = (status: string): string => {
        if (status.includes('Sangat Kurang') || status.includes('Buruk') || status.includes('Sangat Pendek') || status.includes('Obesitas'))
            return 'bg-red-100 text-red-700 border-red-200';
        if (status.includes('Kurang') || status.includes('Pendek') || status.includes('Risiko') || status.includes('Lebih'))
            return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const getFullNutritionalAnalysis = (childId: string) => {
        const childRecords = allRecords.filter(r => r.childId === childId)
        if (childRecords.length === 0) return null

        const latest = [...childRecords].sort((a, b) => b.date.getTime() - a.date.getTime())[0]
        const child = children.find(c => c.id === childId)
        if (!child) return null

        const birthDate = child.birthDate instanceof Date ? child.birthDate : (child.birthDate as any).toDate()
        const ageData = calculateDetailedAge(birthDate, latest.date)

        // PANGGIL LOGIKA PERMENKES 2020 (Identik dengan Admin Monitoring)
        return calculateNutritionalStatus(
            ageData.totalMonths,
            child.gender as 'male' | 'female',
            latest.weight,
            latest.height,
            ageData.totalMonths < 24 ? 'baring' : 'berdiri'
        )
    }

    const currentAnalysis = useMemo(() =>
        selectedChild ? getFullNutritionalAnalysis(selectedChild.id) : null
        , [selectedChild, allRecords])

    const getLastUpdateLabel = (childId: string) => {
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
        <div className="space-y-6 pb-10">
            {/* GREETING */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 italic font-serif">Halo, {user?.name || 'Ayah/Bunda'}! 👋</h1>
                <p className="text-sm text-gray-500">Pantau tumbuh kembang si kecil berdasarkan standar Permenkes 2020.</p>
            </div>

            {/* RINGKASAN STATUS UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-pink-500 to-rose-400 text-white border-none p-5 rounded-3xl shadow-lg shadow-pink-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-pink-100 text-[10px] font-black uppercase tracking-widest">Berat Badan (BB/U)</p>
                            <h3 className="text-xl font-black mt-1 uppercase">
                                {currentAnalysis?.weightStatus.status || 'No Data'}
                            </h3>
                        </div>
                        <FaWeight size={32} className="opacity-30" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white border-none p-5 rounded-3xl shadow-lg shadow-blue-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Tinggi Badan (TB/U)</p>
                            <h3 className="text-xl font-black mt-1 uppercase">
                                {currentAnalysis?.heightStatus.status || 'No Data'}
                            </h3>
                        </div>
                        <FaArrowsAltV size={32} className="opacity-30" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-400 text-white border-none p-5 rounded-3xl shadow-lg shadow-emerald-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Status Gizi (BB/TB)</p>
                            <h3 className="text-xl font-black mt-1 uppercase">
                                {currentAnalysis?.whStatus.status || 'No Data'}
                            </h3>
                        </div>
                        <FaHeartbeat size={32} className="opacity-30" />
                    </div>
                </Card>
            </div>

            {/* ALERT POTENSI MASALAH GIZI */}
            {currentAnalysis && (currentAnalysis.weightStatus.color === 'red' || currentAnalysis.heightStatus.color === 'red') && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-4 animate-pulse">
                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" size={24} />
                    <div>
                        <h4 className="text-red-800 font-black text-xs uppercase tracking-tight">Perhatian Khusus Diperlukan</h4>
                        <p className="text-red-700 text-xs mt-1">
                            {selectedChild?.name} terdeteksi memiliki status gizi <b>{currentAnalysis.weightStatus.status}</b> atau <b>{currentAnalysis.heightStatus.status}</b>. Segera hubungi Bidan atau kunjungi Puskesmas terdekat.
                        </p>
                    </div>
                </div>
            )}

            {/* DAFTAR ANAK & SELEKSI */}
            <Card className="p-5 rounded-3xl border-none shadow-sm">
                <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                    <FaChild className="text-pink-500" /> ANAK SAYA
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {children.map(child => {
                        const birthDate = child.birthDate instanceof Date ? child.birthDate : (child.birthDate as any).toDate()
                        const ageInfo = calculateDetailedAge(birthDate)
                        const analysis = getFullNutritionalAnalysis(child.id)

                        return (
                            <div
                                key={child.id}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedChildId === child.id
                                    ? 'border-pink-500 bg-pink-50/50 shadow-md scale-[1.01]'
                                    : 'border-gray-50 bg-gray-50/50 hover:border-pink-200'
                                    }`}
                                onClick={() => setSelectedChildId(child.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black text-gray-800 uppercase tracking-tight">{child.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{ageInfo.label}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {analysis && (
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase ${getBadgeColor(analysis.whStatus.status)}`}>
                                                {analysis.whStatus.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Terakhir: {getLastUpdateLabel(child.id)}</span>
                                    <Link href={`/parent/growth-detail/${child.id}`} className="text-pink-600 font-black text-[10px] uppercase flex items-center gap-1 hover:underline">
                                        Analisis Detail <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* GRAFIK Z-SCORE & TREN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualisasi Sebaran Gizi (Z-Score) */}
                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <h2 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                        <FaChartBar className="text-blue-500" /> Sebaran Z-Score (WHO)
                    </h2>
                    {currentAnalysis ? (
                        <div className="h-[300px]">
                            <ZScoreChart
                                zWeightForAge={currentAnalysis.zWeightForAge}
                                zHeightForAge={currentAnalysis.zHeightForAge}
                                zWeightForHeight={currentAnalysis.zWeightForHeight}
                            />
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-2xl text-gray-400 italic text-xs">
                            Belum ada data antropometri
                        </div>
                    )}
                </Card>

                {/* Grafik Perkembangan (BB & TB) */}
                <Card className="p-6 rounded-3xl border-none shadow-sm">
                    <h2 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                        <FaChartLine className="text-pink-500" /> Tren Pertumbuhan
                    </h2>
                    {selectedChild && allRecords.filter(r => r.childId === selectedChildId).length > 0 ? (
                        <div className="h-[300px]">
                            <GrowthChart
                                data={allRecords
                                    .filter(r => r.childId === selectedChildId)
                                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                                    .map(record => ({
                                        month: record.date.toLocaleDateString('id-ID', { month: 'short' }),
                                        weight: record.weight,
                                        height: record.height,
                                    }))
                                }
                                type="area"
                                height={300}
                            />
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-2xl text-gray-400 italic text-xs">
                            Data pengukuran tidak tersedia
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}