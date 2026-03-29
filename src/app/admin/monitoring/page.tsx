'use client'

import { useState, useMemo } from 'react'
import {
    FaSearch,
    FaDownload,
    FaEye,
    FaExclamationTriangle,
    FaTimes,
    FaBaby,
    FaWeight,
    FaRulerVertical,
    FaChartLine // Import yang tadi ketinggalan
} from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useMonitoringData, MonitoringChild } from '@/hooks/useMonitoringData';
import { calculateNutritionalStatus } from '@/utils/nutrition';
import GrowthChart from '@/components/features/GrowthChart'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'

export default function MonitoringPage() {
    const { loading, children } = useMonitoringData();
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // State untuk Modal Detail
    const [selectedChild, setSelectedChild] = useState<MonitoringChild | null>(null);

    // Fungsi Hitung Usia Detail
    const getDetailedAge = (birthDateStr: any) => {
        if (!birthDateStr) return '-';
        const birthDate = birthDateStr?.toDate ? birthDateStr.toDate() : new Date(birthDateStr);
        const now = new Date();

        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const partYear = years > 0 ? `${years} thn ` : '';
        const partMonth = months > 0 ? `${months} bln ` : '';
        const partDay = days > 0 ? `${days} hr` : '';

        return (partYear + partMonth + partDay).trim() || 'Baru lahir';
    };

    const getStatusGroup = (status: string) => {
        if (status.includes('Normal') || status.includes('Baik')) return 'good';
        if (status.includes('Kurang') || status.includes('Lebih')) return 'warning';
        if (status.includes('Obesitas') || status.includes('Buruk')) return 'danger';
        return 'none';
    };

    const filteredData = useMemo(() => {
        return children.filter(child => {
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header, Filter, dan Tabel tetap sama seperti sebelumnya... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitoring Data Anak</h1>
                    <p className="text-gray-500 text-sm">Status gizi real-time berdasarkan data pertumbuhan terakhir.</p>
                </div>
                <Button className="rounded-full shadow-md"><FaDownload className="mr-2" /> Export Data</Button>
            </div>

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

            <Card className="overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="p-4">Anak</th>
                                <th className="p-4">Keluarga & Usia</th>
                                <th className="p-4">Status Gizi</th>
                                <th className="p-4">Metrik Terakhir</th>
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
                                            <div className="text-gray-700 font-medium">{getDetailedAge(child.birthDate)}</div>
                                            <div className="text-[11px] text-gray-400">Ortu: {child.parentName}</div>
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
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setSelectedChild(child)}
                                                className="text-purple-600 hover:bg-purple-50 p-2 rounded-full transition"
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

            {/* MODAL DETAIL */}
            {selectedChild && (
                <ChildDetailModal
                    child={selectedChild}
                    onClose={() => setSelectedChild(null)}
                    detailedAge={getDetailedAge(selectedChild.birthDate)}
                />
            )}
        </div>
    );
}

// Sub-Komponen Modal (Pastikan FaChartLine digunakan di sini)
function ChildDetailModal({ child, onClose, detailedAge }: { child: MonitoringChild, onClose: () => void, detailedAge: string }) {
    const { records, loading } = useGrowthRecords(child.id);

    const chartData = useMemo(() => {
        return [...records]
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(r => ({
                month: r.date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
                weight: r.weight,
                height: r.height
            }));
    }, [records]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in duration-200 p-6">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                    <FaTimes size={20} />
                </button>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b pb-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <FaBaby size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
                            <p className="text-gray-500 font-medium">{detailedAge} • {child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-100 p-4">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Orang Tua</p>
                            <p className="text-lg font-bold text-blue-900">{child.parentName}</p>
                        </Card>
                        <Card className="bg-pink-50 border-pink-100 p-4">
                            <p className="text-xs text-pink-600 font-bold uppercase mb-1">Berat Terakhir</p>
                            <p className="text-lg font-bold text-pink-900 flex items-center gap-2">
                                <FaWeight /> {child.weightVal} kg
                            </p>
                        </Card>
                        <Card className="bg-emerald-50 border-emerald-100 p-4">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Tinggi Terakhir</p>
                            <p className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                                <FaRulerVertical /> {child.heightVal} cm
                            </p>
                        </Card>
                    </div>

                    {/* Bagian Grafik dengan FaChartLine */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <FaChartLine className="text-purple-500" /> Grafik Pertumbuhan
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            {chartData.length > 0 ? (
                                <GrowthChart data={chartData} height={300} type="area" />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
                                    Belum ada data pertumbuhan untuk dibuat grafik
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Histori Tabel... */}
                </div>
            </Card>
        </div>
    );
}