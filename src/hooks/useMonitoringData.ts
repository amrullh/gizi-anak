'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';
import { useAuth } from '@/context/AuthContext';

export interface MonitoringChild extends Child {
    latestRecord?: GrowthRecord;
    parentName?: string;
    lastUpdate?: string;
    wilayah?: string;
    bidanId?: string; //
    weightVal: number;
    heightVal: number;
    ageInMonths: number;
}

export function useMonitoringData() {
    const { user } = useAuth(); // Ambil user untuk filter bidan
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<MonitoringChild[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const isBidan = user.role === 'bidan';

                // 1. Ambil data orang tua dengan filter Bidan (Logic Krusial)
                let parentsQuery;
                if (isBidan) {
                    parentsQuery = query(
                        collection(db, 'users'),
                        where('role', '==', 'parent'),
                        where('bidanId', '==', user.uid)
                    );
                } else {
                    parentsQuery = query(
                        collection(db, 'users'),
                        where('role', '==', 'parent')
                    );
                }

                const parentsSnap = await getDocs(parentsQuery);
                const parentsMap = new Map<string, { name: string, wilayah: string }>();
                const validParentIds: string[] = [];

                parentsSnap.forEach(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    validParentIds.push(id);
                    parentsMap.set(id, {
                        name: data.name || 'Unknown',
                        wilayah: data.wilayah || '-'
                    });
                });

                // Jika bidan tidak punya pasien, hentikan proses agar tidak error di query 'in'
                if (validParentIds.length === 0 && isBidan) {
                    setChildren([]);
                    setLoading(false);
                    return;
                }

                // 2. Ambil data anak (Filter berdasarkan orang tua yang valid)
                let childrenQuery;
                if (isBidan) {
                    // Hanya ambil anak dari orang tua yang dikelola bidan tersebut
                    childrenQuery = query(collection(db, 'children'), where('userId', 'in', validParentIds));
                } else {
                    childrenQuery = query(collection(db, 'children'));
                }

                const childrenSnap = await getDocs(childrenQuery);
                const childrenList = childrenSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Child[];

                // 3. Ambil data pertumbuhan & cari yang terbaru per anak
                const recordsSnap = await getDocs(collection(db, 'growthRecords'));
                const records = recordsSnap.docs.map(doc => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        ...d,
                        date: d.date?.toDate ? d.date.toDate() : new Date(d.date),
                    };
                }) as GrowthRecord[];

                const latestRecords = new Map<string, GrowthRecord>();
                records.forEach(record => {
                    const existing = latestRecords.get(record.childId);
                    if (!existing || record.date > existing.date) {
                        latestRecords.set(record.childId, record);
                    }
                });

                // 4. Transformasi data gabungan
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
                        wilayah: parentData?.wilayah || '-',
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
    }, [user]);

    return { loading, children };
}