'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';
import { GrowthRecord } from '@/types/growth';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';

export function useAdminData() {
    const { user } = useAuth();
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
            if (!user) return;

            setLoading(true);
            try {
                const isBidan = user.role === 'bidan';

                // 1. QUERY PARENTS (Isolasi Data)
                let parentsBaseQuery;
                if (isBidan) {
                    parentsBaseQuery = query(
                        collection(db, 'users'),
                        where('role', '==', 'parent'),
                        where('bidanId', '==', user.uid)
                    );
                } else {
                    parentsBaseQuery = query(
                        collection(db, 'users'),
                        where('role', '==', 'parent')
                    );
                }

                const parentsSnap = await getDocs(parentsBaseQuery);
                const validParentIds = parentsSnap.docs.map(doc => doc.id);

                const parentsMap = new Map();
                parentsSnap.forEach(doc => {
                    const data = doc.data();
                    parentsMap.set(doc.id, {
                        name: data.name || 'Unknown',
                        phone: data.phone || '',
                        wilayah: data.wilayah || '-'
                    });
                });

                // 2. QUERY CHILDREN
                let childrenSnapDocs: any[] = [];
                if (validParentIds.length > 0) {
                    const qChild = query(collection(db, 'children'), where('userId', 'in', validParentIds));
                    const snap = await getDocs(qChild);
                    childrenSnapDocs = snap.docs;
                }

                // 3. FETCH GLOBAL DATA
                const [articlesSnap, recordsSnap] = await Promise.all([
                    getDocs(collection(db, 'articles')),
                    getDocs(collection(db, 'growthRecords'))
                ]);

                const records = recordsSnap.docs.map(doc => {
                    const d = doc.data();
                    let dateObj = d.date?.seconds ? new Date(d.date.seconds * 1000) : new Date(d.date || Date.now());
                    return { ...d, id: doc.id, date: dateObj };
                }) as GrowthRecord[];

                const latestRecordsMap = new Map<string, GrowthRecord>();
                records.forEach(record => {
                    const existing = latestRecordsMap.get(record.childId);
                    if (!existing || record.date > existing.date) {
                        latestRecordsMap.set(record.childId, record);
                    }
                });

                // 4. DATA ENHANCEMENT
                let goodCount = 0;
                const alertList: any[] = [];

                const enhancedChildren = childrenSnapDocs.map(doc => {
                    const childData = doc.data();
                    const child = { id: doc.id, ...childData } as any;
                    const latest = latestRecordsMap.get(child.id);
                    const parentInfo = parentsMap.get(child.userId);

                    let birthDate = child.birthDate?.seconds
                        ? new Date(child.birthDate.seconds * 1000)
                        : new Date(child.birthDate || Date.now());

                    const referenceDate = latest?.date || new Date();
                    const ageData = calculateDetailedAge(birthDate, referenceDate);

                    const weightVal = latest?.weight || 0;
                    const heightVal = latest?.height || 0;

                    // FIX: Tambahkan argumen ke-5 (baring/berdiri)
                    const result = calculateNutritionalStatus(
                        ageData.totalMonths,
                        child.gender as 'male' | 'female',
                        weightVal,
                        heightVal,
                        ageData.totalMonths < 24 ? 'baring' : 'berdiri'
                    );

                    // Pengecekan status menggunakan flag yang baru kita buat di utils
                    const isStunted = result.isStunted;
                    const isGoodNutrition = weightVal > 0 && result.weightStatus.color === 'green' && !isStunted;

                    if (isGoodNutrition) {
                        goodCount++;
                    }

                    // Alert jika ada masalah (Gizi Kurang/Buruk ATAU Stunting)
                    if (weightVal > 0 && (result.weightStatus.color !== 'green' || isStunted)) {
                        alertList.push({
                            id: child.id,
                            name: child.name,
                            age: ageData.label,
                            status: `${result.weightStatus.status}${isStunted ? ' & ' + result.heightStatus.status : ''}`,
                            color: isStunted ? 'red' : result.weightStatus.color,
                            parent: parentInfo?.name || 'Unknown',
                            phone: parentInfo?.phone || '',
                            wilayah: parentInfo?.wilayah || '-',
                            lastCheck: latest?.date ? latest.date.toLocaleDateString('id-ID') : '-'
                        });
                    }

                    return {
                        ...child,
                        parentName: parentInfo?.name || '-',
                        wilayah: parentInfo?.wilayah || '-',
                        weightVal,
                        heightVal,
                        ageInMonths: ageData.totalMonths,
                        ageLabel: ageData.label,
                        imtStatus: weightVal > 0 ? result.weightStatus.status : 'Belum ada data',
                        tbuStatus: heightVal > 0 ? result.heightStatus.status : 'Belum ada data',
                        statusColor: isStunted ? 'red' : result.weightStatus.color,
                    };
                });

                // 5. SET FINAL STATES
                setChildrenData(enhancedChildren);
                setStats({
                    totalChildren: enhancedChildren.length,
                    totalParents: parentsSnap.size,
                    totalArticles: articlesSnap.size,
                    goodNutritionPercentage: enhancedChildren.length > 0
                        ? Math.round((goodCount / enhancedChildren.length) * 100)
                        : 0,
                });

                setAlerts(alertList.sort((a, b) => (a.color === 'red' ? -1 : 1)));

            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return { loading, stats, alerts, childrenData };
}