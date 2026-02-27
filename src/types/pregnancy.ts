export interface PregnancyData {
    id: string;
    userId: string;
    // Tanggal pemeriksaan
    pemeriksaanTanggal: Date;
    // Data ibu
    nama: string;
    umur: number;
    ttl?: string; // tempat, tanggal lahir (opsional)
    // Kehamilan
    kehamilanKe: number;
    jumlahAnakHidup: number;
    pernahAbortus: boolean;
    abortusAnakKe?: number; // jika pernah abortus, anak ke berapa
    // HPHT & taksiran
    hpht: Date; // hari pertama haid terakhir
    taksiranPersalinan: Date;
    umurKehamilanMinggu: number; // umur kehamilan saat ini dalam minggu
    // Keluhan per trimester
    keluhanTrimester1?: string;
    keluhanTrimester2?: string;
    keluhanTrimester3?: string;
    // Asesmen gizi ibu
    beratBadan: number; // BB
    tinggiBadan: number; // TB
    hb?: number; // pemeriksaan Hb (opsional)
    lila?: number; // lingkar lengan atas (opsional)
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}