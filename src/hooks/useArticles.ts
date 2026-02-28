'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Article } from '@/types/article';
import { useAuth } from '@/context/AuthContext';

export function useArticles() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const q = query(
                collection(db, 'articles'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const articlesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                publishedAt: doc.data().publishedAt?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            })) as Article[];
            setArticles(articlesData);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const addArticle = async (data: Omit<Article, 'id' | 'adminId' | 'views' | 'createdAt' | 'updatedAt'>) => {
        if (!user) throw new Error('Not authenticated');
        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const docRef = await addDoc(collection(db, 'articles'), {
            ...data,
            adminId: user.uid,
            slug,
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedAt: data.status === 'published' ? new Date() : null,
        });
        await fetchArticles();
        return docRef.id;
    };

    const updateArticle = async (id: string, data: Partial<Omit<Article, 'id' | 'adminId' | 'views' | 'createdAt' | 'updatedAt'>>) => {
        const docRef = doc(db, 'articles', id);
        const updateData: any = { ...data, updatedAt: new Date() };
        if (data.status === 'published') {
            updateData.publishedAt = new Date();
        }
        await updateDoc(docRef, updateData);
        await fetchArticles();
    };

    const deleteArticle = async (id: string) => {
        await deleteDoc(doc(db, 'articles', id));
        await fetchArticles();
    };

    return { articles, loading, addArticle, updateArticle, deleteArticle };
}