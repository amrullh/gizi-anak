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
    // Gunakan nilai angka murni untuk kalkulasi
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
                // 1. Ambil data anak
                const childrenSnap = await getDocs(collection(db, 'children'));
                const childrenList = childrenSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Child[];

                // 2. Ambil data pertumbuhan
                const recordsSnap = await getDocs(collection(db, 'growthRecords'));
                const records = recordsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate(),
                })) as GrowthRecord[];

                // Kelompokkan rekaman terbaru per anak
                const latestRecords = new Map<string, GrowthRecord>();
                records.forEach(record => {
                    const existing = latestRecords.get(record.childId);
                    if (!existing || record.date > existing.date) {
                        latestRecords.set(record.childId, record);
                    }
                });

                // 3. Ambil nama orang tua
                const parentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'parent')));
                const parentsMap = new Map<string, string>();
                parentsSnap.forEach(doc => parentsMap.set(doc.id, doc.data().name || 'Unknown'));

                // 4. Transformasi data untuk UI
                const enhancedChildren = childrenList.map(child => {
                    const latest = latestRecords.get(child.id);

                    // Hitung umur dalam bulan dari birthDate
                    const birthDate = (child.birthDate as any)?.toDate ? (child.birthDate as any).toDate() : new Date(child.birthDate);
                    const now = new Date();
                    const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

                    let lastUpdate = '-';
                    if (latest?.date) {
                        const diffDays = Math.floor((now.getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24));
                        lastUpdate = diffDays === 0 ? 'Hari ini' : diffDays === 1 ? 'Kemarin' : `${diffDays} hari lalu`;
                    }

                    return {
                        ...child,
                        latestRecord: latest,
                        parentName: parentsMap.get(child.userId) || '-',
                        lastUpdate,
                        // Pastikan mengambil nilai angka dari Firestore
                        weightVal: latest?.weight || 0,
                        heightVal: latest?.height || 0,
                        ageInMonths: ageInMonths < 0 ? 0 : ageInMonths,
                    };
                });

                setChildren(enhancedChildren as MonitoringChild[]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { loading, children };
}