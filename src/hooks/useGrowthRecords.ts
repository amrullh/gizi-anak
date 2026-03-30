'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { GrowthRecord } from '@/types/growth';
import { calculateNutritionalStatus, calculateDetailedAge } from '@/utils/nutrition';

export function useGrowthRecords(childId?: string) {
    const [records, setRecords] = useState<GrowthRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRecords = async () => {
        if (!childId) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'growthRecords'),
                where('childId', '==', childId),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
            })) as GrowthRecord[];
            setRecords(data);
        } catch (error) {
            console.error("Error fetch records:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [childId]);

    const addRecord = async (recordData: Omit<GrowthRecord, 'id' | 'createdAt' | 'nutritionalStatus'>) => {
        try {
            // 1. Ambil data anak untuk dapetin gender & birthDate asli
            const childRef = doc(db, 'children', recordData.childId);
            const childSnap = await getDoc(childRef);

            if (!childSnap.exists()) throw new Error("Data anak tidak ditemukan");
            const child = childSnap.data();

            // 2. Hitung umur detail pakai utilitas baru (akurat sampai hari)
            const birthDate = child.birthDate.toDate();
            const recordDate = new Date(recordData.date);
            const ageData = calculateDetailedAge(birthDate, recordDate);

            // 3. Hitung status gizi (Wasting) dan status Stunting pakai standar WHO
            const result = calculateNutritionalStatus(
                ageData.totalMonths,
                child.gender as 'male' | 'female',
                recordData.weight,
                recordData.height
            );

            // 4. Simpan ke Firestore
            // Gue tambahin field stuntingStatus biar kedepannya gampang narik datanya
            await addDoc(collection(db, 'growthRecords'), {
                ...recordData,
                nutritionalStatus: result.nutrition.status, // Contoh: "Gizi Baik (Normal)"
                stuntingStatus: result.stunting.status,      // Contoh: "Sangat Pendek (Severely Stunted)"
                zScoreBmi: result.zBmi,                     // Simpan nilai Z-Score buat audit medis
                zScoreHeight: result.zHeight,
                createdAt: serverTimestamp(),
            });

            await fetchRecords(); // Refresh daftar record biar UI update
        } catch (error) {
            console.error("Error adding growth record:", error);
            throw error;
        }
    };

    return {
        records,
        loading,
        addRecord,
        refresh: fetchRecords
    };
}