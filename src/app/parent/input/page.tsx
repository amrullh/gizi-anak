'use client'

import { useState } from 'react'
import { FaChild, FaWeight, FaRulerVertical, FaCalendarAlt, FaPlus, FaEdit } from 'react-icons/fa'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useChildren } from '@/hooks/useChildren'

type TabType = 'addChild' | 'inputData' | 'updateData'

export default function InputPage() {
    const [activeTab, setActiveTab] = useState<TabType>('addChild')
    const { children, loading, addChild } = useChildren()

    // State untuk form tambah anak
    const [childForm, setChildForm] = useState({
        name: '',
        birthDate: '',
        gender: 'male',
        birthWeight: '',
        birthHeight: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChildFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setChildForm(prev => ({ ...prev, [name]: value }))
    }

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await addChild({
                name: childForm.name,
                birthDate: new Date(childForm.birthDate),
                gender: childForm.gender as 'male' | 'female',
                birthWeight: childForm.birthWeight ? parseFloat(childForm.birthWeight) : undefined,
                birthHeight: childForm.birthHeight ? parseFloat(childForm.birthHeight) : undefined,
            })
            // Reset form setelah sukses
            setChildForm({
                name: '',
                birthDate: '',
                gender: 'male',
                birthWeight: '',
                birthHeight: ''
            })
            alert('Data anak berhasil ditambahkan!')
        } catch (error) {
            console.error(error)
            alert('Gagal menambahkan data anak')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ... (kode selanjutnya akan sama, hanya bagian yang berubah ditambahkan)
    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Data</h1>
                <p className="text-gray-600">Tambah anak atau input data perkembangan</p>
            </div>

            {/* TABS */}
            <div className="bg-white p-1 rounded-2xl border border-gray-200 flex">
                <button
                    onClick={() => setActiveTab('addChild')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'addChild'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaChild className="inline mr-2" />
                    Tambah Anak
                </button>
                <button
                    onClick={() => setActiveTab('inputData')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'inputData'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaPlus className="inline mr-2" />
                    Input Data
                </button>
                <button
                    onClick={() => setActiveTab('updateData')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'updateData'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaEdit className="inline mr-2" />
                    Update Data
                </button>
            </div>

            {/* CONTENT */}
            <Card>
                {activeTab === 'addChild' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-800">Tambah Data Anak</h2>
                        <form onSubmit={handleAddChild} className="space-y-4">
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

                            <button type="submit" disabled={isSubmitting} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Data Anak'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Bagian Input Data Perkembangan (sama seperti commit 2, hanya perlu penambahan state selectedChildId nanti) */}
                {activeTab === 'inputData' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-800">Input Data Perkembangan</h2>

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
                                            <input type="radio" name="child" value={child.id} className="mr-4" />
                                            <div>
                                                <div className="font-medium text-gray-800">{child.name}</div>
                                                <div className="text-sm text-gray-600">{child.age}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <FaCalendarAlt className="inline mr-2" /> Tanggal
                                </label>
                                <input type="date" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <FaWeight className="inline mr-2" /> Berat (kg)
                                </label>
                                <input type="number" step="0.1" placeholder="11.5" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <FaRulerVertical className="inline mr-2" /> Tinggi (cm)
                                </label>
                                <input type="number" placeholder="80" className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Catatan</label>
                            <textarea
                                rows={3}
                                placeholder="Contoh: Sedang batuk pilek, nafsu makan menurun"
                                className="input-field"
                            ></textarea>
                        </div>

                        <Button fullWidth>Simpan Pengukuran</Button>
                    </div>
                )}

                {activeTab === 'updateData' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-800">Update Data Anak</h2>

                        <div>
                            <label className="block text-sm font-medium mb-3">Pilih Anak</label>
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Memuat data anak...</div>
                            ) : children.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    Belum ada data anak.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {children.map(child => (
                                        <label key={child.id} className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                            <input type="radio" name="childUpdate" value={child.id} className="mr-4" />
                                            <div>
                                                <div className="font-medium text-gray-800">{child.name}</div>
                                                <div className="text-sm text-gray-600">{child.age}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Akan diisi dengan riwayat pengukuran di commit 5 */}
                            {[1, 2, 3].map(item => (
                                <div key={item} className="border rounded-xl p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-gray-800">Data {item}</div>
                                            <div className="text-sm text-gray-600">Budi Santoso • 15 Jan 2024</div>
                                        </div>
                                        <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
                                            Edit
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs text-gray-500">Berat Badan</div>
                                            <div className="font-semibold">11.5 kg</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs text-gray-500">Tinggi Badan</div>
                                            <div className="font-semibold">80 cm</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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