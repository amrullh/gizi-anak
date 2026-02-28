'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    deleteField,
} from 'firebase/firestore';
import ArticleForm from '../../form';

export default function EditArticlePage() {
    const { id } = useParams();
    const router = useRouter();

    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const docRef = doc(db, 'articles', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArticle({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    const handleUpdate = async (data: any) => {
        setIsSubmitting(true);

        try {
            const docRef = doc(db, 'articles', id as string);

            const payload: any = {
                title: data.title,
                category: data.category,
                content: data.content,
                status: data.status,
                updatedAt: serverTimestamp(),
            };

            // 🔥 Kalau publish dan belum punya publishedAt
            if (data.status === 'published' && !article?.publishedAt) {
                payload.publishedAt = serverTimestamp();
            }

            // 🔥 Kalau diubah jadi draft → hapus publishedAt
            if (data.status === 'draft') {
                payload.publishedAt = deleteField();
            }

            await updateDoc(docRef, payload);

            router.push('/admin/articles');
        } catch (error) {
            console.error(error);
            alert('Gagal update artikel');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center animate-pulse">
                Memuat data artikel...
            </div>
        );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Artikel</h1>
            <ArticleForm
                initialData={article}
                onSave={handleUpdate}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}