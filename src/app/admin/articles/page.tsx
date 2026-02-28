'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useArticles } from '@/hooks/useArticles'

export default function AdminArticlesPage() {
    const router = useRouter()
    const { articles, loading, deleteArticle } = useArticles()
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter
            const matchesStatus = statusFilter === 'all' || article.status === statusFilter
            return matchesSearch && matchesCategory && matchesStatus
        })
    }, [articles, search, categoryFilter, statusFilter])

    const handleDelete = async (id: string) => {
        if (confirm('Yakin ingin menghapus artikel ini?')) {
            await deleteArticle(id)
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kelola Artikel</h1>
                    <p className="text-gray-600 mt-2">Buat dan kelola artikel edukasi kesehatan</p>
                </div>
                <Button onClick={() => router.push('/admin/articles/new')}>
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
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 outline-none"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="Nutrisi">Nutrisi</option>
                        <option value="Imunisasi">Imunisasi</option>
                        <option value="Edukasi">Edukasi</option>
                        <option value="Resep">Resep</option>
                        <option value="Parenting">Parenting</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-purple-400 outline-none"
                    >
                        <option value="all">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
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
                            {filteredArticles.map((article) => (
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
                                    <td className="p-4 text-gray-600">
                                        {article.createdAt?.toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => router.push(`/admin/articles/edit/${article.id}`)}
                                                className="text-blue-500 hover:text-blue-700 transition"
                                                title="Edit"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                className="text-green-500 hover:text-green-700 transition"
                                                title="Preview"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="text-red-500 hover:text-red-700 transition"
                                                title="Delete"
                                            >
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
                        Menampilkan 1-{filteredArticles.length} dari {articles.length} artikel
                    </div>
                    {/* Sederhanakan dulu tanpa pagination kompleks */}
                </div>
            </Card>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-gray-800">{articles.length}</div>
                    <div className="text-sm text-gray-600">Total Artikel</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-emerald-600">
                        {articles.filter(a => a.status === 'published').length}
                    </div>
                    <div className="text-sm text-gray-600">Published</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-amber-600">
                        {articles.filter(a => a.status === 'draft').length}
                    </div>
                    <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                        {articles.reduce((acc, a) => acc + a.views, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Views</div>
                </div>
            </div>
        </div>
    )
}