'use client';

import { useState, useMemo } from 'react'
import {
    FaSearch,
    FaEye,
    FaTimes,
    FaBaby,
    FaChartLine,
    FaHeartbeat,
    FaInfoCircle,
    FaWaveSquare
} from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { useMonitoringData, MonitoringChild } from '@/hooks/useMonitoringData';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';
import GrowthChart from '@/components/features/GrowthChart'
import ZScoreChart from '@/components/features/ZScoreChart'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'
import { useAuth } from '@/context/AuthContext';

// Helper untuk menangani fleksibilitas tipe data Firebase Timestamp vs Date JS
const convertTimestampToDate = (dateField: any): Date => {
    if (!dateField) return new Date();
    if (dateField.seconds) return new Date(dateField.seconds * 1000);
    return new Date(dateField);
};

const getBadgeColor = (status: string): string => {
    if (status.includes('Sangat Kurang') || status.includes('Severely') || status.includes('Buruk') || status.includes('Sangat Pendek'))
        return 'bg-red-100 text-red-700 border-red-200';
    if (status.includes('Kurang') || status.includes('Pendek') || status.includes('Risiko') || status.includes('Lebih'))
        return 'bg-orange-100 text-orange-700 border-orange-200';
    if (status.includes('Normal') || status.includes('Baik'))
        return 'bg-green-100 text-green-700 border-green-200';
    if (status.includes('Tinggi'))
        return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
};

