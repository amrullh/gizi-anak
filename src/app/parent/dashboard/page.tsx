'use client'

import { FaChild, FaHeartbeat, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import GrowthChart from '@/components/features/GrowthChart'
import { useChildren } from '@/hooks/useChildren'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import { calculateNutritionalStatus } from '@/utils/nutrition'

export default function ParentDashboard() {
    const { user } = useAuth()
    const { children, loading: childrenLoading } = useChildren()
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
    const { records, loading: recordsLoading } = useGrowthRecords(selectedChildId || undefined)

    // Pilih anak pertama secara default ketika children sudah dimuat
    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id)
        }
    }, [children, selectedChildId])

    const getAgeInMonths = (birthDate: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - birthDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        return Math.floor(diffDays / 30.44) // rata-rata hari per bulan
    }

    const getAgeString = (birthDate: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - birthDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const years = Math.floor(diffDays / 365)
        const months = Math.floor((diffDays % 365) / 30)
        if (years > 0) return `${years} tahun ${months} bulan`
        return `${months} bulan`
    }

    const selectedChild = children.find(c => c.id === selectedChildId)

    // Siapkan data untuk grafik
    const chartData = records
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(record => ({
            month: record.date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
            weight: record.weight,
            height: record.height,
        }))

    // Fungsi untuk mendapatkan status gizi terbaru untuk seorang anak
    const getChildNutritionalStatus = (childId: string) => {
        const childRecords = records.filter(r => r.childId === childId)
        if (childRecords.length === 0) return { status: 'Belum Ada Data', color: 'bg-gray-100 text-gray-800' }

        const sorted = [...childRecords].sort((a, b) => b.date.getTime() - a.date.getTime())
        const latest = sorted[0]

        if (latest.nutritionalStatus) {
            // Jika sudah ada status dari server, gunakan itu
            const status = latest.nutritionalStatus
            const colorMap: Record<string, string> = {
                'Gizi Buruk': 'bg-red-100 text-red-800',
                'Gizi Kurang': 'bg-amber-100 text-amber-800',
                'Gizi Baik': 'bg-emerald-100 text-emerald-800',
                'Gizi Lebih': 'bg-blue-100 text-blue-800',
                'Obesitas': 'bg-red-100 text-red-800',
            }
            return { status, color: colorMap[status] || 'bg-gray-100 text-gray-800' }
        }

        // Hitung manual
        const child = children.find(c => c.id === childId)
        if (!child) return { status: 'Tidak Diketahui', color: 'bg-gray-100 text-gray-800' }

        const ageMonths = getAgeInMonths(child.birthDate)
        const result = calculateNutritionalStatus(ageMonths, child.gender, latest.weight, latest.height)
        // Konversi warna dari utils ke class Tailwind
        const colorMap: Record<string, string> = {
            'Gizi Kurang': 'bg-amber-100 text-amber-800',
            'Gizi Baik': 'bg-emerald-100 text-emerald-800',
            'Gizi Lebih': 'bg-blue-100 text-blue-800',
            'Obesitas': 'bg-red-100 text-red-800',
        }
        return { status: result.status, color: colorMap[result.status] || 'bg-gray-100 text-gray-800' }
    }

    // Status gizi untuk card overview (ambil dari anak terpilih atau semua?)
    // Kita ambil dari anak terpilih, atau jika tidak ada, tampilkan default
    const getOverallStatus = () => {
        if (!selectedChild) return { status: 'Pilih Anak', color: 'bg-gray-100 text-gray-800' }
        return getChildNutritionalStatus(selectedChild.id)
    }

    const getLastUpdate = (childId: string) => {
        const childRecords = records.filter(r => r.childId === childId)
        if (childRecords.length === 0) return '-'
        const latest = childRecords.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
        const diffDays = Math.floor((new Date().getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return 'Hari ini'
        if (diffDays === 1) return 'Kemarin'
        return `${diffDays} hari lalu`
    }

    if (childrenLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    const displayName = user?.name || user?.email || 'Pengguna'
    const overallStatus = getOverallStatus()

    return (
        <div className="space-y-6">
            {/* GREETING */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Halo, {displayName}! 👋</h1>
                <p className="text-base md:text-lg text-gray-600">Mari pantau perkembangan si kecil</p>
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

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 p-4 md:p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs md:text-sm text-emerald-600 font-medium">Status Gizi</p>
                            <p className={`text-2xl md:text-3xl font-bold ${overallStatus.color.includes('emerald') ? 'text-emerald-600' : ''}`}>
                                {overallStatus.status}
                            </p>
                        </div>
                        <FaHeartbeat className="text-emerald-500 text-2xl md:text-3xl" />
                    </div>
                </Card>
            </div>

            {/* CHILDREN LIST */}
            <Card className="p-4 md:p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-semibold">Anak Saya</h2>
                    <button className="text-pink-500 text-sm md:text-base font-medium flex items-center gap-1">
                        Tambah <FaArrowRight size={12} />
                    </button>
                </div>

                {children.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Belum ada data anak. Silakan tambah anak terlebih dahulu.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {children.map(child => {
                            const { status, color } = getChildNutritionalStatus(child.id)

                            return (
                                <div
                                    key={child.id}
                                    className={`border rounded-xl p-4 transition cursor-pointer ${selectedChildId === child.id
                                        ? 'border-pink-500 bg-pink-50'
                                        : 'hover:border-pink-300'
                                        }`}
                                    onClick={() => setSelectedChildId(child.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-base md:text-lg">{child.name}</h3>
                                            <p className="text-sm text-gray-600">{getAgeString(child.birthDate)}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-sm">
                                        <span className="text-gray-500">Update: {getLastUpdate(child.id)}</span>
                                        <button className="text-pink-500 font-medium text-sm">Detail →</button>
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
                    <h2 className="text-lg md:text-xl font-semibold">Grafik Perkembangan</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Berat (kg)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Tinggi (cm)</span>
                        </div>
                    </div>
                </div>

                {recordsLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                ) : selectedChild ? (
                    chartData.length > 0 ? (
                        <>
                            <GrowthChart data={chartData} type="area" height={250} />
                            <div className="flex justify-end mt-4">
                                <Link
                                    href={`/parent/growth-detail/${selectedChild.id}`}
                                    className="text-pink-500 text-sm font-medium flex items-center gap-1 hover:text-pink-600"
                                >
                                    Lihat Detail Grafik
                                    <FaArrowRight size={12} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-8">
                            Belum ada data pengukuran untuk {selectedChild.name}.
                        </p>
                    )
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        Pilih anak untuk melihat grafik.
                    </p>
                )}
            </Card>
        </div>
    )
}