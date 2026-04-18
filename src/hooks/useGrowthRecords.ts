'use client';

import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    orderBy,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';
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
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    ...d,
                    // Memastikan date diconvert dari Firestore Timestamp ke JS Date
                    date: d.date?.toDate ? d.date.toDate() : new Date(d.date),
                };
            }) as GrowthRecord[];
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
        setLoading(true);
        try {
            // 1. Ambil data dasar anak untuk mendapatkan gender & birthDate
            const childRef = doc(db, 'children', recordData.childId);
            const childSnap = await getDoc(childRef);

            if (!childSnap.exists()) throw new Error("Data anak tidak ditemukan");
            const child = childSnap.data();

            // 2. Hitung umur detail untuk menentukan metode pengukuran
            const birthDate = child.birthDate.toDate();
            const recordDate = new Date(recordData.date);
            const ageData = calculateDetailedAge(birthDate, recordDate);

            // Tentukan metode: < 24 bulan wajib baring, >= 24 bulan wajib berdiri
            const method = ageData.totalMonths < 24 ? 'baring' : 'berdiri';

            // 3. Hitung status gizi (Wasting, Stunting, Underweight)
            // FIXED: Menambahkan argumen ke-5 (method) dan menyesuaikan gender casting
            const result = calculateNutritionalStatus(
                ageData.totalMonths,
                child.gender as 'male' | 'female',
                recordData.weight,
                recordData.height,
                method
            );

            // 4. Simpan ke Firestore dengan field yang sinkron dengan utils
            await addDoc(collection(db, 'growthRecords'), {
                ...recordData,
                date: recordDate,
                // Menggunakan property sesuai return dari utils/nutrition.ts
                nutritionalStatus: result.weightStatus.status, // BB/U
                stuntingStatus: result.heightStatus.status,    // TB/U
                wastingStatus: result.whStatus.status,         // BB/TB

                // Menyimpan Z-Score (string dari .toFixed(2))
                zScoreWeight: result.zWeightForAge,
                zScoreHeight: result.zHeightForAge,
                zScoreWasting: result.zWeightForHeight,

                // Flag boolean untuk filter cepat
                isStunted: result.isStunted,
                isWasted: result.isWasted,

                measurementMethod: method,
                createdAt: serverTimestamp(),
            });

            await fetchRecords(); // Refresh data setelah simpan
        } catch (error) {
            console.error("Error adding growth record:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        records,
        loading,
        addRecord,
        refresh: fetchRecords
    };
}