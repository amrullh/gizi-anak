'use client';

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
    FaExclamationTriangle,
    FaHeartbeat
} from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useMonitoringData, MonitoringChild } from '@/hooks/useMonitoringData';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';
import GrowthChart from '@/components/features/GrowthChart'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'
import { useAuth } from '@/context/AuthContext'; // IMPORT: useAuth untuk filter wilayah

export default function MonitoringPage() {
    const { user } = useAuth(); // AMBIL: Data user/bidan yang login
    const { loading, children } = useMonitoringData();
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedChild, setSelectedChild] = useState<MonitoringChild | null>(null);

    const safeCalculateAge = (birthDate: any) => {
        if (!birthDate) return { totalMonths: 0, label: '-' };
        const dateObj = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
        return calculateDetailedAge(dateObj);
    };

    const filteredData = useMemo(() => {
        return children.filter(child => {
            // REVISI LOGIC: Filter berdasarkan wilayah jika user adalah bidan
            const isBidan = user?.role === 'bidan';
            const matchesWilayah = !isBidan || child.wilayah === user?.wilayah;

            if (!matchesWilayah) return false;

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
    }, [children, selectedStatus, searchQuery, user]); // TAMBAHKAN: user ke dependency array

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-400"></div>
                <p className="text-xs text-pink-400 animate-pulse">Memuat data monitoring...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-4 md:p-6 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-px w-6 bg-pink-300"></span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-pink-400">Data Anak</span>
                    </div>
                    <h1 className="text-2xl font-serif italic font-semibold text-gray-800">Monitoring Data Anak</h1>
                    <p className="text-gray-400 text-sm">
                        {user?.role === 'bidan' ? `Wilayah: ${user?.wilayah}` : 'Status gizi & stunting real-time (Standar WHO/Kemenkes 2020)'}
                    </p>
                </div>
                <Button className="rounded-full shadow-sm bg-pink-500 hover:bg-pink-600 text-white border-none transition-all">
                    <FaDownload className="mr-2" size={14} /> Export Data
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 text-sm" />
                    <input
                        type="text"
                        placeholder="Cari nama anak atau orang tua..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition-all text-sm"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer text-gray-700 text-sm focus:ring-1 focus:ring-pink-300 focus:border-pink-300"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="all">Semua Kondisi</option>
                    <option value="good">Kondisi Optimal (Normal)</option>
                    <option value="warning">Waspada (Gizi Kurang/Stunted)</option>
                    <option value="danger">Bahaya (Gizi Buruk/Severely Stunted)</option>
                </select>
            </div>

            <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Anak</th>
                                <th className="p-4">Usia & Ortu</th>
                                <th className="p-4">Status Gizi (IMT/U)</th>
                                <th className="p-4">Status Tinggi (TB/U)</th>
                                <th className="p-4">Metrik Terakhir</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredData.map((child) => {
                                const ageData = safeCalculateAge(child.birthDate);
                                const result = calculateNutritionalStatus(ageData.totalMonths, child.gender as any, child.weightVal, child.heightVal);

                                const colorMap: any = {
                                    green: 'bg-green-50 text-green-700 border-green-200',
                                    orange: 'bg-orange-50 text-orange-700 border-orange-200',
                                    red: 'bg-red-50 text-red-700 border-red-200'
                                };

                                return (
                                    <tr key={child.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-800">{child.name}</div>
                                            <div className="text-[10px] text-pink-400 uppercase font-medium">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-700">{ageData.label}</div>
                                            <div className="text-[11px] text-gray-400">Ortu: {child.parentName}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${colorMap[result.nutrition.color]}`}>
                                                {child.weightVal > 0 ? result.nutrition.status : 'No Data'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${colorMap[result.stunting.color]}`}>
                                                {child.heightVal > 0 ? result.stunting.status : 'No Data'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-500">
                                            {child.weightVal} kg | {child.heightVal} cm
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setSelectedChild(child)}
                                                className="text-pink-400 hover:text-pink-600 hover:bg-pink-50 p-2 rounded-full transition-all"
                                            >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-gray-400 hover:text-pink-500 transition-colors"
                >
                    <FaTimes size={20} />
                </button>
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                        <FaBaby size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif italic font-semibold text-gray-800">{child.name}</h2>
                        <p className="text-gray-500 text-sm">{ageData.label} • {child.parentName}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-none">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
                            <FaChartLine className="text-pink-500" /> Tren Pertumbuhan
                        </h3>
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
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <FaHeartbeat className="text-pink-500" /> Riwayat Pengukuran
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {records.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">Belum ada data pengukuran.</p>
                            ) : (
                                records.map((r, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl text-sm shadow-sm">
                                        <span className="font-medium text-gray-600">{r.date.toLocaleDateString('id-ID')}</span>
                                        <span className="text-gray-500">{r.weight} kg / {r.height} cm</span>
                                        <span className="font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full text-xs">
                                            {r.nutritionalStatus || 'Normal'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}