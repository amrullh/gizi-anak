'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { PregnancyData } from '@/types/pregnancy';
import { useAuth } from '@/context/AuthContext';

export function usePregnancy() {
    const { user } = useAuth();
    const [pregnancy, setPregnancy] = useState<PregnancyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setPregnancy(null);
            setLoading(false);
            return;
        }

        const fetchPregnancy = async () => {
            try {
                const q = query(
                    collection(db, 'pregnancies'),
                    where('userId', '==', user.uid)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const docSnap = snapshot.docs[0];
                    const data = docSnap.data();
                    setPregnancy({
                        id: docSnap.id,
                        ...data,
                        pemeriksaanTanggal: data.pemeriksaanTanggal?.toDate(),
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
        };

        fetchPregnancy();
    }, [user]);

    const savePregnancy = async (data: Omit<PregnancyData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!user) throw new Error('User not authenticated');

        if (pregnancy) {
            // Update
            const docRef = doc(db, 'pregnancies', pregnancy.id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: new Date(),
            });
            setPregnancy({
                ...pregnancy,
                ...data,
                updatedAt: new Date(),
            });
        } else {
            // Create
            const docRef = await addDoc(collection(db, 'pregnancies'), {
                ...data,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const newPregnancy = {
                id: docRef.id,
                ...data,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as PregnancyData;
            setPregnancy(newPregnancy);
        }
    };

    return { pregnancy, loading, savePregnancy };
}