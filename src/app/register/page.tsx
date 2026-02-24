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
        role: 'parent'
    })
    const [error, setError] = useState('')
    const { register } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await register(form.email, form.password, form.name, form.role)
            router.push('/login?registered=true')
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Daftar Akun Baru</h1>
                    <p className="text-gray-600 mt-2">Mulai perjalanan kesehatan si kecil</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Nama lengkap"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Daftar sebagai</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'parent' })}
                                    className={`p-4 rounded-lg border-2 transition ${form.role === 'parent'
                                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="font-semibold">👨‍👩‍👧 Orang Tua</div>
                                    <div className="text-xs mt-1">Pantau anak</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'admin' })}
                                    className={`p-4 rounded-lg border-2 transition ${form.role === 'admin'
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="font-semibold">🏥 Admin</div>
                                    <div className="text-xs mt-1">Puskesmas</div>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-pink-500 rounded" required />
                            <label className="ml-2 text-sm text-gray-600">
                                Saya menyetujui{' '}
                                <Link href="#" className="text-pink-500 hover:underline">
                                    Syarat & Ketentuan
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition font-medium"
                        >
                            Daftar Sekarang
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-pink-500 font-semibold hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}