import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportData {
    type: 'monthly' | 'yearly' | 'custom';
    period: string;
    stats: {
        totalChildren: number;
        totalParents: number;
        goodNutrition: number;
        warningNutrition: number;
        badNutrition: number;
        childrenList: any[]; // Data detail anak
    };
}

export function generatePDFReport(data: ReportData) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LAPORAN MONITORING GIZI & STUNTING', 14, 22);

    doc.setFontSize(10);
    doc.text(`Periode: ${data.period} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Ringkasan Statistik
    autoTable(doc, {
        startY: 40,
        head: [['Indikator Statistik', 'Jumlah']],
        body: [
            ['Total Anak Terdaftar', data.stats.totalChildren.toString()],
            ['Total Orang Tua', data.stats.totalParents.toString()],
            ['Kondisi Gizi Baik', data.stats.goodNutrition.toString()],
            ['Kasus Perlu Tindakan (Stunting/Wasting)', data.stats.warningNutrition.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 255] }
    });

    // Tabel Detail Anak (Sesuai Permintaan)
    doc.text('DAFTAR DETAIL ANAK & STATUS ANTROPOMETRI', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Nama Anak', 'L/P', 'Usia', 'BB/TB', 'Status IMT/U', 'Status TB/U (Stunting)']],
        body: data.stats.childrenList.map(c => [
            c.name, c.gender, c.ageLabel, `${c.weight}/${c.height}`, c.imtStatus, c.tbuStatus
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [255, 100, 150] }
    });

    doc.save(`Laporan_Gizi_${data.period}.pdf`);
}

export function generateExcelReport(data: ReportData) {
    const wsData = [
        ['LAPORAN MONITORING GIZI ANAK'],
        [`Periode: ${data.period}`],
        [],
        ['RINGKASAN STATISTIK'],
        ['Total Anak', data.stats.totalChildren],
        ['Gizi Baik', data.stats.goodNutrition],
        ['Waspada', data.stats.warningNutrition],
        [],
        ['DAFTAR DETAIL ANAK'],
        ['Nama Anak', 'Gender', 'Usia', 'BB/TB', 'Status IMT/U', 'Status TB/U (Stunting)'],
        ...data.stats.childrenList.map(c => [
            c.name, c.gender, c.ageLabel, `${c.weight}/${c.height}`, c.imtStatus, c.tbuStatus
        ]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Gizi');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Laporan_Gizi_${data.period}.xlsx`);
}