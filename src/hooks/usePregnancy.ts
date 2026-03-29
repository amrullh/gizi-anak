'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { PregnancyData } from '@/types/pregnancy';
import { useAuth } from '@/context/AuthContext';

export function usePregnancy(targetUserId?: string) {
    const { user } = useAuth();
    const [pregnancy, setPregnancy] = useState<PregnancyData | null>(null);
    const [loading, setLoading] = useState(true);

    // Gunakan targetUserId (Admin mode) atau user.uid (Parent mode)
    const effectiveUserId = targetUserId || user?.uid;

    const fetchPregnancy = useCallback(async () => {
        if (!effectiveUserId) {
            setPregnancy(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'pregnancies'),
                where('userId', '==', effectiveUserId)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0];
                const data = docSnap.data();
                setPregnancy({
                    id: docSnap.id,
                    ...data,
                    hpht: data.hpht?.toDate(),
                    taksiranPersalinan: data.taksiranPersalinan?.toDate(),
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                } as PregnancyData);
            } else {
                setPregnancy(null);
            }
        } catch (error) {
            console.error('Error fetching pregnancy data:', error);
        } finally {
            setLoading(false);
        }
    }, [effectiveUserId]);

    useEffect(() => {
        fetchPregnancy();
    }, [fetchPregnancy]);

    const savePregnancy = async (data: Omit<PregnancyData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!effectiveUserId) throw new Error('User ID tidak ditemukan');

        // Gunakan setDoc dengan merge agar Admin bisa mengupdate dokumen yang sama
        const docId = pregnancy?.id || `${effectiveUserId}_preg`;
        const docRef = doc(db, 'pregnancies', docId);

        const payload = {
            ...data,
            userId: effectiveUserId, // Pastikan data tetap milik Parent
            updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, payload, { merge: true });
        await fetchPregnancy(); // Refresh data setelah simpan
    };

    return { pregnancy, loading, savePregnancy, refresh: fetchPregnancy };
}