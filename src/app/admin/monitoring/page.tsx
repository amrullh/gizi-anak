'use client'

import { useState, useMemo } from 'react'
import { FaSearch, FaDownload, FaEye, FaExclamationTriangle } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useMonitoringData } from '@/hooks/useMonitoringData';
import { calculateNutritionalStatus } from '@/utils/nutrition';

export default function MonitoringPage() {
    const { loading, children } = useMonitoringData();
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Pengelompokan status untuk filtering UI
    const getStatusGroup = (status: string) => {
        if (status.includes('Normal') || status.includes('Baik')) return 'good';
        if (status.includes('Kurang') || status.includes('Lebih')) return 'warning';
        if (status.includes('Obesitas')) return 'danger';
        return 'none';
    };

    const filteredData = useMemo(() => {
        return children.filter(child => {
            // Gunakan weightVal & heightVal agar kalkulasi akurat
            const nutrition = calculateNutritionalStatus(
                child.ageInMonths,
                child.gender as 'male' | 'female',
                child.weightVal,
                child.heightVal
            );

            const group = getStatusGroup(nutrition.status);
            const matchesStatus = selectedStatus === 'all' || group === selectedStatus;
            const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                child.parentName?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [children, selectedStatus, searchQuery]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitoring Data Anak</h1>
                    <p className="text-gray-500 text-sm">Status gizi real-time berdasarkan data pertumbuhan terakhir.</p>
                </div>
                <Button className="rounded-full shadow-md"><FaDownload className="mr-2" /> Export Data</Button>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama anak atau orang tua..."
                        className="w-full pl-11 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-100"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 border rounded-xl outline-none cursor-pointer"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="all">Semua Status</option>
                    <option value="good">Gizi Baik</option>
                    <option value="warning">Waspada (Kurang/Lebih)</option>
                    <option value="danger">Gizi Buruk / Obesitas</option>
                </select>
            </div>

            {/* Tabel Monitoring */}
            <Card className="overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="p-4">Anak</th>
                                <th className="p-4">Keluarga</th>
                                <th className="p-4">Status Gizi</th>
                                <th className="p-4">Metrik (BB | TB)</th>
                                <th className="p-4">Update</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((child) => {
                                const nutrition = calculateNutritionalStatus(
                                    child.ageInMonths,
                                    child.gender as 'male' | 'female',
                                    child.weightVal,
                                    child.heightVal
                                );

                                return (
                                    <tr key={child.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{child.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-700">{child.age || `${child.ageInMonths} bln`}</div>
                                            <div className="text-[11px] text-gray-400">{child.parentName}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border 
                                                ${getStatusGroup(nutrition.status) === 'good' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    getStatusGroup(nutrition.status) === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-red-50 text-red-700 border-red-100'}`}>
                                                {child.weightVal > 0 ? nutrition.status : 'Data Belum Lengkap'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium">{child.weightVal > 0 ? `${child.weightVal} kg` : '-'}</span>
                                            <span className="mx-1 text-gray-300">|</span>
                                            <span className="text-gray-500">{child.heightVal > 0 ? `${child.heightVal} cm` : '-'}</span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">
                                            {child.lastUpdate}
                                            {getStatusGroup(nutrition.status) === 'danger' && child.weightVal > 0 && (
                                                <div className="flex items-center text-red-500 font-bold animate-pulse mt-1">
                                                    <FaExclamationTriangle className="mr-1" size={10} /> PERHATIAN
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="text-purple-600 hover:bg-purple-50 p-2 rounded-full transition">
                                                <FaEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}