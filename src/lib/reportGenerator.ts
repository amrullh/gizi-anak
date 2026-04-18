import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportData {
    type: 'monthly' | 'yearly' | 'custom';
    period: string;
    title?: string;
    stats: {
        totalChildren: number;
        childrenList: any[]; // Pastikan data child di sini sudah membawa field 'wilayah'
    };
}

export async function generatePDFReport(data: ReportData) {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape biar muat banyak kolom
    const printDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    // 1. LOGIC GROUPING BERDASARKAN WILAYAH
    const groupedByWilayah = data.stats.childrenList.reduce((acc: any, child) => {
        const wilayah = child.wilayah || 'WILAYAH TIDAK TERDAFTAR';
        if (!acc[wilayah]) acc[wilayah] = [];
        acc[wilayah].push(child);
        return acc;
    }, {});

    const wilayahKeys = Object.keys(groupedByWilayah).sort();

    // HEADER HALAMAN UTAMA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text((data.title || 'LAPORAN AUDIT GIZI ANAK').toUpperCase(), 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${data.period} | Tanggal Cetak: ${printDate}`, 14, 22);

    let finalY = 30;

    // 2. LOOPING PER WILAYAH
    wilayahKeys.forEach((wilayah, index) => {
        // Jika tabel wilayah sebelumnya terlalu panjang, autoTable akan handle page break, 
        // tapi kita tambahkan jarak antar wilayah.
        if (index > 0) finalY += 15;

        // Header Sub-Wilayah
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setFillColor(245, 245, 245); // Abu-abu muda
        doc.rect(14, finalY, 268, 8, 'F');
        doc.text(`WILAYAH PUSKESMAS: ${wilayah.toUpperCase()}`, 18, finalY + 6);

        autoTable(doc, {
            startY: finalY + 10,
            head: [[
                'NO', 'NAMA ANAK', 'L/P', 'USIA', 'BERAT', 'TINGGI',
                'BB/U (Berat)', 'TB/U (Tinggi)', 'BB/TB (Gizi)'
            ]],
            body: groupedByWilayah[wilayah].map((c: any, i: number) => [
                i + 1,
                c.name.toUpperCase(),
                c.gender === 'male' ? 'L' : 'P',
                c.ageLabel,
                c.weight,
                c.height,
                c.bbu,
                c.tbu,
                c.bbtb
            ]),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [31, 41, 55] }, // Gray-800
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                2: { halign: 'center', cellWidth: 10 },
                6: { fontStyle: 'bold' },
                7: { fontStyle: 'bold' },
                8: { fontStyle: 'bold' },
            },
            didParseCell: (data) => {
                const statusGizi = data.row.cells[8].text[0];
                if (data.section === 'body') {
                    if (statusGizi?.includes('Buruk') || statusGizi?.includes('Sangat')) {
                        data.cell.styles.textColor = [220, 38, 38];
                    } else if (statusGizi?.includes('Kurang') || statusGizi?.includes('Risiko')) {
                        data.cell.styles.textColor = [217, 119, 6];
                    }
                }
            }
        });

        finalY = (doc as any).lastAutoTable.finalY;
    });

    doc.save(`Laporan_Gizi_Wilayah_${data.period.replace(/\s/g, '_')}.pdf`);
}

export function generateExcelReport(data: ReportData) {
    const wb = XLSX.utils.book_new();

    // 1. GROUPING BERDASARKAN WILAYAH
    const groupedByWilayah = data.stats.childrenList.reduce((acc: any, child) => {
        const wilayah = child.wilayah || 'Tanpa_Wilayah';
        if (!acc[wilayah]) acc[wilayah] = [];
        acc[wilayah].push(child);
        return acc;
    }, {});

    const wilayahKeys = Object.keys(groupedByWilayah).sort();

    // 2. BUAT SHEET TERPISAH UNTUK SETIAP WILAYAH
    wilayahKeys.forEach((wilayah) => {
        const wsData = [
            [`LAPORAN GIZI PUSKESMAS: ${wilayah.toUpperCase()}`],
            [`Periode: ${data.period}`],
            [],
            [
                'NO', 'NAMA ANAK', 'GENDER', 'LABEL USIA', 'BERAT (KG)',
                'TINGGI (CM)', 'STATUS BB/U', 'STATUS TB/U (STUNTING)', 'STATUS BB/TB (GIZI)'
            ],
            ...groupedByWilayah[wilayah].map((c: any, i: number) => [
                i + 1,
                c.name,
                c.gender,
                c.ageLabel,
                c.weight,
                c.height,
                c.bbu,
                c.tbu,
                c.bbtb
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Atur Lebar Kolom
        ws['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 10 }, { wch: 15 },
            { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 25 }
        ];

        // Nama Sheet tidak boleh lebih dari 31 karakter dan tidak boleh mengandung karakter khusus tertentu
        const safeSheetName = wilayah.replace(/[\\*?\/\[\]]/g, '').substring(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    });

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Laporan_Gizi_Wilayah_${data.period.replace(/\s/g, '_')}.xlsx`);
}