'use client'

import { useState, useMemo } from 'react'
import { FaSearch, FaDownload, FaEye, FaSort, FaExclamationTriangle } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function MonitoringPage() {
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const childrenData = [
        { id: 1, name: 'Budi Santoso', age: '2 tahun', parent: 'Ibu Budi', status: 'good', lastUpdate: '2 hari lalu', weight: '11.8 kg', height: '80 cm' },
        { id: 2, name: 'Siti Aisyah', age: '8 bulan', parent: 'Bapak Ahmad', status: 'warning', lastUpdate: '5 hari lalu', weight: '7.2 kg', height: '68 cm' },
        { id: 3, name: 'Ahmad Rizki', age: '1.5 tahun', parent: 'Ibu Siti', status: 'danger', lastUpdate: '7 hari lalu', weight: '9.5 kg', height: '75 cm' },
        { id: 4, name: 'Dewi Lestari', age: '3 tahun', parent: 'Ibu Dewi', status: 'good', lastUpdate: '1 hari lalu', weight: '13.2 kg', height: '88 cm' },
        { id: 5, name: 'Muhammad Iqbal', age: '4 tahun', parent: 'Bapak Iqbal', status: 'good', lastUpdate: '3 hari lalu', weight: '16.5 kg', height: '98 cm' },
    ]

    const filteredData = useMemo(() => {
        return childrenData.filter(child => {
            const matchesStatus = selectedStatus === 'all' || child.status === selectedStatus
            const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                child.parent.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesStatus && matchesSearch
        })
    }, [selectedStatus, searchQuery])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Gizi Baik' }
            case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Perlu Perhatian' }
            case 'danger': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Gizi Buruk' }
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Unknown' }
        }
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* HEADER - No Extra Top Space */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Monitoring Data Anak</h1>
                    <p className="text-gray-500 text-sm">Dashboard pemantauan status gizi wilayah Puskesmas.</p>
                </div>
                <Button className="rounded-full px-6 py-2.5 text-sm shadow-md">
                    <FaDownload className="mr-2" />
                    Export Data
                </Button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Anak', val: '156', color: 'text-gray-800' },
                    { label: 'Gizi Baik', val: '124', color: 'text-emerald-600' },
                    { label: 'Perlu Perhatian', val: '28', color: 'text-amber-600' },
                    { label: 'Gizi Buruk', val: '4', color: 'text-red-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* FILTERS */}
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama anak..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-400 text-sm text-gray-600 cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="good">Gizi Baik</option>
                        <option value="warning">Perlu Perhatian</option>
                        <option value="danger">Gizi Buruk</option>
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <Card className="overflow-hidden border-none shadow-sm rounded-2xl">
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="p-4 tracking-wider">Anak</th>
                                <th className="p-4 tracking-wider">Detail Keluarga</th>
                                <th className="p-4 tracking-wider">Status</th>
                                <th className="p-4 tracking-wider">Metrik</th>
                                <th className="p-4 tracking-wider">Update</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredData.map((child) => {
                                const status = getStatusColor(child.status)
                                return (
                                    <tr key={child.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 font-semibold text-gray-800">{child.name}</td>
                                        <td className="p-4">
                                            <div className="text-gray-700">{child.age}</div>
                                            <div className="text-[11px] text-gray-400">{child.parent}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium text-gray-800">{child.weight}</span>
                                            <span className="mx-1 text-gray-300">|</span>
                                            <span className="text-gray-500">{child.height}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-500 text-xs">{child.lastUpdate}</div>
                                            {child.status === 'danger' && (
                                                <div className="flex items-center text-[10px] text-red-500 mt-1 font-bold animate-pulse">
                                                    <FaExclamationTriangle className="mr-1" /> KRITIS
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-50 transition-all">
                                                <FaEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}