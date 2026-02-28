'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch, FaBookmark, FaClock, FaFilter } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { usePublishedArticles } from '@/hooks/usePublishedArticles'

export default function ArticlesPage() {
    const router = useRouter()
    const { articles, loading } = usePublishedArticles()
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Semua')
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

    // Kategori unik dari artikel
    const categories = ['Semua', ...Array.from(new Set(articles.map(a => a.category)))]

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
                (article.content?.toLowerCase() || '').includes(search.toLowerCase())
            const matchesCategory = selectedCategory === 'Semua' || article.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [articles, search, selectedCategory])

    const toggleBookmark = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setBookmarked(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Artikel Kesehatan</h1>
                <p className="text-gray-600">Edukasi dari tenaga kesehatan puskesmas</p>
            </div>

            {/* SEARCH */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari artikel..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-full focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* CATEGORIES */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <FaFilter className="text-gray-400" />
                <div className="flex gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${selectedCategory === cat
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ARTICLES LIST */}
            <div className="grid gap-4">
                {filteredArticles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Tidak ada artikel yang ditemukan.
                    </div>
                ) : (
                    filteredArticles.map(article => {
                        const readTime = Math.ceil((article.content?.length || 0) / 1000) || 3
                        return (
                            <Card
                                key={article.id}
                                className="hover:border-pink-300 transition"
                                onClick={() => router.push(`/parent/articles/${article.id}`)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                                                {article.category}
                                            </span>
                                            {article.publishedAt && new Date().getTime() - article.publishedAt.getTime() < 7 * 24 * 60 * 60 * 1000 && (
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-pink-100 text-pink-600 rounded-md">
                                                    Baru
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{article.title}</h3>

                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FaClock size={12} className="text-gray-400" />
                                                {readTime} menit baca
                                            </span>
                                            <span className="text-pink-500 font-bold hover:underline">
                                                Baca Selengkapnya →
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => toggleBookmark(article.id, e)}
                                        className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                                    >
                                        <FaBookmark className={bookmarked.has(article.id) ? 'text-pink-500' : ''} />
                                    </button>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* BOOKMARK SECTION */}
            {bookmarked.size > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 mt-6 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                <FaBookmark className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Artikel Tersimpan</h3>
                                <p className="text-xs text-gray-600">Kamu punya {bookmarked.size} artikel favorit</p>
                            </div>
                        </div>
                        <button
                            onClick={() => alert('Fitur lihat semua bookmark akan segera hadir!')}
                            className="bg-white px-4 py-2 rounded-full text-blue-600 text-xs font-bold shadow-sm hover:bg-blue-50 transition"
                        >
                            LIHAT SEMUA
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}