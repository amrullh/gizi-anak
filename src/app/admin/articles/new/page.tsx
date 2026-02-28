'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ArticleForm from '../form';

export default function NewArticlePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async (data: any) => {
        setIsSubmitting(true);

        try {
            const payload: any = {
                title: data.title,
                category: data.category,
                content: data.content,
                status: data.status,
                views: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // 🔥 Kalau langsung publish
            if (data.status === 'published') {
                payload.publishedAt = serverTimestamp();
            }

            await addDoc(collection(db, 'articles'), payload);

            router.push('/admin/articles');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan artikel');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">
                Buat Artikel Edukasi Baru
            </h1>
            <ArticleForm onSave={handleSave} isSubmitting={isSubmitting} />
        </div>
    );
}