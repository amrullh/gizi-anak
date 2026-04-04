'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
    const [phone, setPhone] = useState('') // Mengganti email menjadi phone
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            // Izinkan admin DAN bidan masuk ke area /admin/dashboard
            if (user.role === 'admin' || user.role === 'bidan') {
                router.push('/admin/dashboard')
            } else if (user.role === 'parent') {
                router.push('/parent/dashboard')
            }
        }
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            // Mengirim nomor HP ke fungsi login (konversi email dilakukan di AuthContext)
            await login(phone, password)
        } catch (err: any) {
            setError('Nomor WhatsApp atau password salah')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Login ke GiziAnak</h1>
                    <p className="text-gray-600 mt-2">Masuk ke dashboard Anda</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nomor WhatsApp</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                placeholder="Contoh: 08123456789"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-pink-500 rounded focus:ring-pink-500" />
                                <label className="ml-2 text-sm text-gray-600">Ingat saya</label>
                            </div>
                            <Link href="#" className="text-sm text-pink-500 hover:underline">
                                Lupa password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition font-medium shadow-sm"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-pink-500 font-semibold hover:underline">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <p className="text-sm text-gray-600 mb-3 text-center">Login Cepat (Testing):</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/parent/dashboard"
                                className="bg-pink-50 text-pink-700 p-2 rounded-lg text-center hover:bg-pink-100 text-xs font-bold"
                            >
                                👨‍👩‍👧 Orang Tua
                            </Link>
                            <Link
                                href="/admin/dashboard"
                                className="bg-purple-50 text-purple-700 p-2 rounded-lg text-center hover:bg-purple-100 text-xs font-bold"
                            >
                                🏥 Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}