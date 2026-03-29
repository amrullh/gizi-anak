'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        // Role dikunci secara default sebagai 'parent'
        role: 'parent'
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { register } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            // Mengirim data form termasuk role 'parent' yang sudah di-set di awal
            await register(form.email, form.password, form.name, form.role)
            router.push('/login?registered=true')
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat mendaftar')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Daftar Akun Baru</h1>
                    <p className="text-gray-600 mt-2">Mulai perjalanan kesehatan si kecil bersama kami</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                                    required
                                />
                            </div>
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                Saya menyetujui{' '}
                                <Link href="/terms" className="text-pink-500 hover:underline font-medium">
                                    Syarat & Ketentuan
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition font-semibold shadow-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-pink-500 font-bold hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}