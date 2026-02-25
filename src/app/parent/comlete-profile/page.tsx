'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ phone: '', address: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                phone: form.phone,
                address: form.address,
            });
            router.push('/parent/dashboard');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6">Lengkapi Data Profil</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Alamat</label>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="input-field"
                            rows={3}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </Card>
        </div>
    );
}