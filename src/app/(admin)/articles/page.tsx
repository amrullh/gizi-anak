'use client'

import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState([
        { id: 1, title: 'MPASI untuk Bayi 6-8 Bulan', category: 'Nutrisi', status: 'published', views: 124, date: '15 Jan 2024' },
        { id: 2, title: 'Jadwal Imunisasi Dasar Lengkap', category: 'Imunisasi', status: 'published', views: 89, date: '10 Jan 2024' },
        { id: 3, title: 'Cegah Stunting Sejak Dini', category: 'Edukasi', status: 'draft', views: 0, date: '5 Jan 2024' },
        { id: 4, title: 'Resep MPASI Bergizi', category: 'Resep', status: 'published', views: 56, date: '3 Jan 2024' },
        { id: 5, title: 'Perkembangan Motorik Anak', category: 'Parenting', status: 'draft', views: 0, date: '1 Jan 2024' },
    ])

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kelola Artikel</h1>
                    <p className="text-gray-600 mt-2">Buat dan kelola artikel edukasi kesehatan</p>
                </div>
                <Button>
                    <FaPlus className="inline mr-2" />
                    Buat Artikel Baru
                </Button>
            </div>

            {/* SEARCH & FILTER */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari artikel..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 outline-none">
                        <option>Semua Kategori</option>
                        <option>Nutrisi</option>
                        <option>Imunisasi</option>
                        <option>Edukasi</option>
                        <option>Resep</option>
                    </select>
                    <select className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 outline-none">
                        <option>Semua Status</option>
                        <option>Published</option>
                        <option>Draft</option>
                    </select>
                </div>
            </div>

            {/* ARTICLES TABLE */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Judul</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Kategori</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Views</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Tanggal</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{article.title}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                            {article.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${article.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {article.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{article.views}</td>
                                    <td className="p-4 text-gray-600">{article.date}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <button className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                                                <FaEdit size={16} />
                                            </button>
                                            <button className="text-green-500 hover:text-green-700 transition" title="Preview">
                                                <FaEye size={16} />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 transition" title="Delete">
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t">
                    <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                        Menampilkan 1-5 dari 12 artikel
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">
                            ←
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500 text-white">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">2</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">3</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50">→</button>
                    </div>
                </div>
            </Card>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-800">12</div>
                    <div className="text-sm text-gray-600">Total Artikel</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-emerald-600">9</div>
                    <div className="text-sm text-gray-600">Published</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-amber-600">3</div>
                    <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">269</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                </div>
            </div>
        </div>
    )
}