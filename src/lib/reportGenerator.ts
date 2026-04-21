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
        childrenList: any[];
        pregnancyList?: any[];
    };
}

export async function generatePDFReport(data: ReportData) {
    const doc = new jsPDF('l', 'mm', 'a4');
    const printDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    // --- LOGIKA GROUPING BERDASARKAN WILAYAH ---
    const groupByWilayah = (list: any[]) => {
        return list.reduce((acc: any, item) => {
            const wilayah = item.wilayah || 'WILAYAH TIDAK TERDAFTAR';
            if (!acc[wilayah]) acc[wilayah] = [];
            acc[wilayah].push(item);
            return acc;
        }, {});
    };

    const childrenByWilayah = groupByWilayah(data.stats.childrenList);
    const pregnancyByWilayah = groupByWilayah(data.stats.pregnancyList || []);
    const allWilayah = Array.from(new Set([
        ...Object.keys(childrenByWilayah),
        ...Object.keys(pregnancyByWilayah)
    ])).sort();

    // HEADER HALAMAN UTAMA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text((data.title || 'LAPORAN AUDIT GIZI & KIA').toUpperCase(), 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${data.period} | Tanggal Cetak: ${printDate}`, 14, 22);

    let finalY = 25;

    allWilayah.forEach((wilayah, index) => {
        if (index > 0) doc.addPage();
        finalY = 20;

        // Header Wilayah
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setFillColor(240, 240, 240);
        doc.rect(14, finalY, 268, 10, 'F');
        doc.text(`WILAYAH PUSKESMAS: ${wilayah.toUpperCase()}`, 18, finalY + 7);

        // --- 1. TABEL ANAK ---
        doc.setFontSize(11);
        doc.text("A. DATA TUMBUH KEMBANG ANAK", 14, finalY + 18);

        autoTable(doc, {
            startY: finalY + 22,
            head: [['NO', 'NAMA ANAK', 'L/P', 'USIA', 'BB', 'TB', 'BB/U', 'TB/U', 'BB/TB (GIZI)']],
            body: (childrenByWilayah[wilayah] || []).map((c: any, i: number) => [
                i + 1, c.name.toUpperCase(), c.gender, c.ageLabel, c.weight, c.height, c.bbu, c.tbu, c.bbtb
            ]),
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [31, 41, 55] },
            didParseCell: (data) => {
                const status = data.row.cells[8].text[0];
                if (data.section === 'body' && (status?.includes('Buruk') || status?.includes('Sangat'))) {
                    data.cell.styles.textColor = [220, 38, 38];
                }
            }
        });

        finalY = (doc as any).lastAutoTable.finalY + 15;

        // --- 2. TABEL IBU (Jika Ada) ---
        if (pregnancyByWilayah[wilayah] && pregnancyByWilayah[wilayah].length > 0) {
            doc.setFontSize(11);
            doc.text("B. DATA PEMANTAUAN IBU HAMIL & BERSALIN", 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['NO', 'NAMA IBU', 'STATUS', 'USIA HAMIL', 'HPL', 'FE', 'KELOR', 'PERSALINAN', 'KONDISI']],
                body: pregnancyByWilayah[wilayah].map((p: any, i: number) => [
                    i + 1,
                    p.nama.toUpperCase(),
                    p.status,
                    p.usiaHamil,
                    p.hpl,
                    p.feProgress,
                    p.kelorProgress,
                    p.caraLahir,
                    p.kondisiLahir
                ]),
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [190, 24, 93] }, // Pink-700
            });
        }
    });

    doc.save(`Laporan_Audit_KIA_${data.period.replace(/\s/g, '_')}.pdf`);
}

export function generateExcelReport(data: ReportData) {
    const wb = XLSX.utils.book_new();

    const groupByWilayah = (list: any[]) => {
        return list.reduce((acc: any, item) => {
            const wilayah = item.wilayah || 'WILAYAH TIDAK TERDAFTAR';
            if (!acc[wilayah]) acc[wilayah] = [];
            acc[wilayah].push(item);
            return acc;
        }, {});
    };

    const childrenByWilayah = groupByWilayah(data.stats.childrenList);
    const pregnancyByWilayah = groupByWilayah(data.stats.pregnancyList || []);
    const allWilayah = Array.from(new Set([...Object.keys(childrenByWilayah), ...Object.keys(pregnancyByWilayah)]));

    allWilayah.forEach((wilayah) => {
        const rows = [
            [`LAPORAN AUDIT GIZI & KIA - WILAYAH ${wilayah.toUpperCase()}`],
            [`Periode: ${data.period}`],
            [],
            ['--- DATA TUMBUH KEMBANG ANAK ---'],
            ['NO', 'NAMA ANAK', 'GENDER', 'USIA', 'BERAT (KG)', 'TINGGI (CM)', 'STATUS BB/U', 'STATUS TB/U', 'STATUS BB/TB (GIZI)']
        ];

        // Isi Data Anak
        (childrenByWilayah[wilayah] || []).forEach((c: any, i: number) => {
            rows.push([i + 1, c.name, c.gender, c.ageLabel, c.weight, c.height, c.bbu, c.tbu, c.bbtb]);
        });

        rows.push([], ['--- DATA IBU HAMIL & BERSALIN ---']);
        rows.push(['NO', 'NAMA IBU', 'STATUS', 'USIA HAMIL', 'ESTIMASI HPL', 'PROG. FE', 'PROG. KELOR', 'CARA LAHIR', 'KONDISI LAHIR']);

        // Isi Data Ibu
        (pregnancyByWilayah[wilayah] || []).forEach((p: any, i: number) => {
            rows.push([i + 1, p.nama, p.status, p.usiaHamil, p.hpl, p.feProgress, p.kelorProgress, p.caraLahir, p.kondisiLahir]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Atur Lebar Kolom
        ws['!cols'] = [
            { wch: 5 }, { wch: 25 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
            { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
        ];

        const safeSheetName = wilayah.replace(/[\\*?\/\[\]]/g, '').substring(0, 30);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    });

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Laporan_Audit_KIA_${data.period.replace(/\s/g, '_')}.xlsx`);
}