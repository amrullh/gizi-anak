'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';
import { useAuth } from '@/context/AuthContext';

interface ReportStats {
    totalChildren: number;
    totalParents: number;
    totalPregnancies: number; // Tambahan untuk statistik hamil
    nutritionStatusCounts: {
        'Gizi Baik': number;
        'Gizi Kurang': number;
        'Gizi Lebih': number;
        'Gizi Buruk': number;
        'Obesitas': number;
        'Belum Ada Data': number;
    };
    childrenByWilayah: Record<string, number>;
}

export function useReports() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const { user: currentUser } = useAuth();

    const fetchReportData = async (
        type: 'monthly' | 'yearly' | 'custom',
        year?: number,
        month?: number,
        startDate?: Date,
        endDate?: Date
    ) => {
        setLoading(true);
        try {
            const role = currentUser?.role as any;
            const userWilayah = currentUser?.wilayah;

            // 1. Tentukan range tanggal
            let start: Date, end: Date;
            const now = new Date();

            if (type === 'monthly' && year && month !== undefined) {
                start = new Date(year, month - 1, 1);
                end = new Date(year, month, 0, 23, 59, 59);
            } else if (type === 'yearly' && year) {
                start = new Date(year, 0, 1);
                end = new Date(year, 11, 31, 23, 59, 59);
            } else if (type === 'custom' && startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59);
            } else {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            }

            // 2. Query Data Anak (Filter wilayah jika bukan Admin Global)
            let childrenQuery = query(collection(db, 'children'));
            if (role === 'admin_puskesmas') {
                // Catatan: Pastikan di koleksi children ada field 'wilayah'
                childrenQuery = query(collection(db, 'children'), where('wilayah', '==', userWilayah));
            } else if (role === 'bidan') {
                childrenQuery = query(collection(db, 'children'), where('bidanId', '==', currentUser?.uid));
            }

            const childrenSnapshot = await getDocs(childrenQuery);
            const children = childrenSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                birthDate: doc.data().birthDate?.toDate(),
            })) as Child[];

            // 3. Query Data Kehamilan (Export Baru)
            let pregnancyQuery = query(collection(db, 'pregnancies'));
            if (role === 'admin_puskesmas') {
                pregnancyQuery = query(collection(db, 'pregnancies'), where('wilayah', '==', userWilayah));
            } else if (role === 'bidan') {
                pregnancyQuery = query(collection(db, 'pregnancies'), where('bidanId', '==', currentUser?.uid));
            }

            const pregnancySnapshot = await getDocs(pregnancyQuery);
            const pregnancies = pregnancySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                hpht: doc.data().hpht?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            }));

            // 4. Query Growth Records
            const recordsQuery = query(
                collection(db, 'growthRecords'),
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<=', Timestamp.fromDate(end))
            );
            const recordsSnapshot = await getDocs(recordsQuery);
            const allRecords = recordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
            })) as GrowthRecord[];

            // Filter records hanya untuk anak yang masuk dalam scope wilayah
            const validChildIds = children.map(c => c.id);
            const records = allRecords.filter(r => validChildIds.includes(r.childId));

            // 5. Kalkulasi Statistik
            const nutritionCounts = {
                'Gizi Baik': 0, 'Gizi Kurang': 0, 'Gizi Lebih': 0, 'Gizi Buruk': 0, 'Obesitas': 0, 'Belum Ada Data': 0,
            };

            children.forEach(child => {
                const childRecords = records.filter(r => r.childId === child.id);
                if (childRecords.length === 0) {
                    nutritionCounts['Belum Ada Data']++;
                } else {
                    const latest = childRecords.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
                    const status = latest.nutritionalStatus || 'Gizi Baik';
                    if (nutritionCounts.hasOwnProperty(status)) {
                        nutritionCounts[status as keyof typeof nutritionCounts]++;
                    } else {
                        nutritionCounts['Gizi Baik']++;
                    }
                }
            });

            // Hitung distribusi wilayah asli
            const countsByWilayah: Record<string, number> = {};
            children.forEach(c => {
                const w = c.wilayah || 'Tidak Terdata';
                countsByWilayah[w] = (countsByWilayah[w] || 0) + 1;
            });

            setStats({
                totalChildren: children.length,
                totalParents: 0, // Bisa ditambahkan query user jika perlu
                totalPregnancies: pregnancies.length,
                nutritionStatusCounts: nutritionCounts,
                childrenByWilayah: countsByWilayah,
            });

            // Kembalikan data mentah untuk kebutuhan fungsi export (xlsx/csv)
            return {
                children,
                pregnancies,
                records
            };

        } catch (error) {
            console.error('Error fetching report data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { loading, stats, fetchReportData };
}