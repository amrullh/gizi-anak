import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportData {
    type: 'monthly' | 'yearly' | 'custom';
    period: string;
    startDate?: Date;
    endDate?: Date;
    stats: {
        totalChildren: number;
        totalParents: number;
        totalArticles: number;
        goodNutrition: number;
        warningNutrition: number;
        badNutrition: number;
        childrenByRegion: { region: string; count: number }[];
    };
}

export function generateExcelReport(data: ReportData) {
    // Buat worksheet untuk statistik umum
    const wsData = [
        ['Laporan Monitoring Gizi', ''],
        ['Jenis Laporan', data.type],
        ['Periode', data.period],
        ['Tanggal Generate', new Date().toLocaleDateString('id-ID')],
        [],
        ['Statistik Umum', ''],
        ['Total Anak', data.stats.totalChildren],
        ['Total Orang Tua', data.stats.totalParents],
        ['Total Artikel', data.stats.totalArticles],
        ['Gizi Baik', data.stats.goodNutrition],
        ['Perlu Perhatian', data.stats.warningNutrition],
        ['Gizi Buruk', data.stats.badNutrition],
        [],
        ['Distribusi per Wilayah', ''],
        ['Wilayah', 'Jumlah Anak'],
        ...data.stats.childrenByRegion.map(r => [r.region, r.count]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `laporan_${data.type}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function generatePDFReport(data: ReportData) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Laporan Monitoring Gizi', 14, 22);
    doc.setFontSize(11);
    doc.text(`Jenis Laporan: ${data.type}`, 14, 32);
    doc.text(`Periode: ${data.period}`, 14, 38);
    doc.text(`Tanggal Generate: ${new Date().toLocaleDateString('id-ID')}`, 14, 44);

    // Tabel statistik umum
    autoTable(doc, {
        startY: 50,
        head: [['Statistik', 'Jumlah']],
        body: [
            ['Total Anak', data.stats.totalChildren.toString()],
            ['Total Orang Tua', data.stats.totalParents.toString()],
            ['Total Artikel', data.stats.totalArticles.toString()],
            ['Gizi Baik', data.stats.goodNutrition.toString()],
            ['Perlu Perhatian', data.stats.warningNutrition.toString()],
            ['Gizi Buruk', data.stats.badNutrition.toString()],
        ],
    });

    // Tabel wilayah
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Wilayah', 'Jumlah Anak']],
        body: data.stats.childrenByRegion.map(r => [r.region, r.count.toString()]),
    });

    doc.save(`laporan_${data.type}_${new Date().toISOString().split('T')[0]}.pdf`);
}