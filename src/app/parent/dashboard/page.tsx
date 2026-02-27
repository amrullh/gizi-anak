'use client'

import { FaChild, FaHeartbeat, FaArrowRight } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import GrowthChart from '@/components/features/GrowthChart'
import { useChildren } from '@/hooks/useChildren'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'

export default function ParentDashboard() {
    const { user } = useAuth()
    const { children, loading } = useChildren()
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

    
    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id)
        }
    }, [children, selectedChildId])

    // Helper untuk menghitung umur dalam format "X tahun Y bulan" dari birthDate
    const getAgeString = (birthDate: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - birthDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const years = Math.floor(diffDays / 365)
        const months = Math.floor((diffDays % 365) / 30)
        if (years > 0) return `${years} tahun ${months} bulan`
        return `${months} bulan`
    }

    // Dapatkan data anak terpilih
    const selectedChild = children.find(c => c.id === selectedChildId)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    const displayName = user?.name || user?.email || 'Pengguna'
    const initial = displayName.charAt(0).toUpperCase()

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
                            <p className="text-2xl md:text-3xl font-bold text-emerald-600">Baik</p>
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
                        {children.map(child => (
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
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        Gizi Baik
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3 text-sm">
                                    <span className="text-gray-500">Update: -</span>
                                    <button className="text-pink-500 font-medium text-sm">Detail →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* GROWTH CHART - akan diisi di langkah 2 */}
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

                {selectedChild ? (
                    <p className="text-center text-gray-500 py-8">
                        Data grafik akan ditampilkan di langkah berikutnya.
                    </p>
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        Pilih anak untuk melihat grafik.
                    </p>
                )}
            </Card>
        </div>
    )
}