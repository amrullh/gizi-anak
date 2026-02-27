export interface PregnancyData {
    id: string;
    userId: string;
    isPregnant: boolean; // tambah field ini
    pemeriksaanTanggal: Date;
    nama: string;
    umur: number;
    ttl?: string;
    // field kehamilan hanya relevan jika isPregnant true
    kehamilanKe?: number;
    jumlahAnakHidup?: number;
    pernahAbortus?: boolean;
    abortusAnakKe?: number;
    hpht?: Date;
    taksiranPersalinan?: Date;
    umurKehamilanMinggu?: number;
    keluhanTrimester1?: string;
    keluhanTrimester2?: string;
    keluhanTrimester3?: string;
    // asesmen gizi tetap ada
    beratBadan: number;
    tinggiBadan: number;
    hb?: number;
    lila?: number;
    createdAt: Date;
    updatedAt: Date;
}