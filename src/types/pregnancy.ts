// src/types/pregnancy.ts
export interface PillIntakeLog {
    date: Date;
    count: number;
}

export interface MonthlyRecord {
    tanggal: Date;
    beratBadan: number;
    tinggiBadan: number;
    hb: number;
    lila: number;
    statusLila?: 'KEK' | 'Normal'; 
    keluhan?: string;
}

export interface PregnancyData {
    id: string;
    userId: string;
    isPregnant: boolean;
    pemeriksaanTanggal: Date;
    nama: string;
    umur: number;
    tanggalLahir?: Date;
    
    
    pendidikan?: string;
    pekerjaan?: string;
    kehamilanKe?: number; 
    jumlahAnakHidup?: number; 
    pernahAbortus?: boolean;
    abortusAnakKe?: number;
    jarakKehamilan?: string; 
    riwayatKomplikasi?: string; 
    
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
    
    pillProgress: number; 
    pillLogs?: PillIntakeLog[]; 
    monthlyRecords?: MonthlyRecord[];
    
    wilayah?: string;
    createdAt: Date;
    updatedAt: Date;
}