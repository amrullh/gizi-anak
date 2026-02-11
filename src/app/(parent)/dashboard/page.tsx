'use client'

import { FaChild, FaHeartbeat, FaCalendarAlt, FaArrowRight } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

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
                <h1 className="text-2xl font-bold text-gray-800">Halo, Ibu Budi! 👋</h1>
                <p className="text-gray-600">Mari pantau perkembangan si kecil</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-pink-600 font-medium">Total Anak</p>
                            <p className="text-3xl font-bold text-gray-800">2</p>
                        </div>
                        <FaChild className="text-pink-500 text-3xl" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">Status Gizi</p>
                            <p className="text-3xl font-bold text-emerald-600">Baik</p>
                        </div>
                        <FaHeartbeat className="text-emerald-500 text-3xl" />
                    </div>
                </Card>
            </div>

            {/* CHILDREN LIST */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Anak Saya</h2>
                    <button className="text-pink-500 text-sm font-medium flex items-center gap-1">
                        Tambah <FaArrowRight size={12} />
                    </button>
                </div>

                <div className="space-y-4">
                    {children.map(child => (
                        <div key={child.id} className="border rounded-xl p-4 hover:border-pink-300 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{child.name}</h3>
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
                                <button className="text-pink-500 font-medium">Detail →</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* GROWTH CHART */}
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Grafik Perkembangan</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt />
                        <span>6 Bulan</span>
                    </div>
                </div>

                {/* SIMPLE CHART PLACEHOLDER */}
                <div className="h-48 flex items-end justify-between gap-2 mb-4">
                    {growthData.map((data, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div className="w-full space-y-1">
                                <div
                                    className="bg-pink-400 rounded-t w-full"
                                    style={{ height: `${data.weight * 6}px` }}
                                    title={`Berat: ${data.weight}kg`}
                                ></div>
                                <div
                                    className="bg-blue-400 rounded-t w-full"
                                    style={{ height: `${data.height - 70}px` }}
                                    title={`Tinggi: ${data.height}cm`}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-400 rounded"></div>
                        <span className="text-sm text-gray-700">Berat Badan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded"></div>
                        <span className="text-sm text-gray-700">Tinggi Badan</span>
                    </div>
                </div>
            </Card>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-3 gap-4">
                <button className="bg-pink-50 p-4 rounded-xl text-center hover:bg-pink-100 transition">
                    <div className="text-pink-500 text-2xl mb-2">📝</div>
                    <span className="text-sm font-medium text-gray-700">Input Data</span>
                </button>
                <button className="bg-blue-50 p-4 rounded-xl text-center hover:bg-blue-100 transition">
                    <div className="text-blue-500 text-2xl mb-2">📊</div>
                    <span className="text-sm font-medium text-gray-700">Lihat Grafik</span>
                </button>
                <button className="bg-purple-50 p-4 rounded-xl text-center hover:bg-purple-100 transition">
                    <div className="text-purple-500 text-2xl mb-2">📅</div>
                    <span className="text-sm font-medium text-gray-700">Imunisasi</span>
                </button>
            </div>
        </div>
    )
}