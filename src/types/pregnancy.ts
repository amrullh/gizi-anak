export interface MonthlyRecord {
    tanggal: Date;
    beratBadan: number;
    tinggiBadan: number;
    hb: number;
    lila: number;
    keluhan?: string;
}

export interface PregnancyData {
    id: string;
    userId: string;
    isPregnant: boolean;
    pemeriksaanTanggal: Date;
    nama: string;
    umur: number;
    ttl?: string;
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
    beratBadan: number;
    tinggiBadan: number;
    hb?: number;
    lila?: number;
    // Fitur Baru
    pillProgress: number; // 0 sampai 90
    monthlyRecords?: MonthlyRecord[];
    createdAt: Date;
    updatedAt: Date;
}