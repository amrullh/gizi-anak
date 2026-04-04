// src/hooks/useMonitoringData.ts
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';

export interface MonitoringChild extends Child {
    latestRecord?: GrowthRecord;
    parentName?: string;
    lastUpdate?: string;
    wilayah?: string; // TAMBAHKAN INI: Agar dikenal oleh Monitoring Page
    weightVal: number;
    heightVal: number;
    ageInMonths: number;
}

export function useMonitoringData() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<MonitoringChild[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Ambil data orang tua untuk mendapatkan Nama & Wilayah
                const parentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'parent')));
                const parentsMap = new Map<string, { name: string, wilayah: string }>();

                parentsSnap.forEach(doc => {
                    const data = doc.data();
                    parentsMap.set(doc.id, {
                        name: data.name || 'Unknown',
                        wilayah: data.wilayah || '' // Ambil wilayah dari dokumen user
                    });
                });

                // 2. Ambil data anak
                const childrenSnap = await getDocs(collection(db, 'children'));
                const childrenList = childrenSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Child[];

                // 3. Ambil data pertumbuhan & cari yang terbaru per anak
                const recordsSnap = await getDocs(collection(db, 'growthRecords'));
                const records = recordsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date),
                })) as GrowthRecord[];

                const latestRecords = new Map<string, GrowthRecord>();
                records.forEach(record => {
                    const existing = latestRecords.get(record.childId);
                    if (!existing || record.date > existing.date) {
                        latestRecords.set(record.childId, record);
                    }
                });

                // 4. Transformasi data gabungan (Anak + Ortu + Wilayah + Record Terakhir)
                const enhancedChildren = childrenList.map(child => {
                    const latest = latestRecords.get(child.id);
                    const parentData = parentsMap.get(child.userId);

                    // Hitung umur dalam bulan
                    const birthDate = (child.birthDate as any)?.toDate ? (child.birthDate as any).toDate() : new Date(child.birthDate);
                    const now = new Date();
                    const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

                    // Hitung label waktu update terakhir
                    let lastUpdate = '-';
                    if (latest?.date) {
                        const diffDays = Math.floor((now.getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24));
                        lastUpdate = diffDays === 0 ? 'Hari ini' : diffDays === 1 ? 'Kemarin' : `${diffDays} hari lalu`;
                    }

                    return {
                        ...child,
                        latestRecord: latest,
                        parentName: parentData?.name || '-',
                        wilayah: parentData?.wilayah || '', // PETAKAN wilayah di sini
                        lastUpdate,
                        weightVal: latest?.weight || 0,
                        heightVal: latest?.height || 0,
                        ageInMonths: ageInMonths < 0 ? 0 : ageInMonths,
                    };
                });

                setChildren(enhancedChildren as MonitoringChild[]);
            } catch (error) {
                console.error('Error fetching monitoring data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { loading, children };
}