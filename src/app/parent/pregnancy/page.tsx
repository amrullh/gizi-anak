'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePregnancy } from '@/hooks/usePregnancy';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PregnancyPage() {
    const { user } = useAuth();
    const { pregnancy, loading, savePregnancy } = usePregnancy();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPregnant, setIsPregnant] = useState(true); // default true

    const [form, setForm] = useState({
        pemeriksaanTanggal: new Date().toISOString().split('T')[0],
        nama: '',
        umur: '',
        ttl: '',
        // kehamilan
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
        // asesmen
        beratBadan: '',
        tinggiBadan: '',
        hb: '',
        lila: '',
    });

    useEffect(() => {
        if (pregnancy) {
            setForm({
                pemeriksaanTanggal: pregnancy.pemeriksaanTanggal.toISOString().split('T')[0],
                nama: pregnancy.nama,
                umur: pregnancy.umur.toString(),
                ttl: pregnancy.ttl || '',
                kehamilanKe: pregnancy.kehamilanKe?.toString() || '1',
                jumlahAnakHidup: pregnancy.jumlahAnakHidup?.toString() || '0',
                pernahAbortus: pregnancy.pernahAbortus || false,
                abortusAnakKe: pregnancy.abortusAnakKe?.toString() || '',
                hpht: pregnancy.hpht ? pregnancy.hpht.toISOString().split('T')[0] : '',
                taksiranPersalinan: pregnancy.taksiranPersalinan ? pregnancy.taksiranPersalinan.toISOString().split('T')[0] : '',
                umurKehamilanMinggu: pregnancy.umurKehamilanMinggu?.toString() || '',
                keluhanTrimester1: pregnancy.keluhanTrimester1 || '',
                keluhanTrimester2: pregnancy.keluhanTrimester2 || '',
                keluhanTrimester3: pregnancy.keluhanTrimester3 || '',
                beratBadan: pregnancy.beratBadan.toString(),
                tinggiBadan: pregnancy.tinggiBadan.toString(),
                hb: pregnancy.hb?.toString() || '',
                lila: pregnancy.lila?.toString() || '',
            });
            setIsPregnant(pregnancy.isPregnant ?? true);
        } else {
            setForm(prev => ({ ...prev, nama: user?.name || '' }));
        }
    }, [pregnancy, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === 'isPregnant') {
                setIsPregnant(checked);
            } else {
                setForm(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Validasi dasar
            if (!form.nama || !form.umur || !form.beratBadan || !form.tinggiBadan) {
                alert('Harap isi data wajib (Nama, Umur, Berat Badan, Tinggi Badan)');
                setIsSubmitting(false);
                return;
            }

            const dataToSave: any = {
                isPregnant,
                pemeriksaanTanggal: new Date(form.pemeriksaanTanggal),
                nama: form.nama,
                umur: parseInt(form.umur),
                ttl: form.ttl || undefined,
                beratBadan: parseFloat(form.beratBadan),
                tinggiBadan: parseFloat(form.tinggiBadan),
                hb: form.hb ? parseFloat(form.hb) : undefined,
                lila: form.lila ? parseFloat(form.lila) : undefined,
            };

            if (isPregnant) {
                // Validasi field kehamilan
                if (!form.kehamilanKe || !form.jumlahAnakHidup || !form.hpht || !form.taksiranPersalinan || !form.umurKehamilanMinggu) {
                    alert('Harap isi semua data kehamilan');
                    setIsSubmitting(false);
                    return;
                }
                dataToSave.kehamilanKe = parseInt(form.kehamilanKe);
                dataToSave.jumlahAnakHidup = parseInt(form.jumlahAnakHidup);
                dataToSave.pernahAbortus = form.pernahAbortus;
                if (form.pernahAbortus && form.abortusAnakKe) {
                    dataToSave.abortusAnakKe = parseInt(form.abortusAnakKe);
                }
                dataToSave.hpht = new Date(form.hpht);
                dataToSave.taksiranPersalinan = new Date(form.taksiranPersalinan);
                dataToSave.umurKehamilanMinggu = parseInt(form.umurKehamilanMinggu);
                dataToSave.keluhanTrimester1 = form.keluhanTrimester1 || undefined;
                dataToSave.keluhanTrimester2 = form.keluhanTrimester2 || undefined;
                dataToSave.keluhanTrimester3 = form.keluhanTrimester3 || undefined;
            }

            await savePregnancy(dataToSave);
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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Ibu Hamil</h1>
                <p className="text-gray-600 mb-8">Lengkapi data kehamilan Anda untuk pemantauan optimal</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Checkbox Hamil */}
                    <Card>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPregnant"
                                id="isPregnant"
                                checked={isPregnant}
                                onChange={handleChange}
                                className="h-5 w-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                            />
                            <label htmlFor="isPregnant" className="ml-3 text-lg font-medium text-gray-700">
                                Saya sedang hamil
                            </label>
                        </div>
                    </Card>

                    {/* Tanggal Pemeriksaan */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Pemeriksaan</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tanggal Pemeriksaan</label>
                            <input
                                type="date"
                                name="pemeriksaanTanggal"
                                value={form.pemeriksaanTanggal}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                    </Card>

                    {/* Data Ibu */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Data Ibu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={form.nama}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Umur (tahun)</label>
                                <input
                                    type="number"
                                    name="umur"
                                    value={form.umur}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Tempat, Tanggal Lahir (opsional)</label>
                                <input
                                    type="text"
                                    name="ttl"
                                    value={form.ttl}
                                    onChange={handleChange}
                                    placeholder="Contoh: Jakarta, 1 Januari 1990"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Data Kehamilan (hanya jika isPregnant true) */}
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
                                            value={form.kehamilanKe}
                                            onChange={handleChange}
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
                                            value={form.jumlahAnakHidup}
                                            onChange={handleChange}
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
                                                    checked={form.pernahAbortus}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                Pernah Abortus
                                            </label>
                                            {form.pernahAbortus && (
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        name="abortusAnakKe"
                                                        value={form.abortusAnakKe}
                                                        onChange={handleChange}
                                                        placeholder="Anak ke-"
                                                        className="input-field"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* HPHT & Taksiran */}
                            <Card>
                                <h2 className="text-xl font-semibold mb-4">HPHT & Taksiran Persalinan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Hari Pertama Haid Terakhir (HPHT)</label>
                                        <input
                                            type="date"
                                            name="hpht"
                                            value={form.hpht}
                                            onChange={handleChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Taksiran Persalinan</label>
                                        <input
                                            type="date"
                                            name="taksiranPersalinan"
                                            value={form.taksiranPersalinan}
                                            onChange={handleChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Umur Kehamilan (minggu)</label>
                                        <input
                                            type="number"
                                            name="umurKehamilanMinggu"
                                            value={form.umurKehamilanMinggu}
                                            onChange={handleChange}
                                            min="1"
                                            max="42"
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Keluhan per Trimester */}
                            <Card>
                                <h2 className="text-xl font-semibold mb-4">Keluhan Selama Kehamilan</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trimester I</label>
                                        <textarea
                                            name="keluhanTrimester1"
                                            value={form.keluhanTrimester1}
                                            onChange={handleChange}
                                            rows={2}
                                            className="input-field"
                                            placeholder="Contoh: Mual, muntah"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trimester II</label>
                                        <textarea
                                            name="keluhanTrimester2"
                                            value={form.keluhanTrimester2}
                                            onChange={handleChange}
                                            rows={2}
                                            className="input-field"
                                            placeholder="Contoh: Sakit punggung"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trimester III</label>
                                        <textarea
                                            name="keluhanTrimester3"
                                            value={form.keluhanTrimester3}
                                            onChange={handleChange}
                                            rows={2}
                                            className="input-field"
                                            placeholder="Contoh: Sesak napas"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Asesmen Gizi Ibu (tetap muncul) */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Asesmen Gizi Ibu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Berat Badan (kg)</label>
                                <input
                                    type="number"
                                    name="beratBadan"
                                    value={form.beratBadan}
                                    onChange={handleChange}
                                    step="0.1"
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tinggi Badan (cm)</label>
                                <input
                                    type="number"
                                    name="tinggiBadan"
                                    value={form.tinggiBadan}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pemeriksaan Hb (g/dL)</label>
                                <input
                                    type="number"
                                    name="hb"
                                    value={form.hb}
                                    onChange={handleChange}
                                    step="0.1"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">LILA (cm)</label>
                                <input
                                    type="number"
                                    name="lila"
                                    value={form.lila}
                                    onChange={handleChange}
                                    step="0.1"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </Card>

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