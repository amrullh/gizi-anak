'use client'

import { useState } from 'react'
import { FaSearch, FaBookmark, FaClock, FaFilter } from 'react-icons/fa'
import Card from '@/components/ui/Card'

export default function ArticlesPage() {
    const [search, setSearch] = useState('')

    const articles = [
        {
            id: 1,
            title: 'MPASI untuk Bayi 6-8 Bulan',
            category: 'Nutrisi',
            readTime: '5 menit',
            excerpt: 'Panduan lengkap makanan pendamping ASI untuk bayi usia 6-8 bulan...',
            isNew: true,
            isBookmarked: true
        },
        {
            id: 2,
            title: 'Jadwal Imunisasi Dasar Lengkap',
            category: 'Imunisasi',
            readTime: '3 menit',
            excerpt: 'Imunisasi apa saja yang wajib diberikan pada tahun pertama?',
            isNew: false,
            isBookmarked: false
        },
        {
            id: 3,
            title: 'Cegah Stunting Sejak Dini',
            category: 'Edukasi',
            readTime: '7 menit',
            excerpt: 'Kenali tanda-tanda stunting dan cara pencegahannya...',
            isNew: true,
            isBookmarked: true
        },
        {
            id: 4,
            title: 'Resep MPASI Bergizi',
            category: 'Resep',
            readTime: '4 menit',
            excerpt: '5 resep MPASI mudah dan bergizi untuk si kecil',
            isNew: false,
            isBookmarked: false
        }
    ]

    const categories = ['Semua', 'Nutrisi', 'Imunisasi', 'Edukasi', 'Resep', 'Parenting']

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
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${i === 0
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
            <div className="space-y-4">
                {articles.map(article => (
                    <Card key={article.id} className="hover:border-pink-300 transition cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                        {article.category}
                                    </span>
                                    {article.isNew && (
                                        <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                                            Baru
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">{article.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                            </div>
                            <button className="text-gray-400 hover:text-pink-500">
                                <FaBookmark className={article.isBookmarked ? 'text-pink-500' : ''} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FaClock size={14} />
                                <span>{article.readTime}</span>
                            </div>
                            <button className="text-pink-500 text-sm font-medium">
                                Baca Selengkapnya →
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* BOOKMARK SECTION */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaBookmark className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Artikel Tersimpan</h3>
                        <p className="text-sm text-gray-600">Kamu punya 2 artikel tersimpan</p>
                    </div>
                </div>
                <button className="text-blue-600 text-sm font-medium">
                    Lihat Semua →
                </button>
            </div>
        </div>
    )
}