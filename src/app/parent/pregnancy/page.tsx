'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePregnancy } from '@/hooks/usePregnancy';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PregnancyPage() {
    const { user, updateUser } = useAuth();
    const { pregnancy, loading, savePregnancy } = usePregnancy();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPregnant, setIsPregnant] = useState(false);

    // Form untuk data ibu & gizi (wajib)
    const [ibuForm, setIbuForm] = useState({
        ttl: '',
        beratBadan: '',
        tinggiBadan: '',
        hb: '',
        lila: '',
    });

    // Form untuk data kehamilan (opsional)
    const [hamilForm, setHamilForm] = useState({
        kehamilanKe: '1',
        jumlahAnakHidup: '0',
        pernahAbortus: false,
        abortusAnakKe: '',
        hpht: '',
        taksiranPersalinan: '',
        umurKehamilanMinggu: '',
        keluhanTrimester1: '',
        keluhanTrimester2: '',
        keluhanTrimester3: '',
    });

    // Load data user jika sudah ada
    useEffect(() => {
        if (user) {
            setIbuForm({
                ttl: user.ttl || '',
                beratBadan: user.beratBadan?.toString() || '',
                tinggiBadan: user.tinggiBadan?.toString() || '',
                hb: user.hb?.toString() || '',
                lila: user.lila?.toString() || '',
            });
            setIsPregnant(user.isPregnant || false);
        }
    }, [user]);

    // Load data kehamilan jika sudah ada
    useEffect(() => {
        if (pregnancy) {
            setHamilForm({
                kehamilanKe: pregnancy.kehamilanKe?.toString() || '1',
                jumlahAnakHidup: pregnancy.jumlahAnakHidup?.toString() || '0',
                pernahAbortus: pregnancy.pernahAbortus || false,
                abortusAnakKe: pregnancy.abortusAnakKe?.toString() || '',
                hpht: pregnancy.hpht?.toISOString().split('T')[0] || '',
                taksiranPersalinan: pregnancy.taksiranPersalinan?.toISOString().split('T')[0] || '',
                umurKehamilanMinggu: pregnancy.umurKehamilanMinggu?.toString() || '',
                keluhanTrimester1: pregnancy.keluhanTrimester1 || '',
                keluhanTrimester2: pregnancy.keluhanTrimester2 || '',
                keluhanTrimester3: pregnancy.keluhanTrimester3 || '',
            });
        }
    }, [pregnancy]);

    const handleIbuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setIbuForm(prev => ({ ...prev, [name]: value }));
    };

    const handleHamilChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setHamilForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validasi data ibu & gizi (wajib)
            if (!ibuForm.beratBadan || !ibuForm.tinggiBadan) {
                alert('Berat badan dan tinggi badan wajib diisi');
                setIsSubmitting(false);
                return;
            }

            // Update data user
            await updateUser({
                ttl: ibuForm.ttl || undefined,
                beratBadan: parseFloat(ibuForm.beratBadan),
                tinggiBadan: parseFloat(ibuForm.tinggiBadan),
                hb: ibuForm.hb ? parseFloat(ibuForm.hb) : undefined,
                lila: ibuForm.lila ? parseFloat(ibuForm.lila) : undefined,
                isPregnant,
            });

            // Jika hamil, simpan data kehamilan
            if (isPregnant) {
                // Validasi data kehamilan (wajib jika hamil)
                if (!hamilForm.hpht || !hamilForm.taksiranPersalinan || !hamilForm.umurKehamilanMinggu) {
                    alert('Data HPHT, taksiran persalinan, dan umur kehamilan wajib diisi jika hamil');
                    setIsSubmitting(false);
                    return;
                }

                await savePregnancy({
                    isPregnant: true,
                    pemeriksaanTanggal: new Date(),
                    nama: user?.name || '',
                    umur: 0, // atau dari form jika ada
                    beratBadan: parseFloat(ibuForm.beratBadan),
                    tinggiBadan: parseFloat(ibuForm.tinggiBadan),
                    kehamilanKe: parseInt(hamilForm.kehamilanKe),
                    jumlahAnakHidup: parseInt(hamilForm.jumlahAnakHidup),
                    pernahAbortus: hamilForm.pernahAbortus,
                    abortusAnakKe: hamilForm.abortusAnakKe ? parseInt(hamilForm.abortusAnakKe) : undefined,
                    hpht: new Date(hamilForm.hpht),
                    taksiranPersalinan: new Date(hamilForm.taksiranPersalinan),
                    umurKehamilanMinggu: parseInt(hamilForm.umurKehamilanMinggu),
                    keluhanTrimester1: hamilForm.keluhanTrimester1 || undefined,
                    keluhanTrimester2: hamilForm.keluhanTrimester2 || undefined,
                    keluhanTrimester3: hamilForm.keluhanTrimester3 || undefined,
                });
            }

            router.push('/parent/dashboard');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Lengkapi Data Diri</h1>
                <p className="text-gray-600 mb-8">Isi data diri dan asesmen gizi Anda</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data Ibu (wajib) */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Data Ibu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Tempat, Tanggal Lahir (opsional)</label>
                                <input
                                    type="text"
                                    name="ttl"
                                    value={ibuForm.ttl}
                                    onChange={handleIbuChange}
                                    placeholder="Contoh: Jakarta, 1 Januari 1990"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Asesmen Gizi (wajib) */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Asesmen Gizi Ibu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Berat Badan (kg) *</label>
                                <input
                                    type="number"
                                    name="beratBadan"
                                    value={ibuForm.beratBadan}
                                    onChange={handleIbuChange}
                                    step="0.1"
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tinggi Badan (cm) *</label>
                                <input
                                    type="number"
                                    name="tinggiBadan"
                                    value={ibuForm.tinggiBadan}
                                    onChange={handleIbuChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pemeriksaan Hb (g/dL)</label>
                                <input
                                    type="number"
                                    name="hb"
                                    value={ibuForm.hb}
                                    onChange={handleIbuChange}
                                    step="0.1"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">LILA (cm)</label>
                                <input
                                    type="number"
                                    name="lila"
                                    value={ibuForm.lila}
                                    onChange={handleIbuChange}
                                    step="0.1"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Checkbox Hamil */}
                    <Card>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPregnant}
                                onChange={(e) => setIsPregnant(e.target.checked)}
                                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                            />
                            <span className="text-gray-700 font-medium">Saya sedang hamil</span>
                        </label>
                    </Card>

                    {/* Data Kehamilan (opsional, muncul jika hamil) */}
                    {isPregnant && (
                        <>
                            <Card>
                                <h2 className="text-xl font-semibold mb-4">Data Kehamilan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kehamilan ke-</label>
                                        <input
                                            type="number"
                                            name="kehamilanKe"
                                            value={hamilForm.kehamilanKe}
                                            onChange={handleHamilChange}
                                            min="1"
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Jumlah Anak Hidup</label>
                                        <input
                                            type="number"
                                            name="jumlahAnakHidup"
                                            value={hamilForm.jumlahAnakHidup}
                                            onChange={handleHamilChange}
                                            min="0"
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="pernahAbortus"
                                                    checked={hamilForm.pernahAbortus}
                                                    onChange={handleHamilChange}
                                                    className="mr-2 rounded"
                                                />
                                                Pernah Abortus
                                            </label>
                                            {hamilForm.pernahAbortus && (
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        name="abortusAnakKe"
                                                        value={hamilForm.abortusAnakKe}
                                                        onChange={handleHamilChange}
                                                        placeholder="Anak ke-"
                                                        className="input-field"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h2 className="text-xl font-semibold mb-4">HPHT & Taksiran Persalinan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Hari Pertama Haid Terakhir (HPHT) *</label>
                                        <input
                                            type="date"
                                            name="hpht"
                                            value={hamilForm.hpht}
                                            onChange={handleHamilChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Taksiran Persalinan *</label>
                                        <input
                                            type="date"
                                            name="taksiranPersalinan"
                                            value={hamilForm.taksiranPersalinan}
                                            onChange={handleHamilChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Umur Kehamilan (minggu) *</label>
                                        <input
                                            type="number"
                                            name="umurKehamilanMinggu"
                                            value={hamilForm.umurKehamilanMinggu}
                                            onChange={handleHamilChange}
                                            min="1"
                                            max="42"
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h2 className="text-xl font-semibold mb-4">Keluhan Selama Kehamilan (opsional)</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trimester I</label>
                                        <textarea
                                            name="keluhanTrimester1"
                                            value={hamilForm.keluhanTrimester1}
                                            onChange={handleHamilChange}
                                            rows={2}
                                            className="input-field"
                                            placeholder="Contoh: Mual, muntah"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trimester II</label>
                                        <textarea
                                            name="keluhanTrimester2"
                                            value={hamilForm.keluhanTrimester2}
                                            onChange={handleHamilChange}
                                            rows={2}
                                            className="input-field"
                                            placeholder="Contoh: Sakit punggung"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trimester III</label>
                                        <textarea
                                            name="keluhanTrimester3"
                                            value={hamilForm.keluhanTrimester3}
                                            onChange={handleHamilChange}
                                            rows={2}
                                            className="input-field"
                                            placeholder="Contoh: Sesak napas"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}