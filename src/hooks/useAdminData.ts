// src/hooks/useAdminData.ts
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';

export function useAdminData() {
    const [loading, setLoading] = useState(true);
    // State ini berisi data anak yang sudah digabung dengan BB/TB terbaru untuk Reports & Monitoring
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
            setLoading(true);
            try {
                // 1. Fetch semua data yang dibutuhkan secara paralel
                const [childrenSnap, parentsSnap, articlesSnap, recordsSnap] = await Promise.all([
                    getDocs(collection(db, 'children')),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'parent'))),
                    getDocs(collection(db, 'articles')),
                    getDocs(collection(db, 'growthRecords'))
                ]);

                // Map data orang tua untuk mempermudah pencarian nama & telepon
                const parentsMap = new Map();
                parentsSnap.forEach(doc => {
                    const data = doc.data();
                    parentsMap.set(doc.id, {
                        name: data.name || 'Unknown',
                        phone: data.phone || ''
                    });
                });

                // 2. Olah Growth Records: Handle format tanggal (Timestamp vs String) dan cari yang TERBARU
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

                // 3. Gabungkan Data Anak dengan Hasil Pengukuran & Kalkulasi Z-Score WHO
                let goodCount = 0;
                const alertList: any[] = [];

                const enhancedChildren = childrenSnap.docs.map(doc => {
                    const child = { id: doc.id, ...doc.data() } as any;
                    const latest = latestRecordsMap.get(child.id);
                    const parentInfo = parentsMap.get(child.userId);

                    // Penyelamat Tanggal Lahir (Handle Firestore Timestamp atau String)
                    let birthDate = new Date();
                    if (child.birthDate?.seconds) {
                        birthDate = new Date(child.birthDate.seconds * 1000);
                    } else if (child.birthDate) {
                        birthDate = new Date(child.birthDate);
                    }

                    // Hitung umur detail menggunakan referensi record terbaru
                    const referenceDate = latest?.date || new Date();
                    const ageData = calculateDetailedAge(birthDate, referenceDate);

                    const weightVal = latest?.weight || 0;
                    const heightVal = latest?.height || 0;

                    // Kalkulasi Status Gizi (IMT/U) & Stunting (TB/U)
                    const result = calculateNutritionalStatus(
                        ageData.totalMonths,
                        child.gender,
                        weightVal,
                        heightVal
                    );

                    // Hitung Statistik Gizi Baik (Hanya jika data ada & status 'green')
                    if (weightVal > 0 && result.nutrition.color === 'green') {
                        goodCount++;
                    }

                    // Susun Data untuk Alert Dashboard (Jika Gizi Kurang/Lebih ATAU Stunting)
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

                    // Return objek lengkap untuk dikirim ke Reports & Monitoring
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

                // 4. Update States Utama
                setChildrenData(enhancedChildren);
                setStats({
                    totalChildren: enhancedChildren.length,
                    totalParents: parentsSnap.size,
                    totalArticles: articlesSnap.size,
                    goodNutritionPercentage: enhancedChildren.length > 0 ? Math.round((goodCount / enhancedChildren.length) * 100) : 0,
                });

                // Sort alert: Prioritas warna Merah (Bahaya) di atas
                setAlerts(alertList.sort((a, b) => (a.color === 'red' ? -1 : 1)));

            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { loading, stats, alerts, childrenData };
}