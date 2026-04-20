'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FaEye, FaEyeSlash, FaWhatsapp, FaLock } from 'react-icons/fa'

export default function LoginPage() {
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            const role = user.role as any;
            // Admin, Admin Puskesmas, dan Bidan diarahkan ke area Admin
            if (role === 'admin' || role === 'admin_puskesmas' || role === 'bidan') {
                router.push('/admin/dashboard')
            } else if (role === 'parent') {
                router.push('/parent/dashboard')
            }
        }
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(phone, password)
            // Logika rememberMe bisa ditambahkan di sini jika diperlukan (misal ke LocalStorage)
        } catch (err: any) {
            setError('Nomor WhatsApp atau password salah')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-pink-500 rounded-2xl shadow-lg shadow-pink-200 mb-4 rotate-3">
                        <span className="text-white text-2xl font-bold">GZ</span>
                    </div>
                    <h1 className="text-3xl font-serif italic font-bold text-gray-800">Selamat Datang</h1>
                    <p className="text-gray-500 mt-2">Silakan login ke akun GiziAnak Anda</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl shadow-pink-100/50 border border-white">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Nomor WhatsApp</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-pink-400">
                                    <FaWhatsapp />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-11 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all"
                                    placeholder="0812..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-pink-400">
                                    <FaLock />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pink-500 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center group cursor-pointer">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="peer sr-only"
                                    />
                                    <div className="h-5 w-5 border-2 border-gray-200 rounded-md bg-white peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all"></div>
                                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="ml-3 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Ingat saya</span>
                            </label>
                            <button type="button" className="text-sm text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                                Lupa Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-500 text-white p-4 rounded-2xl hover:bg-pink-600 active:scale-[0.98] transition-all font-bold shadow-lg shadow-pink-200 disabled:bg-gray-300 disabled:shadow-none mt-4"
                        >
                            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-gray-400 text-sm">
                    &copy; 2026 GiziAnak. All rights reserved.
                </p>
            </div>
        </div>
    )
}