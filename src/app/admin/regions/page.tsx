'use client'

import { useState, useEffect } from 'react'
// Ganti dari @/lib/firebase/config ke @/lib/firebase/client
import { db } from '@/lib/firebase/client'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FaMapMarkerAlt, FaUsers, FaUserMd, FaTrash } from 'react-icons/fa'

interface Region {
    id: string
    name: string
    totalNakes: number
    totalParents: number
}

export default function RegionsPage() {
    const [regions, setRegions] = useState<Region[]>([])
    const [newRegion, setNewRegion] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchRegionsData = async () => {
        setLoading(true)
        try {
            const regionSnap = await getDocs(collection(db, 'regions'))
            const userSnap = await getDocs(collection(db, 'users'))

            const allUsers = userSnap.docs.map(d => d.data())

            const regionsList = regionSnap.docs.map(regionDoc => {
                const regionName = regionDoc.data().name
                return {
                    id: regionDoc.id,
                    name: regionName,
                    // Hitung jumlah nakes (bidan) di wilayah ini
                    totalNakes: allUsers.filter(u => u.role === 'bidan' && u.wilayah === regionName).length,
                    // Hitung jumlah ibu (parent) di wilayah ini
                    totalParents: allUsers.filter(u => u.role === 'parent' && u.wilayah === regionName).length
                }
            })

            setRegions(regionsList)
        } catch (error) {
            console.error("Error fetching regions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchRegionsData() }, [])

    const handleAddRegion = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newRegion.trim()) return
        await addDoc(collection(db, 'regions'), { name: newRegion.trim() })
        setNewRegion('')
        fetchRegionsData()
    }

    const handleDelete = async (id: string) => {
        if (confirm('Hapus wilayah ini? Data user yang tertaut tidak akan terhapus namun wilayahnya menjadi tidak valid.')) {
            await deleteDoc(doc(db, 'regions', id))
            fetchRegionsData()
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Wilayah</h1>
                    <p className="text-pink-500 font-medium">Data Puskesmas & Sebaran Bidan</p>
                </div>

                <form onSubmit={handleAddRegion} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nama Wilayah/Posyandu..."
                        className="px-4 py-2 rounded-xl border border-pink-100 focus:ring-2 focus:ring-pink-500 outline-none"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                    />
                    <Button type="submit">Tambah</Button>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regions.map((region) => (
                        <Card key={region.id} className="p-6 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaMapMarkerAlt size={80} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-4">{region.name}</h3>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-500">
                                        <FaUserMd className="text-blue-500" /> Tenaga Kesehatan
                                    </span>
                                    <span className="font-bold text-gray-800">{region.totalNakes} Orang</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-500">
                                        <FaUsers className="text-pink-500" /> Ibu Terdaftar
                                    </span>
                                    <span className="font-bold text-gray-800">{region.totalParents} Orang</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(region.id)}
                                className="mt-6 text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                            >
                                <FaTrash /> Hapus Wilayah
                            </button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}