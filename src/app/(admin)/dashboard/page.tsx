'use client'

import { FaUsers, FaChild, FaNewspaper, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import { FaEye, FaChartBar } from "react-icons/fa";

export default function AdminDashboard() {
    const stats = [
        { title: 'Total Anak', value: '156', change: '+5%', trend: 'up', icon: FaChild, color: 'purple' },
        { title: 'Gizi Baik', value: '89%', change: '+2%', trend: 'up', icon: FaUsers, color: 'green' },
        { title: 'Orang Tua', value: '142', change: '+4', trend: 'up', icon: FaUsers, color: 'blue' },
        { title: 'Artikel', value: '24', change: '+3', trend: 'up', icon: FaNewspaper, color: 'pink' },
    ]

    const alerts = [
        { id: 1, name: 'Ahmad Rizki', age: '1.5 tahun', status: 'Gizi Buruk', days: 2, parent: 'Ibu Siti' },
        { id: 2, name: 'Siti Nurhaliza', age: '8 bulan', status: 'Berat Kurang', days: 5, parent: 'Bapak Ahmad' },
        { id: 3, name: 'Budi Santoso', age: '2 tahun', status: 'Tinggi Kurang', days: 7, parent: 'Ibu Budi' },
    ]

    const activities = [
        { id: 1, user: 'Ibu Siti', action: 'Input data baru', time: '10 menit lalu', child: 'Ahmad Rizki' },
        { id: 2, user: 'Ibu Budi', action: 'Membaca artikel', time: '30 menit lalu', child: 'Budi Santoso' },
        { id: 3, user: 'Bapak Ahmad', action: 'Register akun', time: '1 jam lalu', child: '-' },
    ]

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard Puskesmas 🏥</h1>
                <p className="text-gray-600 mt-2">Overview monitoring gizi wilayah</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                                <stat.icon className={`text-${stat.color}-600 text-xl`} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {stat.trend === 'up' ? <FaArrowUp className="inline mr-1" size={10} /> : <FaArrowDown className="inline mr-1" size={10} />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.title}</div>
                    </Card>
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - ALERTS */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaExclamationTriangle className="text-red-500 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Perhatian Khusus</h2>
                                    <p className="text-sm text-gray-600">Anak dengan status gizi perlu perhatian</p>
                                </div>
                            </div>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                {alerts.length} Alert
                            </span>
                        </div>

                        <div className="space-y-4">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-800">{alert.name}</div>
                                            <div className="text-sm text-gray-600">{alert.age} • {alert.parent}</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                                                {alert.status}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">{alert.days} hari tanpa update</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition">
                                            Hubungi Orang Tua
                                        </button>
                                        <button className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg text-sm hover:bg-red-50 transition">
                                            Tandai Dipantau
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* ACTIVITY FEED */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                        <FaUsers className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{activity.user}</div>
                                        <div className="text-sm text-gray-600">
                                            {activity.action}
                                            {activity.child !== '-' && (
                                                <span className="text-blue-600"> • {activity.child}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">{activity.time}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN - QUICK ACTIONS */}
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-4 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition group">
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200">
                                    <FaNewspaper className="text-pink-600 text-xl" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">Buat Artikel Baru</div>
                                    <div className="text-xs text-pink-600">Edukasi kesehatan</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition group">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                                    <FaEye className="text-blue-600 text-xl" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">Monitoring Data</div>
                                    <div className="text-xs text-blue-600">Analisis wilayah</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition group">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200">
                                    <FaChartBar className="text-emerald-600 text-xl" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">Generate Laporan</div>
                                    <div className="text-xs text-emerald-600">Bulanan/tahunan</div>
                                </div>
                            </button>
                        </div>
                    </Card>

                    {/* STATISTIK WILAYAH */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistik Wilayah</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Kecamatan A</span>
                                    <span className="font-medium text-gray-800">45 anak</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Kecamatan B</span>
                                    <span className="font-medium text-gray-800">38 anak</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Kecamatan C</span>
                                    <span className="font-medium text-gray-800">32 anak</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}