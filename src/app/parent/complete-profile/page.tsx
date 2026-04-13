'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePregnancy } from '@/hooks/usePregnancy';
import { calculateGestationalAge } from '@/utils/pregnancy';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaCalendarAlt, FaCapsules, FaClock, FaCheckCircle, FaSpinner, FaBaby, FaHistory, FaPlus } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';

export default function ParentPregnancyPage() {
    const { user } = useAuth();
    const { pregnancy, loading, savePregnancy } = usePregnancy();
    const [updating, setUpdating] = useState(false);

    const formatDate = (date: any) => {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const handleAddPill = async () => {
        if (!pregnancy || updating) return;
        setUpdating(true);
        try {
            const currentProgress = pregnancy.pillProgress || 0;
            if (currentProgress >= 90) {
                alert("Bunda sudah menyelesaikan target 90 hari konsumsi pil. Luar biasa!");
                return;
            }

            // Buat log baru dengan timestamp saat ini
            const newLog = {
                date: Timestamp.now(),
                count: currentProgress + 1
            };

            const { id, userId, createdAt, updatedAt, ...cleanData } = pregnancy;

            await savePregnancy({
                ...cleanData,
                pillProgress: currentProgress + 1,
                // Tambahkan log ke dalam array pillLogs
                pillLogs: [...(pregnancy.pillLogs || []), newLog]
            } as any);

            alert("Berhasil mencatat! Sehat selalu untuk Bunda dan Si Kecil.");
        } catch (error) {
            console.error("Gagal update pil:", error);
            alert("Gagal memperbarui data. Silakan coba lagi.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="animate-spin text-pink-500" size={32} />
            <p className="text-gray-400 font-bold uppercase text-xs">Memuat Data Kehamilan...</p>
        </div>
    );

    if (!pregnancy) return (
        <div className="py-10">
            <Card className="p-8 text-center bg-white border-2 border-dashed">
                <FaBaby size={48} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-gray-800 uppercase">Belum Ada Data</h2>
                <p className="text-sm text-gray-500 mt-2">Data kehamilan Bunda belum didaftarkan oleh petugas kesehatan atau bidan.</p>
            </Card>
        </div>
    );

    const ageData = calculateGestationalAge(pregnancy.hpht || new Date());

    return (
        <div className="space-y-6 pb-10 max-w-2xl mx-auto">
            <header>
                <h1 className="text-2xl font-black text-gray-800 leading-none">Pantau Kehamilan</h1>
                <p className="text-gray-500 text-sm mt-2">Update harian kondisi Bunda dan Si Kecil.</p>
            </header>

            {/* Card Usia Kehamilan */}
            <Card className="p-6 bg-gradient-to-br from-pink-500 to-rose-400 text-white border-none shadow-lg shadow-pink-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-pink-100 text-[10px] font-black uppercase tracking-widest">Usia Kehamilan Bunda</p>
                        <h2 className="text-5xl font-black mt-2">{ageData.weeks}<span className="text-xl font-medium ml-2">Minggu</span></h2>
                        <p className="text-pink-100 text-sm font-bold mt-1">{ageData.days} Hari</p>
                    </div>
                    <FaClock className="text-4xl opacity-30 mt-2" />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                        <FaCalendarAlt size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Prediksi Lahiran (HPL)</p>
                        <p className="font-bold text-gray-800">{formatDate(pregnancy.taksiranPersalinan)}</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <FaClock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Tanggal HPHT</p>
                        <p className="font-bold text-gray-800">{formatDate(pregnancy.hpht)}</p>
                    </div>
                </Card>
            </div>

            {/* Monitoring Pil Fe (Zat Besi) */}
            <Card className="p-6 border-t-4 border-t-purple-500 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <FaCapsules className="text-purple-500" />
                        <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Konsumsi Pil Fe (Target 90)</h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-purple-600 leading-none">{pregnancy.pillProgress || 0}/90</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Butir</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-6 border border-gray-50">
                    <div
                        className="bg-purple-500 h-full transition-all duration-1000 ease-out"
                        style={{ width: `${((pregnancy.pillProgress || 0) / 90) * 100}%` }}
                    />
                </div>

                <Button
                    fullWidth
                    className="h-16 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-100 active:scale-95 transition-all flex items-center justify-center"
                    onClick={handleAddPill}
                    disabled={updating}
                >
                    {updating ? <FaSpinner className="animate-spin" size={24} /> : (
                        <div className="flex flex-col items-center">
                            <span className="flex items-center gap-2 text-base"><FaPlus /> CATAT MINUM PIL HARI INI</span>
                        </div>
                    )}
                </Button>

                {/* RIWAYAT MINUM PIL */}
                {pregnancy.pillLogs && pregnancy.pillLogs.length > 0 && (
                    <div className="mt-8 border-t border-dashed border-gray-200 pt-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FaHistory className="text-purple-400" /> Riwayat Konsumsi Terakhir
                        </h4>
                        <div className="space-y-3">
                            {pregnancy.pillLogs.slice(-3).reverse().map((log: any, index: number) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-purple-500 border border-purple-100 shadow-sm">
                                            <span className="text-xs font-black">{log.count}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">Pil Fe Telah Diminum</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500">{formatDate(log.date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-start">
                <div className="mt-1 text-blue-500">
                    <FaCheckCircle size={18} />
                </div>
                <p className="text-xs text-blue-700 leading-relaxed italic">
                    Konsumsi pil zat besi (Fe) secara teratur membantu mencegah anemia dan memastikan Si Kecil mendapatkan oksigen serta nutrisi yang cukup selama di dalam kandungan.
                </p>
            </div>
        </div>
    );
}