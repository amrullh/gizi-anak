// src/types/pregnancy.ts

export interface PillIntakeLog {
    date: Date;
    count: number;
}

export interface MonthlyRecord {
    tanggal: Date;
    bb: number; // Disamakan dengan form admin
    tb: number;
    hb: number;
    statusHb?: 'ANEMIA' | 'Normal';
    lila: number;
    statusLila?: 'KEK' | 'Normal';
    keluhan?: string;
}

export interface PregnancyData {
    id: string;
    userId: string;
    bidanId?: string | null; // Tambahkan untuk sinkronisasi bidan
    isPregnant: boolean;
    pemeriksaanTanggal: Date;
    nama: string;
    umur: number;
    tanggalLahir?: Date;

    // Demografi & Paritas
    pendidikan?: string;
    pekerjaan?: string;
    kehamilanKe?: number;
    jumlahAnakHidup?: number;
    pernahAbortus?: boolean;
    abortusAnakKe?: number;
    jarakKehamilan?: string;
    riwayatKomplikasi?: string;

    // Medis Kehamilan
    hpht?: Date;
    taksiranPersalinan?: Date;
    umurKehamilanMinggu?: number;
    keluhanTrimester1?: string;
    keluhanTrimester2?: string;
    keluhanTrimester3?: string;

    // Status Terakhir
    beratBadan: number;
    tinggiBadan: number;
    hb?: number;
    lila?: number;

    // Pelacakan Suplemen (Sinkron Admin & Parent)
    pillFeProgress: number;     // Angka progres 0-100
    pillFeLogs?: PillIntakeLog[]; // Array riwayat konsumsi

    pillKelorProgress: number;   // Angka progres Kelor 0-100
    pillKelorLogs?: PillIntakeLog[]; // Array riwayat konsumsi Kelor

    // Catatan Bulanan
    monthlyRecords?: MonthlyRecord[];

    // Sistem
    wilayah?: string;
    createdAt: Date;
    updatedAt: Date;
}