export default function MonitoringPage() {
    const { user } = useAuth();
    const { loading, children } = useMonitoringData();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChild, setSelectedChild] = useState<MonitoringChild | null>(null);

    const filteredData = useMemo(() => {
        return children.filter(child => {
            const isBidan = user?.role === 'bidan';
            const matchesBidan = !isBidan || child.bidanId === user?.uid;
            if (!matchesBidan) return false;

            const birthDate = convertTimestampToDate(child.birthDate);
            const ageData = calculateDetailedAge(birthDate);

            const result = calculateNutritionalStatus(
                ageData.totalMonths,
                child.gender as 'male' | 'female',
                child.weightVal,
                child.heightVal,
                ageData.totalMonths < 24 ? 'baring' : 'berdiri'
            );

            const matchesStatus = selectedStatus === 'all' ||
                (selectedStatus === 'good' && result.weightStatus.color === 'green') ||
                (selectedStatus === 'warning' && result.weightStatus.color === 'orange') ||
                (selectedStatus === 'danger' && result.weightStatus.color === 'red');

            const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                child.parentName?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [children, selectedStatus, searchQuery, user]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 p-4 md:p-6 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-serif italic font-semibold text-gray-800">Monitoring Gizi (Permenkes 2020)</h1>
                    <p className="text-gray-400 text-sm">
                        {user?.role === 'bidan' ? `Wilayah Kerja: ${user?.wilayah}` : 'Data Antropometri Nasional'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Cari nama anak atau orang tua..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-1 focus:ring-pink-300"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 bg-gray-50 border rounded-xl outline-none text-sm"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="all">Semua Status Gizi (BB/U)</option>
                    <option value="good">Gizi Baik (Normal)</option>
                    <option value="warning">Gizi Kurang / Waspada</option>
                    <option value="danger">Gizi Buruk / Sangat Kurang</option>
                </select>
            </div>

            <Card className="overflow-hidden border-none shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="p-4">Identitas Anak</th>
                                <th className="p-4">Usia</th>
                                <th className="p-4">BB/U</th>
                                <th className="p-4">TB/U</th>
                                <th className="p-4">BB/TB</th>
                                <th className="p-4 text-center">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((child) => {
                                const birthDate = convertTimestampToDate(child.birthDate);
                                const age = calculateDetailedAge(birthDate);
                                const res = calculateNutritionalStatus(
                                    age.totalMonths,
                                    child.gender as any,
                                    child.weightVal,
                                    child.heightVal,
                                    age.totalMonths < 24 ? 'baring' : 'berdiri'
                                );

                                return (
                                    <tr key={child.id} className="hover:bg-pink-50/20">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-700">{child.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase">{child.parentName}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{age.label}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold border ${getBadgeColor(res.weightStatus.status)}`}>
                                                {res.weightStatus.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold border ${getBadgeColor(res.heightStatus.status)}`}>
                                                {res.heightStatus.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold border ${getBadgeColor(res.whStatus.status)}`}>
                                                {res.whStatus.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => setSelectedChild(child)} className="text-pink-500 hover:scale-110 transition-transform">
                                                <FaEye size={18} />
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
                <DetailModal
                    child={selectedChild}
                    onClose={() => setSelectedChild(null)}
                />
            )}
        </div>
    );
}

function DetailModal({ child, onClose }: { child: MonitoringChild; onClose: () => void }) {
    const { records } = useGrowthRecords(child.id);
    const birthDate = convertTimestampToDate(child.birthDate);
    const age = calculateDetailedAge(birthDate);
    const analysis = calculateNutritionalStatus(
        age.totalMonths,
        child.gender as any,
        child.weightVal,
        child.heightVal,
        age.totalMonths < 24 ? 'baring' : 'berdiri'
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Area Luar untuk Close */}
            <div className="absolute inset-0" onClick={onClose} />

            <Card className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl relative p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* TOMBOL CLOSE (FIXED) */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 z-[70] p-2 bg-white/90 backdrop-blur shadow-md rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                >
                    <FaTimes size={20} />
                </button>

                {/* Wrapper Scrollable */}
                <div className="overflow-y-auto flex-1">
                    {/* Header */}
                    <div className="p-8 bg-gradient-to-br from-pink-50 to-white border-b sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-pink-500 border border-pink-100">
                                <FaBaby size={40} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif italic font-bold text-gray-800">{child.name}</h2>
                                <p className="text-gray-500 font-medium">Usia: {age.label} ({age.totalMonths} bulan)</p>
                                <p className="text-gray-400 text-sm">Orang tua: {child.parentName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Detail */}
                    <div className="p-8 space-y-8">
                        {/* Nilai Z-Score */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="md:col-span-1 space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaInfoCircle /> Skor Antropometri
                                </h3>
                                {[
                                    { label: 'BB/U', val: analysis.zWeightForAge, status: analysis.weightStatus },
                                    { label: 'TB/U', val: analysis.zHeightForAge, status: analysis.heightStatus },
                                    { label: 'BB/TB', val: analysis.zWeightForHeight, status: analysis.whStatus }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</p>
                                        <div className="flex justify-between items-end mt-1">
                                            <span className="text-2xl font-black text-gray-800">{item.val ?? '—'}</span>
                                            <span className={`text-[9px] leading-tight text-right font-bold px-2 py-1 rounded max-w-[80px] ${item.status.color === 'green' ? 'text-green-600 bg-green-50' : item.status.color === 'orange' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
                                                {item.status.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grafik Pertumbuhan */}
                            <div className="md:col-span-3 space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaChartLine /> Tren Pertumbuhan (BB & TB)
                                </h3>
                                <div className="bg-white border rounded-2xl p-4 h-[300px]">
                                    <GrowthChart
                                        data={records.sort((a, b) => a.date.getTime() - b.date.getTime()).map(r => ({
                                            month: r.date.toLocaleDateString('id-ID', { month: 'short' }),
                                            weight: r.weight,
                                            height: r.height
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Grafik Z-Score Sebaran */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FaWaveSquare /> Sebaran Z-Score (Kondisi Saat Ini)
                            </h3>
                            <div className="bg-white border rounded-2xl p-6 h-[350px]">
                                <ZScoreChart
                                    zWeightForAge={analysis.zWeightForAge}
                                    zHeightForAge={analysis.zHeightForAge}
                                    zWeightForHeight={analysis.zWeightForHeight}
                                />
                            </div>
                        </div>

                        {/* Riwayat Pengukuran */}
                        <div className="pt-4 border-t">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FaHeartbeat /> Riwayat Pengukuran Terakhir
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {records.slice(-4).reverse().map((r, i) => (
                                    <div key={i} className="p-3 bg-white border rounded-xl shadow-sm text-center">
                                        <p className="text-[10px] font-bold text-gray-400">{r.date.toLocaleDateString('id-ID')}</p>
                                        <p className="text-sm font-black text-gray-700">{r.weight} kg / {r.height} cm</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}