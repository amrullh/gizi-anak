'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Handle login
        console.log({ email, password })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Login ke GiziAnak</h1>
                    <p className="text-gray-600 mt-2">Masuk ke dashboard Anda</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-pink-500" />
                                <label className="ml-2 text-sm">Ingat saya</label>
                            </div>
                            <Link href="#" className="text-sm text-pink-500 hover:underline">
                                Lupa password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600"
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

                    {/* Role Selector untuk testing */}
                    <div className="mt-8 pt-6 border-t">
                        <p className="text-sm text-gray-600 mb-3">Login sebagai (testing):</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/parent"
                                className="bg-pink-50 text-pink-700 p-3 rounded-lg text-center hover:bg-pink-100"
                            >
                                👨‍👩‍👧 Orang Tua
                            </Link>
                            <Link
                                href="/admin"
                                className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center hover:bg-purple-100"
                            >
                                🏥 Admin Puskesmas
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}