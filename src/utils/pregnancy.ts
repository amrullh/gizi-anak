export function calculateEstimatedDueDate(hpht: Date): Date {
    const edd = new Date(hpht);
    // Rumus Naegele: +7 hari, -3 bulan, +1 tahun (atau +7 hari + 9 bulan)
    edd.setDate(edd.getDate() + 7);
    edd.setMonth(edd.getMonth() + 9);
    return edd;
}

export const calculateGestationalAge = (hphtDate: string | Date) => {
  if (!hphtDate) return { weeks: 0, days: 0 };
  
  const start = new Date(hphtDate);
  const today = new Date(); // Atau gunakan tanggal pemeriksaan
  
  const diffInMs = today.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  const weeks = Math.floor(diffInDays / 7);
  const days = diffInDays % 7;
  
  return { weeks, days };
};