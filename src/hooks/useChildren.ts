'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Child } from '@/types/child';
import { useAuth } from '@/context/AuthContext';

export function useChildren() {
    const { user } = useAuth();
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setChildren([]);
            setLoading(false);
            return;
        }

        const fetchChildren = async () => {
            try {
                const q = query(
                    collection(db, 'children'),
                    where('userId', '==', user.uid),
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
        };

        fetchChildren();
    }, [user]);

    const addChild = async (childData: Omit<Child, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!user) throw new Error('User not authenticated');
        const docRef = await addDoc(collection(db, 'children'), {
            ...childData,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const newChild = {
            id: docRef.id,
            ...childData,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Child;
        setChildren(prev => [newChild, ...prev]);
        return newChild;
    };

    const updateChild = async (childId: string, updates: Partial<Child>) => {
        const childRef = doc(db, 'children', childId);
        await updateDoc(childRef, { ...updates, updatedAt: new Date() });
        setChildren(prev =>
            prev.map(c => (c.id === childId ? { ...c, ...updates, updatedAt: new Date() } : c))
        );
    };

    const deleteChild = async (childId: string) => {
        await deleteDoc(doc(db, 'children', childId));
        setChildren(prev => prev.filter(c => c.id !== childId));
    };

    return { children, loading, addChild, updateChild, deleteChild };
}