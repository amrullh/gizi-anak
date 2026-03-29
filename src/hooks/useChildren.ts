'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { useAuth } from '@/context/AuthContext';

export function useChildren(targetUserId?: string) {
    const { user } = useAuth();
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    // Tentukan UID target (Admin input untuk orang lain atau Parent input sendiri)
    const effectiveUserId = targetUserId || user?.uid;

    const fetchChildren = useCallback(async () => {
        if (!effectiveUserId) {
            setChildren([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'children'),
                where('userId', '==', effectiveUserId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const childrenData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                birthDate: doc.data().birthDate?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            })) as Child[];
            setChildren(childrenData);
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoading(false);
        }
    }, [effectiveUserId]);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    const addChild = async (childData: Omit<Child, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!effectiveUserId) throw new Error('User ID tidak ditemukan');

        await addDoc(collection(db, 'children'), {
            ...childData,
            userId: effectiveUserId, // Anak didaftarkan atas nama Parent terkait
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        await fetchChildren(); // Refresh daftar anak
    };

    const updateChild = async (childId: string, updates: Partial<Child>) => {
        const childRef = doc(db, 'children', childId);
        await updateDoc(childRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        await fetchChildren();
    };

    const deleteChild = async (childId: string) => {
        await deleteDoc(doc(db, 'children', childId));
        setChildren(prev => prev.filter(c => c.id !== childId));
    };

    return { children, loading, addChild, updateChild, deleteChild, refresh: fetchChildren };
}