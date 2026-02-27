'use client'

import { useParams, useRouter } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'
import { useChildren } from '@/hooks/useChildren'
import GrowthChart from '@/components/features/GrowthChart'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useState, useEffect } from 'react'

export default function GrowthDetailPage() {
    const params = useParams()
    const router = useRouter()
    const childId = params.childId as string

    const { children } = useChildren()
    const { records, loading } = useGrowthRecords(childId)

    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        if (records.length > 0) {
            const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime())
            const data = sorted.map(record => ({
                month: record.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                weight: record.weight,
                height: record.height,
            }))
            setChartData(data)
        } else {
            setChartData([])
        }
    }, [records])

    const child = children.find(c => c.id === childId)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header dengan tombol kembali */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                    >
                        <FaArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Detail Grafik Perkembangan
                    </h1>
                </div>

                {child && (
                    <p className="text-gray-600 mb-4">
                        Anak: <span className="font-semibold">{child.name}</span>
                    </p>
                )}

                <Card className="p-6">
                    {chartData.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">
                            Belum ada data pengukuran untuk anak ini.
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Geser ke kanan/kiri untuk melihat seluruh riwayat.
                            </p>
                            {/* Container scrollable dengan lebar tetap */}
                            <div className="overflow-x-auto pb-4">
                                <div style={{ width: `${Math.max(chartData.length * 120, 600)}px`, minWidth: '100%' }}>
                                    <GrowthChart data={chartData} type="area" height={400} />
                                </div>
                            </div>
                            <div className="flex justify-center mt-6">
                                <Button variant="outline" onClick={() => router.back()}>
                                    Kembali
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    )
}