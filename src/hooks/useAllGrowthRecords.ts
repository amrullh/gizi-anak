import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { GrowthRecord } from '@/types/growth';
import { useAuth } from '@/context/AuthContext';

export function useAllGrowthRecords() {
    const { user } = useAuth();
    const [records, setRecords] = useState<GrowthRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setRecords([]);
            setLoading(false);
            return;
        }

        const fetchRecords = async () => {
            try {
                // Ambil semua anak milik user
                const childrenQuery = query(
                    collection(db, 'children'),
                    where('userId', '==', user.uid)
                );
                const childrenSnapshot = await getDocs(childrenQuery);
                const childIds = childrenSnapshot.docs.map(doc => doc.id);

                if (childIds.length === 0) {
                    setRecords([]);
                    setLoading(false);
                    return;
                }

                // Ambil semua growth records untuk anak-anak tersebut
                const recordsQuery = query(
                    collection(db, 'growthRecords'),
                    where('childId', 'in', childIds),
                    orderBy('date', 'desc')
                );
                const recordsSnapshot = await getDocs(recordsQuery);
                const recordsData = recordsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate(),
                    createdAt: doc.data().createdAt?.toDate(),
                })) as GrowthRecord[];
                setRecords(recordsData);
            } catch (error) {
                console.error('Error fetching all growth records:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [user]);

    return { records, loading };
}