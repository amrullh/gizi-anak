'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
// Import CSS dari react-quill-new
import 'react-quill-new/dist/quill.snow.css';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Menggunakan dynamic import untuk kompatibilitas React 19 dan Next.js
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-xl border border-gray-200" />
});

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'video'],
        ['clean'],
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link', 'video',
];

interface ArticleFormProps {
    initialData?: {
        id: string;
        title: string;
        category: string;
        status: 'draft' | 'published';
        content: string;
    };
    onSave: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function ArticleForm({ initialData, onSave, isSubmitting }: ArticleFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [category, setCategory] = useState(initialData?.category || 'Nutrisi');
    const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
    const [content, setContent] = useState(initialData?.content || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Judul dan konten wajib diisi');
            return;
        }
        await onSave({ title, category, status, content });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Judul Artikel *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            placeholder="Masukkan judul artikel"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Kategori *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-pink-400 outline-none transition-all cursor-pointer"
                                required
                            >
                                <option value="Nutrisi">Nutrisi</option>
                                <option value="Imunisasi">Imunisasi</option>
                                <option value="Edukasi">Edukasi</option>
                                <option value="Resep">Resep</option>
                                <option value="Parenting">Parenting</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="draft"
                                        checked={status === 'draft'}
                                        onChange={() => setStatus('draft')}
                                        className="mr-2 w-4 h-4 accent-pink-500"
                                    />
                                    <span className="text-sm">Draft</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="published"
                                        checked={status === 'published'}
                                        onChange={() => setStatus('published')}
                                        className="mr-2 w-4 h-4 accent-pink-500"
                                    />
                                    <span className="text-sm">Published</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Konten *</label>
                        <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                placeholder="Tulis artikel di sini..."
                                style={{ height: '400px', marginBottom: '45px' }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={isSubmitting}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Menyimpan...' : initialData ? 'Update Artikel' : 'Publikasikan'}
                </Button>
            </div>
        </form>
    );
}