'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { GrowthRecord } from '@/types/growth';
import { calculateNutritionalStatus } from '@/utils/nutrition';

export function useAdminData() {
    const [loading, setLoading] = useState(true);
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
                // 1. Fetch Children & Parents & Articles
                const [childrenSnap, parentsSnap, articlesSnap, recordsSnap] = await Promise.all([
                    getDocs(collection(db, 'children')),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'parent'))),
                    getDocs(collection(db, 'articles')),
                    getDocs(collection(db, 'growthRecords'))
                ]);

                const children = childrenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Child[];
                const parentsMap = new Map();
                parentsSnap.forEach(doc => parentsMap.set(doc.id, doc.data().name));

                // 2. Process Growth Records
                const records = recordsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate()
                })) as GrowthRecord[];

                const latestRecords = new Map<string, GrowthRecord>();
                records.forEach(record => {
                    const existing = latestRecords.get(record.childId);
                    if (!existing || record.date > existing.date) {
                        latestRecords.set(record.childId, record);
                    }
                });

                // 3. Calculate Nutrition Stats & Alerts
                let goodCount = 0;
                const alertList: any[] = [];

                children.forEach(child => {
                    const latest = latestRecords.get(child.id);
                    if (latest) {
                        // Calculate age in months
                        const birthDate = (child.birthDate as any)?.toDate ? (child.birthDate as any).toDate() : new Date(child.birthDate);
                        const ageInMonths = (new Date().getFullYear() - birthDate.getFullYear()) * 12 + (new Date().getMonth() - birthDate.getMonth());

                        // Use your nutrition utils
                        const nutrition = calculateNutritionalStatus(ageInMonths, child.gender as any, latest.weight, latest.height);

                        if (nutrition.status.includes('Baik') || nutrition.status.includes('Normal')) {
                            goodCount++;
                        } else if (nutrition.status.includes('Kurang') || nutrition.status.includes('Obesitas')) {
                            const diffDays = Math.floor((new Date().getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24));
                            alertList.push({
                                id: child.id,
                                name: child.name,
                                age: `${ageInMonths} Bulan`,
                                status: nutrition.status,
                                parent: parentsMap.get(child.userId) || 'Unknown',
                                days: diffDays
                            });
                        }
                    }
                });

                setStats({
                    totalChildren: children.length,
                    totalParents: parentsSnap.size,
                    totalArticles: articlesSnap.size,
                    goodNutritionPercentage: children.length > 0 ? Math.round((goodCount / children.length) * 100) : 0,
                });
                setAlerts(alertList);

            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { loading, stats, alerts };
}