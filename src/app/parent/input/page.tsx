'use client'

import { useState } from 'react'
import { FaChild, FaWeight, FaRulerVertical, FaCalendarAlt, FaPlus, FaEdit, FaHistory } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useChildren } from '@/hooks/useChildren'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'

type TabType = 'addChild' | 'growthRecords'

export default function InputPage() {
    const [activeTab, setActiveTab] = useState<TabType>('addChild')
    const { children, loading, addChild } = useChildren()

    // State untuk form tambah anak + pengukuran pertama
    const [childForm, setChildForm] = useState({
        name: '',
        birthDate: '',
        gender: 'male',
        birthWeight: '',
        birthHeight: '',
        // pengukuran pertama
        measurementDate: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        notes: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // State untuk tab catatan pertumbuhan
    const [selectedChildId, setSelectedChildId] = useState<string>('')
    const { records: growthRecords, loading: recordsLoading, addRecord } = useGrowthRecords(selectedChildId)
    const [growthForm, setGrowthForm] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        notes: ''
    })
    const [isSubmittingGrowth, setIsSubmittingGrowth] = useState(false)

    const handleChildFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setChildForm(prev => ({ ...prev, [name]: value }))
    }

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            // 1. Buat child
            const newChild = await addChild({
                name: childForm.name,
                birthDate: new Date(childForm.birthDate),
                gender: childForm.gender as 'male' | 'female',
                birthWeight: childForm.birthWeight ? parseFloat(childForm.birthWeight) : undefined,
                birthHeight: childForm.birthHeight ? parseFloat(childForm.birthHeight) : undefined,
            })

            // 2. Jika ada data pengukuran pertama, buat growth record
            if (childForm.weight && childForm.height) {
                await addRecord({
                    childId: newChild.id,
                    date: new Date(childForm.measurementDate),
                    weight: parseFloat(childForm.weight),
                    height: parseFloat(childForm.height),
                    notes: childForm.notes || undefined,
                })
            }

            // Reset form
            setChildForm({
                name: '',
                birthDate: '',
                gender: 'male',
                birthWeight: '',
                birthHeight: '',
                measurementDate: new Date().toISOString().split('T')[0],
                weight: '',
                height: '',
                notes: ''
            })

            alert('Data anak dan pengukuran pertama berhasil disimpan!')
        } catch (error) {
            console.error(error)
            alert('Gagal menyimpan data')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGrowthFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setGrowthForm(prev => ({ ...prev, [name]: value }))
    }

    const handleAddGrowthRecord = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedChildId) {
            alert('Pilih anak terlebih dahulu')
            return
        }
        setIsSubmittingGrowth(true)
        try {
            await addRecord({
                childId: selectedChildId,
                date: new Date(growthForm.date),
                weight: parseFloat(growthForm.weight),
                height: parseFloat(growthForm.height),
                notes: growthForm.notes || undefined,
            })
            setGrowthForm({
                date: new Date().toISOString().split('T')[0],
                weight: '',
                height: '',
                notes: ''
            })
            alert('Data pengukuran berhasil ditambahkan!')
        } catch (error) {
            console.error(error)
            alert('Gagal menambahkan data pengukuran')
        } finally {
            setIsSubmittingGrowth(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Data Anak</h1>
                <p className="text-gray-600">Tambah anak atau catat pertumbuhannya</p>
            </div>

            {/* TABS */}
            <div className="bg-white p-1 rounded-2xl border border-gray-200 flex">
                <button
                    onClick={() => setActiveTab('addChild')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${activeTab ===   'addChild'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaChild className="inline mr-2" />
                    Tambah Anak
                </button>
                <button
                    onClick={() => setActiveTab('growthRecords')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'growthRecords'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaHistory className="inline mr-2" />
                    Catatan Pertumbuhan
                </button>
            </div>

            {/* CONTENT */}
            <Card>
                {activeTab === 'addChild' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-800">Tambah Anak Baru</h2>
                        <form onSubmit={handleAddChild} className="space-y-4">
                            {/* Data Anak */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Nama Lengkap Anak</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={childForm.name}
                                    onChange={handleChildFormChange}
                                    placeholder="Contoh: Budi Santoso"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={childForm.birthDate}
                                        onChange={handleChildFormChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Jenis Kelamin</label>
                                    <select
                                        name="gender"
                                        value={childForm.gender}
                                        onChange={handleChildFormChange}
                                        className="input-field"
                                    >
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center">
                                        <FaWeight className="mr-2 text-gray-500" /> Berat Lahir (kg) <span className="text-xs text-gray-400 ml-1">(opsional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="birthWeight"
                                        value={childForm.birthWeight}
                                        onChange={handleChildFormChange}
                                        step="0.1"
                                        placeholder="3.2"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center">
                                        <FaRulerVertical className="mr-2 text-gray-500" /> Tinggi Lahir (cm) <span className="text-xs text-gray-400 ml-1">(opsional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="birthHeight"
                                        value={childForm.birthHeight}
                                        onChange={handleChildFormChange}
                                        placeholder="48"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Pengukuran Pertama */}
                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-medium text-gray-700 mb-3">Pengukuran Pertama (opsional)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <FaCalendarAlt className="inline mr-2" /> Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            name="measurementDate"
                                            value={childForm.measurementDate}
                                            onChange={handleChildFormChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <FaWeight className="inline mr-2" /> Berat (kg)
                                        </label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={childForm.weight}
                                            onChange={handleChildFormChange}
                                            step="0.1"
                                            placeholder="11.5"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <FaRulerVertical className="inline mr-2" /> Tinggi (cm)
                                        </label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={childForm.height}
                                            onChange={handleChildFormChange}
                                            placeholder="80"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm font-medium mb-2">Catatan</label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        value={childForm.notes}
                                        onChange={handleChildFormChange}
                                        placeholder="Contoh: Kondisi saat pengukuran pertama"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Data Anak'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'growthRecords' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-800">Catatan Pertumbuhan</h2>

                        {/* Pilih Anak */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Pilih Anak</label>
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Memuat data anak...</div>
                            ) : children.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    Belum ada data anak. Silakan tambah anak terlebih dahulu.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {children.map(child => (
                                        <label key={child.id} className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="childGrowth"
                                                value={child.id}
                                                checked={selectedChildId === child.id}
                                                onChange={(e) => setSelectedChildId(e.target.value)}
                                                className="mr-4"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-800">{child.name}</div>
                                                <div className="text-sm text-gray-600">{child.age}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedChildId && (
                            <>
                                {/* Form Tambah Pengukuran Baru */}
                                <div className="border-t pt-4">
                                    <h3 className="font-medium text-gray-700 mb-3">Tambah Pengukuran Baru</h3>
                                    <form onSubmit={handleAddGrowthRecord} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    <FaCalendarAlt className="inline mr-2" /> Tanggal
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={growthForm.date}
                                                    onChange={handleGrowthFormChange}
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    <FaWeight className="inline mr-2" /> Berat (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    value={growthForm.weight}
                                                    onChange={handleGrowthFormChange}
                                                    step="0.1"
                                                    placeholder="11.5"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    <FaRulerVertical className="inline mr-2" /> Tinggi (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="height"
                                                    value={growthForm.height}
                                                    onChange={handleGrowthFormChange}
                                                    placeholder="80"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Catatan</label>
                                            <textarea
                                                name="notes"
                                                rows={2}
                                                value={growthForm.notes}
                                                onChange={handleGrowthFormChange}
                                                placeholder="Contoh: Sedang batuk pilek"
                                                className="input-field"
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmittingGrowth}>
                                            {isSubmittingGrowth ? 'Menyimpan...' : 'Tambah Pengukuran'}
                                        </button>
                                    </form>
                                </div>

                                {/* Riwayat Pengukuran */}
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-medium text-gray-700 mb-3">Riwayat Pengukuran</h3>
                                    {recordsLoading ? (
                                        <div className="text-center py-4 text-gray-500">Memuat riwayat...</div>
                                    ) : growthRecords.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            Belum ada data pengukuran.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {growthRecords.map(record => (
                                                <div key={record.id} className="border rounded-xl p-4 hover:bg-gray-50">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium text-gray-800">
                                                                {record.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                Berat: {record.weight} kg • Tinggi: {record.height} cm
                                                            </div>
                                                            {record.notes && (
                                                                <div className="text-xs text-gray-500 mt-2 italic">
                                                                    "{record.notes}"
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button className="text-blue-500 text-sm hover:text-blue-600">
                                                                Edit
                                                            </button>
                                                            <button className="text-red-500 text-sm hover:text-red-600">
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Card>

            {/* TIPS */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="text-2xl mr-2">💡</span> Tips Pengukuran
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        Ukur berat badan di pagi hari sebelum makan
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        Gunakan alat ukur yang sama setiap kali
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        Input data rutin setiap 2-4 minggu
                    </li>
                </ul>
            </div>
        </div>
    )
}