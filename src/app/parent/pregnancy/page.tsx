'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePregnancy } from '@/hooks/usePregnancy'
import { calculateGestationalAge } from '@/utils/pregnancy'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
    FaCapsules,
    FaClock,
    FaCheckCircle,
    FaSpinner,
    FaBaby,
    FaLeaf,
    FaVial
} from 'react-icons/fa'

export default function ParentPregnancyPage() {
    const { user } = useAuth()
    const { pregnancy, loading, savePregnancy, refresh } = usePregnancy()
    const [updatingType, setUpdatingType] = useState<'fe' | 'kelor' | null>(null)

    // AMBIL DATA HB TERBARU DARI monthlyRecords
    const latestMedicalData = useMemo(() => {
        if (!pregnancy?.monthlyRecords || pregnancy.monthlyRecords.length === 0) {
            return { hb: null, status: 'Belum Ada Data', color: 'text-gray-400', bg: 'bg-gray-50', borderColor: 'border-l-blue-500' };
        }

        // Ambil record terakhir di array
        const latest = pregnancy.monthlyRecords[pregnancy.monthlyRecords.length - 1];
        const hbValue = latest.hb;

        if (hbValue < 11.0) {
            return {
                hb: hbValue,
                status: 'ANEMIA',
                color: 'text-red-600',
                bg: 'bg-red-50',
                borderColor: 'border-l-red-500'
            };
        }
        return {
            hb: hbValue,
            status: 'NORMAL',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            borderColor: 'border-l-blue-500'
        };
    }, [pregnancy?.monthlyRecords]);

    const formatDate = (date: any) => {
        if (!date) return '-'
        const d = date.toDate ? date.toDate() : new Date(date)
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    const handleLogSupplement = async (type: 'fe' | 'kelor') => {
        if (!pregnancy || updatingType) return
        setUpdatingType(type)

        try {
            const { id, userId, createdAt, updatedAt, ...cleanData } = pregnancy;
            const payload: any = {
                ...cleanData,
                bidanId: pregnancy.bidanId || user?.bidanId || null
            };

            if (type === 'fe') {
                const currentLogs = pregnancy.pillFeLogs || [];
                const newLog = { date: new Date(), count: currentLogs.length + 1 };
                payload.pillFeLogs = [...currentLogs, newLog];
                payload.pillFeProgress = payload.pillFeLogs.length;
            } else {
                const currentLogs = pregnancy.pillKelorLogs || [];
                const newLog = { date: new Date(), count: currentLogs.length + 1 };
                payload.pillKelorLogs = [...currentLogs, newLog];
                payload.pillKelorProgress = payload.pillKelorLogs.length;
            }

            await savePregnancy(payload);
            await refresh();
            alert(`Berhasil! Konsumsi ${type === 'fe' ? 'Zat Besi' : 'Kapsul Kelor'} telah tercatat.`);
        } catch (error) {
            console.error(error);
            alert("Gagal update suplemen.");
        } finally {
            setUpdatingType(null);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="animate-spin text-pink-500" size={32} />
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Memuat Data Kehamilan...</p>
        </div>
    )

    if (!pregnancy) return (
        <div className="py-10">
            <Card className="p-8 text-center bg-white border-2 border-dashed rounded-3xl">
                <FaBaby size={48} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-gray-800 uppercase italic font-serif">Belum Ada Data</h2>
                <p className="text-sm text-gray-500 mt-2">Data belum didaftarkan oleh petugas kesehatan.</p>
            </Card>
        </div>
    )

    const ageData = calculateGestationalAge(pregnancy.hpht || new Date())

    return (
        <div className="space-y-6 pb-10">
            <header>
                <h1 className="text-2xl font-black text-gray-800 italic font-serif">Pantau Kehamilan</h1>
                <p className="text-gray-500 text-sm">Monitoring harian kesehatan Bunda & Si Kecil.</p>
            </header>

            {/* Card Usia Kehamilan */}
            <Card className="p-8 bg-gradient-to-br from-pink-500 to-rose-400 text-white border-none shadow-xl shadow-pink-100 rounded-3xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-pink-100 text-[10px] font-black uppercase tracking-widest">Usia Kehamilan Saat Ini</p>
                        <h2 className="text-6xl font-black mt-2 leading-none">
                            {ageData.weeks}<span className="text-xl font-medium ml-2">Minggu</span>
                        </h2>
                        <p className="text-pink-100 text-sm font-bold mt-2 italic">{ageData.days} Hari</p>
                    </div>
                    <FaClock className="text-5xl opacity-20" />
                </div>
            </Card>

            {/* STATUS HB DIAMBIL DARI LATEST DATA */}
            <Card className={`p-5 border-l-4 ${latestMedicalData.borderColor} flex justify-between items-center bg-white rounded-2xl shadow-sm`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${latestMedicalData.bg} ${latestMedicalData.color} rounded-lg`}>
                        <FaVial />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-tight">Kadar Hemoglobin</span>
                        <span className={`text-[10px] font-bold ${latestMedicalData.color} italic`}>{latestMedicalData.status}</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-800">{latestMedicalData.hb || '--'}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">gr%</span>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">HPL (Persalinan)</p>
                    <p className="font-bold text-gray-800 text-sm">{formatDate(pregnancy.taksiranPersalinan)}</p>
                </Card>
                <Card className="p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Tanggal HPHT</p>
                    <p className="font-bold text-gray-800 text-sm">{formatDate(pregnancy.hpht)}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-t-4 border-t-purple-500 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <FaCapsules className="text-purple-500" />
                            <h3 className="font-black text-gray-800 text-xs uppercase tracking-tighter">Zat Besi (Fe)</h3>
                        </div>
                        <span className="text-lg font-black text-purple-600">{pregnancy.pillFeProgress || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                        <div className="bg-purple-500 h-full transition-all duration-700" style={{ width: `${Math.min(((pregnancy.pillFeProgress || 0) / 100) * 100, 100)}%` }} />
                    </div>
                    <Button fullWidth className="h-16 bg-purple-600 text-white font-black rounded-2xl active:scale-95 transition-transform" onClick={() => handleLogSupplement('fe')} disabled={!!updatingType}>
                        {updatingType === 'fe' ? <FaSpinner className="animate-spin" /> : "SUDAH MINUM Fe"}
                    </Button>
                </Card>

                <Card className="p-6 border-t-4 border-t-emerald-500 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <FaLeaf />
                            <h3 className="font-black text-gray-800 text-xs uppercase tracking-tighter">Kapsul Kelor</h3>
                        </div>
                        <span className="text-lg font-black text-emerald-600">{pregnancy.pillKelorProgress || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                        <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${Math.min(((pregnancy.pillKelorProgress || 0) / 100) * 100, 100)}%` }} />
                    </div>
                    <Button fullWidth className="h-16 bg-emerald-600 text-white font-black rounded-2xl active:scale-95 transition-transform" onClick={() => handleLogSupplement('kelor')} disabled={!!updatingType}>
                        {updatingType === 'kelor' ? <FaSpinner className="animate-spin" /> : "SUDAH MINUM KELOR"}
                    </Button>
                </Card>
            </div>
        </div>
    )
}