'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';

export interface AdminStats {
    totalChildren: number;
    totalParents: number;
    totalArticles: number;
    goodNutrition: number;
    warningNutrition: number;
    badNutrition: number;
    childrenByRegion: { region: string; count: number }[];
}

export function useAdminStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || user.role !== 'admin') return;

            try {

                const childrenSnap = await getDocs(collection(db, 'children'));
                const children = childrenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));


                const parentsQuery = query(collection(db, 'users'), where('role', '==', 'parent'));
                const parentsSnap = await getDocs(parentsQuery);
                const parents = parentsSnap.docs.length;


                const articlesSnap = await getDocs(collection(db, 'articles'));
                const articles = articlesSnap.docs.length;



                let good = 0, warning = 0, bad = 0;

                const growthSnap = await getDocs(collection(db, 'growthRecords'));
                const growthRecords = growthSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));


                const latestByChild = new Map();
                growthRecords.forEach((record: any) => {
                    const childId = record.childId;
                    const date = record.date?.toDate?.() || new Date(record.date);
                    if (!latestByChild.has(childId) || date > latestByChild.get(childId).date) {
                        latestByChild.set(childId, { date, status: record.nutritionalStatus });
                    }
                });


                latestByChild.forEach((value) => {
                    const status = value.status;
                    if (status === 'Gizi Baik' || status === 'Normal') good++;
                    else if (status === 'Gizi Kurang' || status === 'Perlu Perhatian') warning++;
                    else if (status === 'Gizi Buruk' || status === 'Buruk') bad++;
                });



                const childrenByRegion = [
                    { region: 'Kecamatan A', count: 45 },
                    { region: 'Kecamatan B', count: 38 },
                    { region: 'Kecamatan C', count: 32 },
                ];

                setStats({
                    totalChildren: children.length,
                    totalParents: parents,
                    totalArticles: articles,
                    goodNutrition: good,
                    warningNutrition: warning,
                    badNutrition: bad,
                    childrenByRegion,
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return { stats, loading };
}