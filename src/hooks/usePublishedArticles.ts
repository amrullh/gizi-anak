'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Article } from '@/types/article';

export function usePublishedArticles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const q = query(
                    collection(db, 'articles'),
                    where('status', '==', 'published'),
                    orderBy('publishedAt', 'desc')
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
                console.error('Error fetching published articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    return { articles, loading };
}