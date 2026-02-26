'use client'

import { FaChild, FaHeartbeat, FaArrowRight } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import GrowthChart from '@/components/features/GrowthChart'

export default function ParentDashboard() {
    const children = [
        { id: 1, name: 'Budi Santoso', age: '2 tahun 3 bulan', status: 'normal', lastUpdate: '2 hari lalu' },
        { id: 2, name: 'Siti Aisyah', age: '8 bulan', status: 'warning', lastUpdate: '1 minggu lalu' },
    ]

    const growthData = [
        { month: 'Jan', weight: 10, height: 75 },
        { month: 'Feb', weight: 10.5, height: 76 },
        { month: 'Mar', weight: 11, height: 77 },
        { month: 'Apr', weight: 11.2, height: 78 },
        { month: 'Mei', weight: 11.5, height: 79 },
        { month: 'Jun', weight: 11.8, height: 80 },
    ]

    return (
        <div className="space-y-6">
            {/* GREETING */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Halo, Ibu Budi! 👋</h1>
                <p className="text-base md:text-lg text-gray-600">Mari pantau perkembangan si kecil</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 p-4 md:p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs md:text-sm text-pink-600 font-medium">Total Anak</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800">2</p>
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

                <div className="space-y-4">
                    {children.map(child => (
                        <div key={child.id} className="border rounded-xl p-4 hover:border-pink-300 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-base md:text-lg">{child.name}</h3>
                                    <p className="text-sm text-gray-600">{child.age}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${child.status === 'normal'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    {child.status === 'normal' ? 'Gizi Baik' : 'Perlu Perhatian'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-3 text-sm">
                                <span className="text-gray-500">Update: {child.lastUpdate}</span>
                                <button className="text-pink-500 font-medium text-sm">Detail →</button>
                            </div>
                        </div>
                    ))}
                </div>
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

                <GrowthChart data={growthData} type="area" height={250} />

                <div className="flex justify-end mt-4">
                    <button className="text-pink-500 text-sm font-medium flex items-center gap-1 hover:text-pink-600">
                        Lihat Detail Grafik
                        <FaArrowRight size={12} />
                    </button>
                </div>
            </Card>

            {/* Quick Actions section telah dihapus */}
        </div>
    )
}