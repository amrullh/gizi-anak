'use client'

import { useState, useMemo } from 'react'
import {
    FaSearch,
    FaDownload,
    FaEye,
    FaTimes,
    FaBaby,
    FaWeight,
    FaRulerVertical,
    FaChartLine,
    FaExclamationTriangle
} from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useMonitoringData, MonitoringChild } from '@/hooks/useMonitoringData';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';
import GrowthChart from '@/components/features/GrowthChart'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'

export default function MonitoringPage() {
    const { loading, children } = useMonitoringData();
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChild, setSelectedChild] = useState<MonitoringChild | null>(null);

    // FIX: Pastikan konversi tanggal aman sebelum dikirim ke pembantu umur
    const safeCalculateAge = (birthDate: any) => {
        if (!birthDate) return { totalMonths: 0, label: '-' };
        // Jika birthDate adalah Firebase Timestamp (punya detik), ubah ke Date
        const dateObj = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
        return calculateDetailedAge(dateObj);
    };

    const filteredData = useMemo(() => {
        return children.filter(child => {
            const ageData = safeCalculateAge(child.birthDate);
            const result = calculateNutritionalStatus(
                ageData.totalMonths,
                child.gender as 'male' | 'female',
                child.weightVal,
                child.heightVal
            );

            const matchesStatus = selectedStatus === 'all' ||
                (selectedStatus === 'good' && result.nutrition.color === 'green' && !result.stunting.isStunted) ||
                (selectedStatus === 'warning' && (result.nutrition.color === 'orange' || result.stunting.status.includes('Stunted'))) ||
                (selectedStatus === 'danger' && (result.nutrition.color === 'red' || result.stunting.status.includes('Severely')));

            const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                child.parentName?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [children, selectedStatus, searchQuery]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitoring Data Anak</h1>
                    <p className="text-gray-500 text-sm">Status gizi & stunting real-time (Standar WHO/Kemenkes 2020).</p>
                </div>
                <Button className="rounded-full shadow-md"><FaDownload className="mr-2" /> Export Data</Button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
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
                    className="px-4 py-3 border rounded-xl outline-none cursor-pointer bg-white font-medium"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="all">Semua Kondisi</option>
                    <option value="good">Kondisi Optimal (Normal)</option>
                    <option value="warning">Waspada (Gizi Kurang/Stunted)</option>
                    <option value="danger">Bahaya (Gizi Buruk/Severely Stunted)</option>
                </select>
            </div>

            <Card className="overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="p-4">Anak</th>
                                <th className="p-4">Usia & Ortu</th>
                                <th className="p-4">Status Gizi (IMT/U)</th>
                                <th className="p-4">Status Tinggi (TB/U)</th>
                                <th className="p-4">Metrik Terakhir</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((child) => {
                                const ageData = safeCalculateAge(child.birthDate);
                                const result = calculateNutritionalStatus(ageData.totalMonths, child.gender as any, child.weightVal, child.heightVal);

                                const colorMap: any = {
                                    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                                    orange: 'bg-amber-50 text-amber-700 border-amber-100',
                                    red: 'bg-red-50 text-red-700 border-red-100'
                                };

                                return (
                                    <tr key={child.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{child.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-700 font-medium">{ageData.label}</div>
                                            <div className="text-[11px] text-gray-400">Ortu: {child.parentName}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorMap[result.nutrition.color]}`}>
                                                {child.weightVal > 0 ? result.nutrition.status : 'No Data'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorMap[result.stunting.color]}`}>
                                                {child.heightVal > 0 ? result.stunting.status : 'No Data'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-600">
                                            {child.weightVal}kg | {child.heightVal}cm
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => setSelectedChild(child)} className="text-purple-600 hover:bg-purple-50 p-2 rounded-full transition">
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

            {selectedChild && (
                <DetailModal child={selectedChild} onClose={() => setSelectedChild(null)} safeCalculateAge={safeCalculateAge} />
            )}
        </div>
    );
}

function DetailModal({ child, onClose, safeCalculateAge }: { child: MonitoringChild, onClose: () => void, safeCalculateAge: any }) {
    const { records } = useGrowthRecords(child.id);
    const ageData = safeCalculateAge(child.birthDate);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 animate-in zoom-in duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                <div className="flex items-center gap-4 border-b pb-6 mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><FaBaby size={32} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
                        <p className="text-gray-500 font-medium">{ageData.label} • {child.parentName}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-50 border-none p-4 shadow-none">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><FaChartLine className="text-purple-500" /> Tren Pertumbuhan</h3>
                        <GrowthChart
                            data={records.sort((a, b) => a.date.getTime() - b.date.getTime()).map(r => ({
                                month: r.date.toLocaleDateString('id-ID', { month: 'short' }),
                                weight: r.weight,
                                height: r.height
                            }))}
                            height={250}
                        />
                    </Card>
                    <div className="space-y-4">
                        <h3 className="font-bold">Riwayat Pengukuran</h3>
                        <div className="space-y-2">
                            {records.map((r, i) => (
                                <div key={i} className="flex justify-between p-3 bg-white border rounded-lg text-sm">
                                    <span className="font-medium">{r.date.toLocaleDateString('id-ID')}</span>
                                    <span className="text-gray-600">{r.weight}kg / {r.height}cm</span>
                                    <span className="font-bold text-purple-600">{r.nutritionalStatus || 'Normal'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}