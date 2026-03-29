export function calculateEstimatedDueDate(hpht: Date): Date {
    const edd = new Date(hpht);
    // Rumus Naegele: +7 hari, -3 bulan, +1 tahun (atau +7 hari + 9 bulan)
    edd.setDate(edd.getDate() + 7);
    edd.setMonth(edd.getMonth() + 9);
    return edd;
}