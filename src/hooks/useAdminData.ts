// src/hooks/useAdminData.ts
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client'; // Pastikan import db dari client
import { useAuth } from '@/context/AuthContext'; // Tambahkan ini untuk cek role & wilayah
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';

export function useAdminData() {
    const { user } = useAuth(); // Ambil context user
    const [loading, setLoading] = useState(true);
    const [childrenData, setChildrenData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalChildren: 0,
        totalParents: 0,
        totalArticles: 0,
        goodNutritionPercentage: 0,
    });
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // Pastikan data user sudah tersedia sebelum melakukan query
            if (!user) return;

            setLoading(true);
            try {
                const isBidan = user.role === 'bidan';
                const wilayahUser = user.wilayah;

                // 1. Filter Orang Tua berdasarkan Wilayah (Jika Bidan)
                let parentsBaseQuery = query(collection(db, 'users'), where('role', '==', 'parent'));
                if (isBidan && wilayahUser) {
                    parentsBaseQuery = query(parentsBaseQuery, where('wilayah', '==', wilayahUser));
                }

                const parentsSnap = await getDocs(parentsBaseQuery);
                const validParentIds = parentsSnap.docs.map(doc => doc.id);

                const parentsMap = new Map();
                parentsSnap.forEach(doc => {
                    const data = doc.data();
                    parentsMap.set(doc.id, {
                        name: data.name || 'Unknown',
                        phone: data.phone || ''
                    });
                });

                // 2. Filter Anak berdasarkan ID Orang Tua yang sudah terfilter (Jika Bidan)
                let childrenSnapDocs: any[] = [];
                if (isBidan) {
                    if (validParentIds.length > 0) {
                        // Ambil hanya anak yang orang tuanya ada di wilayah tersebut
                        const qChild = query(collection(db, 'children'), where('userId', 'in', validParentIds));
                        const snap = await getDocs(qChild);
                        childrenSnapDocs = snap.docs;
                    } else {
                        childrenSnapDocs = [];
                    }
                } else {
                    // Admin Pusat: Ambil semua anak
                    const snap = await getDocs(collection(db, 'children'));
                    childrenSnapDocs = snap.docs;
                }

                // 3. Fetch data lainnya (Artikel & Records tetap diambil semua untuk referensi)
                const [articlesSnap, recordsSnap] = await Promise.all([
                    getDocs(collection(db, 'articles')),
                    getDocs(collection(db, 'growthRecords'))
                ]);

                // Mapping Records
                const records = recordsSnap.docs.map(doc => {
                    const d = doc.data();
                    let dateObj = new Date();
                    if (d.date?.seconds) {
                        dateObj = new Date(d.date.seconds * 1000);
                    } else if (d.date) {
                        dateObj = new Date(d.date);
                    }
                    return { ...d, id: doc.id, date: dateObj };
                }) as GrowthRecord[];

                const latestRecordsMap = new Map<string, GrowthRecord>();
                records.forEach(record => {
                    const existing = latestRecordsMap.get(record.childId);
                    if (!existing || record.date > existing.date) {
                        latestRecordsMap.set(record.childId, record);
                    }
                });

                // 4. Gabungkan Data Anak yang sudah terfilter
                let goodCount = 0;
                const alertList: any[] = [];

                const enhancedChildren = childrenSnapDocs.map(doc => {
                    const child = { id: doc.id, ...doc.data() } as any;
                    const latest = latestRecordsMap.get(child.id);
                    const parentInfo = parentsMap.get(child.userId);

                    let birthDate = new Date();
                    if (child.birthDate?.seconds) {
                        birthDate = new Date(child.birthDate.seconds * 1000);
                    } else if (child.birthDate) {
                        birthDate = new Date(child.birthDate);
                    }

                    const referenceDate = latest?.date || new Date();
                    const ageData = calculateDetailedAge(birthDate, referenceDate);
                    const weightVal = latest?.weight || 0;
                    const heightVal = latest?.height || 0;

                    const result = calculateNutritionalStatus(
                        ageData.totalMonths,
                        child.gender,
                        weightVal,
                        heightVal
                    );

                    if (weightVal > 0 && result.nutrition.color === 'green') {
                        goodCount++;
                    }

                    if (weightVal > 0 && (result.nutrition.color !== 'green' || result.stunting.isStunted)) {
                        alertList.push({
                            id: child.id,
                            name: child.name,
                            age: ageData.label,
                            status: `${result.nutrition.status}${result.stunting.isStunted ? ' & ' + result.stunting.status : ''}`,
                            color: result.stunting.isStunted ? 'red' : result.nutrition.color,
                            parent: parentInfo?.name || 'Unknown',
                            phone: parentInfo?.phone || '',
                            days: Math.floor((new Date().getTime() - (latest?.date?.getTime() || 0)) / (1000 * 60 * 60 * 24))
                        });
                    }

                    return {
                        ...child,
                        parentName: parentInfo?.name || '-',
                        weightVal,
                        heightVal,
                        ageInMonths: ageData.totalMonths,
                        ageLabel: ageData.label,
                        imtStatus: weightVal > 0 ? result.nutrition.status : 'Data Kosong',
                        tbuStatus: heightVal > 0 ? result.stunting.status : 'Data Kosong',
                        lastUpdate: latest?.date ? ageData.label : '-'
                    };
                });

                // 5. Update States Utama
                setChildrenData(enhancedChildren);
                setStats({
                    totalChildren: enhancedChildren.length,
                    totalParents: parentsSnap.size,
                    totalArticles: articlesSnap.size,
                    goodNutritionPercentage: enhancedChildren.length > 0 ? Math.round((goodCount / enhancedChildren.length) * 100) : 0,
                });

                setAlerts(alertList.sort((a, b) => (a.color === 'red' ? -1 : 1)));

            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]); // Re-fetch jika data user berubah

    return { loading, stats, alerts, childrenData };
}