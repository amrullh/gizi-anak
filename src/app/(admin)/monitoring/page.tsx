'use client'

import { useState } from 'react'
import { FaSearch, FaFilter, FaDownload, FaEye, FaSort } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function MonitoringPage() {
    const [selectedStatus, setSelectedStatus] = useState('all')

    const childrenData = [
        { id: 1, name: 'Budi Santoso', age: '2 tahun', parent: 'Ibu Budi', status: 'good', lastUpdate: '2 hari lalu', weight: '11.8 kg', height: '80 cm' },
        { id: 2, name: 'Siti Aisyah', age: '8 bulan', parent: 'Bapak Ahmad', status: 'warning', lastUpdate: '5 hari lalu', weight: '7.2 kg', height: '68 cm' },
        { id: 3, name: 'Ahmad Rizki', age: '1.5 tahun', parent: 'Ibu Siti', status: 'danger', lastUpdate: '7 hari lalu', weight: '9.5 kg', height: '75 cm' },
        { id: 4, name: 'Dewi Lestari', age: '3 tahun', parent: 'Ibu Dewi', status: 'good', lastUpdate: '1 hari lalu', weight: '13.2 kg', height: '88 cm' },
        { id: 5, name: 'Muhammad Iqbal', age: '4 tahun', parent: 'Bapak Iqbal', status: 'good', lastUpdate: '3 hari lalu', weight: '16.5 kg', height: '98 cm' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Gizi Baik' }
            case 'warning': return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Perlu Perhatian' }
            case 'danger': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Gizi Buruk' }
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' }
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Monitoring Data Anak</h1>
                    <p className="text-gray-600 mt-2">Pantau status gizi anak di wilayah Anda</p>
                </div>
                <Button variant="outline">
                    <FaDownload className="inline mr-2" />
                    Export Data
                </Button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-800">156</div>
                    <div className="text-sm text-gray-600">Total Anak</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-emerald-600">124</div>
                    <div className="text-sm text-gray-600">Gizi Baik</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-amber-600">28</div>
                    <div className="text-sm text-gray-600">Perlu Perhatian</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-red-600">4</div>
                    <div className="text-sm text-gray-600">Gizi Buruk</div>
                </div>
            </div>

            {/* FILTERS */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama anak atau orang tua..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <select className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 outline-none">
                            <option>Semua Kecamatan</option>
                            <option>Kecamatan A</option>
                            <option>Kecamatan B</option>
                            <option>Kecamatan C</option>
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 outline-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="good">Gizi Baik</option>
                            <option value="warning">Perlu Perhatian</option>
                            <option value="danger">Gizi Buruk</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* TABLE */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-2">
                                        Nama Anak
                                        <FaSort className="text-gray-400" size={12} />
                                    </div>
                                </th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Usia</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Orang Tua</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Status Gizi</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Berat/Tinggi</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Update</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {childrenData.map((child) => {
                                const status = getStatusColor(child.status)
                                return (
                                    <tr key={child.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800">{child.name}</td>
                                        <td className="p-4 text-gray-600">{child.age}</td>
                                        <td className="p-4 text-gray-600">{child.parent}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div>{child.weight}</div>
                                            <div className="text-xs">{child.height}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-600">{child.lastUpdate}</div>
                                            {child.status !== 'good' && (
                                                <div className="text-xs text-red-500 mt-1">⚠️ Perlu diperiksa</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button className="text-purple-500 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                                                <FaEye size={14} />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t">
                    <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                        Menampilkan 1-5 dari 156 data
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">
                            ←
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500 text-white">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">2</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">3</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">4</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">5</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">→</button>
                    </div>
                </div>
            </Card>
        </div>
    )
}