'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';
import { useAuth } from '@/context/AuthContext';

interface ReportStats {
    totalChildren: number;
    totalParents: number;
    nutritionStatusCounts: {
        'Gizi Baik': number;
        'Gizi Kurang': number;
        'Gizi Lebih': number;
        'Gizi Buruk': number;
        'Obesitas': number;
        'Belum Ada Data': number;
    };
    childrenByKecamatan: Record<string, number>;
}

export function useReports() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ReportStats | null>(null);

    const fetchReportData = async (
        type: 'monthly' | 'yearly' | 'custom',
        year?: number,
        month?: number,
        startDate?: Date,
        endDate?: Date
    ) => {
        setLoading(true);
        try {
            // Tentukan range tanggal
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
                // default: bulan ini
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            }

            // Ambil semua anak
            const childrenSnapshot = await getDocs(collection(db, 'children'));
            const children = childrenSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                birthDate: doc.data().birthDate?.toDate(),
            })) as Child[];

            // Ambil semua user dengan role 'parent'
            const parentsQuery = query(collection(db, 'users'), where('role', '==', 'parent'));
            const parentsSnapshot = await getDocs(parentsQuery);
            const parents = parentsSnapshot.docs.map(doc => doc.data());

            // Ambil semua growth records dalam range tanggal
            const recordsQuery = query(
                collection(db, 'growthRecords'),
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<=', Timestamp.fromDate(end))
            );
            const recordsSnapshot = await getDocs(recordsQuery);
            const records = recordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
            })) as GrowthRecord[];

            // Hitung status gizi untuk setiap anak berdasarkan record terbaru
            const nutritionCounts = {
                'Gizi Baik': 0,
                'Gizi Kurang': 0,
                'Gizi Lebih': 0,
                'Gizi Buruk': 0,
                'Obesitas': 0,
                'Belum Ada Data': 0,
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

            // Hitung anak per kecamatan (dummy, karena kita tidak punya field kecamatan)
            // Sementara buat dummy
            const childrenByKecamatan: Record<string, number> = {
                'Kecamatan A': 45,
                'Kecamatan B': 38,
                'Kecamatan C': 32,
                'Lainnya': children.length - 115,
            };

            setStats({
                totalChildren: children.length,
                totalParents: parents.length,
                nutritionStatusCounts: nutritionCounts,
                childrenByKecamatan,
            });

        } catch (error) {
            console.error('Error fetching report data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { loading, stats, fetchReportData };
}