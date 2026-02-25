'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { GrowthRecord } from '@/types/growth';

export function useGrowthRecords(childId?: string) {
    const [records, setRecords] = useState<GrowthRecord[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!childId) {
            setRecords([]);
            return;
        }

        const fetchRecords = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'growthRecords'),
                    where('childId', '==', childId),
                    orderBy('date', 'desc')
                );
                const snapshot = await getDocs(q);
                const recordsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate(),
                    createdAt: doc.data().createdAt?.toDate(),
                })) as GrowthRecord[];
                setRecords(recordsData);
            } catch (error) {
                console.error('Error fetching growth records:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [childId]);

    const addRecord = async (recordData: Omit<GrowthRecord, 'id' | 'createdAt'>) => {
        const docRef = await addDoc(collection(db, 'growthRecords'), {
            ...recordData,
            createdAt: new Date(),
        });
        const newRecord = {
            id: docRef.id,
            ...recordData,
            createdAt: new Date(),
        } as GrowthRecord;
        setRecords(prev => [newRecord, ...prev]);
        return newRecord;
    };

    return { records, loading, addRecord };
}