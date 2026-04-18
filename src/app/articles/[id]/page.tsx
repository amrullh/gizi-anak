'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Card from '@/components/ui/Card';
import { FaArrowLeft, FaClock, FaEye } from 'react-icons/fa';
import parse, {
    domToReact,
    HTMLReactParserOptions,
    Element,
    Text,
} from 'html-react-parser';

export default function ArticleDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                if (!id) return;

                const docRef = doc(db, 'articles', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArticle({ id: docSnap.id, ...docSnap.data() });
                    await updateDoc(docRef, { views: increment(1) });
                } else {
                    router.push('/parent/articles');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, router]);



    const youtubeRegex =
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const parserOptions: HTMLReactParserOptions = {
        replace: (domNode) => {

            // ✅ HANDLE IFRAME DARI QUILL
            if (domNode instanceof Element && domNode.name === 'iframe') {
                const src = domNode.attribs?.src || '';

                if (src.includes('youtube')) {
                    return (
                        <div className="my-6">
                            <iframe
                                src={src}
                                title="YouTube video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full aspect-video rounded-xl shadow-md"
                            />
                        </div>
                    );
                }
            }

            // ✅ HANDLE <p> YANG BERISI LINK YOUTUBE
            if (domNode instanceof Element && domNode.name === 'p') {

                const textContent = domNode.children
                    ?.map((child: any) =>
                        child.type === 'text'
                            ? child.data
                            : child.type === 'tag' && child.name === 'a'
                                ? child.children?.[0]?.data
                                : ''
                    )
                    .join('')
                    .trim();

                const match = textContent.match(youtubeRegex);

                if (match) {
                    const videoId = match[1];

                    // ⛔ RETURN LANGSUNG DIV (BUKAN DI DALAM P)
                    return (
                        <div className="my-6">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full aspect-video rounded-xl shadow-md"
                            />
                        </div>
                    );
                }

                // kalau bukan youtube → render normal p
                return (
                    <p className="mb-4 leading-relaxed text-gray-700">
                        {domToReact(domNode.children as any, parserOptions)}
                    </p>
                );
            }

            return undefined;
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="min-h-screen bg-white sm:bg-gray-50 pb-20">

            {/* AppBar */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-4 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-gray-600 hover:text-pink-500 transition-colors"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-gray-800 line-clamp-1">
                    Detail Artikel
                </h2>
            </div>

            <div className="max-w-3xl mx-auto sm:p-4">
                <Card className="rounded-none sm:rounded-3xl p-6 border-none sm:border shadow-none sm:shadow-sm">

                    {/* Badge */}
                    <div className="flex gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                            {article.category}
                        </span>
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-[10px] font-bold uppercase">
                            {article.status}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {article.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400 mb-8">
                        <span className="flex items-center gap-1">
                            <FaClock size={12} />
                            {article.createdAt?.toDate
                                ? article.createdAt
                                    .toDate()
                                    .toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                : 'Baru saja'}
                        </span>

                        <span className="flex items-center gap-1">
                            <FaEye size={12} />
                            {article.views || 0} tayangan
                        </span>
                    </div>

                    {/* Content */}
                    <div className="article-content prose max-w-none">
                        {parse(article.content || '', parserOptions)}
                    </div>

                </Card>
            </div>
        </div>
    );
}