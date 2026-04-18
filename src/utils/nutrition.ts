// utils/nutrition.ts
import {
  SDPoints,
  findNearestRef,
  weightForAgeBoys,
  weightForAgeGirls,
  lengthForAgeBoys,
  lengthForAgeGirls,
  heightForAgeBoys,
  heightForAgeGirls,
  weightForLengthBoys,
  weightForLengthGirls,
  weightForHeightBoys,
  weightForHeightGirls,
} from './antropometriTables';

/**
 * Menghitung Z-Score berdasarkan rumus asimetris Permenkes 2020
 * Jika nilai > median: (nilai - median) / (p1 - median)
 * Jika nilai < median: (nilai - median) / (median - m1)
 */
function calculateZScore(observed: number, ref: SDPoints): number {
  if (observed === ref.median) return 0;
  if (observed > ref.median) {
    return (observed - ref.median) / (ref.p1 - ref.median);
  } else {
    return (observed - ref.median) / (ref.median - ref.m1);
  }
}

/**
 * Koreksi panjang/tinggi badan sesuai metode pengukuran (Permenkes Pasal 4)
 * Anak 0-24 bulan diukur terlentang (PB), jika diukur berdiri => +0.7 cm
 * Anak >24 bulan diukur berdiri (TB), jika diukur terlentang => -0.7 cm
 */
export function getCorrectedHeight(height: number, ageMonths: number, measurementMethod: 'baring' | 'berdiri'): number {
  if (ageMonths < 24 && measurementMethod === 'berdiri') {
    return height + 0.7;
  } else if (ageMonths >= 24 && measurementMethod === 'baring') {
    return height - 0.7;
  }
  return height;
}

/**
 * Hitung usia detail (tahun, bulan, hari)
 */
export function calculateDetailedAge(birthDate: Date, referenceDate: Date = new Date()) {
  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();
  let days = referenceDate.getDate() - birthDate.getDate();

  if (days < 0) {
    const lastMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
    days += lastMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  const totalMonths = years * 12 + months;
  return {
    totalMonths,
    days,
    label: `${totalMonths} bln ${days} hr`,
    years,
    months,
  };
}

/**
 * Menentukan status gizi berdasarkan Z-Score dan kategori Permenkes 2020
 */
function getNutritionStatus(zScore: number, type: 'weight' | 'height' | 'weightForHeight'): {
  status: string;
  color: 'green' | 'orange' | 'red';
} {
  if (type === 'weight') {
    // BB/U
    if (zScore < -3) return { status: 'Berat Badan Sangat Kurang (Severely Underweight)', color: 'red' };
    if (zScore < -2) return { status: 'Berat Badan Kurang (Underweight)', color: 'orange' };
    if (zScore <= 1) return { status: 'Berat Badan Normal', color: 'green' };
    return { status: 'Risiko Berat Badan Lebih', color: 'orange' };
  } else if (type === 'height') {
    // TB/U atau PB/U
    if (zScore < -3) return { status: 'Sangat Pendek (Severely Stunted)', color: 'red' };
    if (zScore < -2) return { status: 'Pendek (Stunted)', color: 'orange' };
    if (zScore <= 3) return { status: 'Normal', color: 'green' };
    return { status: 'Tinggi', color: 'green' };
  } else {
    // BB/PB atau BB/TB
    if (zScore < -3) return { status: 'Gizi Buruk (Severely Wasted)', color: 'red' };
    if (zScore < -2) return { status: 'Gizi Kurang (Wasted)', color: 'orange' };
    if (zScore <= 1) return { status: 'Gizi Baik (Normal)', color: 'green' };
    if (zScore <= 2) return { status: 'Berisiko Gizi Lebih', color: 'orange' };
    if (zScore <= 3) return { status: 'Gizi Lebih (Overweight)', color: 'orange' };
    return { status: 'Obesitas (Obese)', color: 'red' };
  }
}

/**
 * Analisis status gizi lengkap (BB/U, TB/U, BB/TB) berdasarkan Permenkes 2/2020
 */
export function calculateNutritionalStatus(
  ageMonths: number,
  gender: 'male' | 'female',
  weight: number,
  height: number,
  measurementMethod: 'baring' | 'berdiri'
) {
  // 1. Koreksi tinggi badan sesuai metode
  const finalHeight = getCorrectedHeight(height, ageMonths, measurementMethod);

  // 2. Pilih data referensi berdasarkan gender
  const weightRef = findNearestRef(
    gender === 'male' ? weightForAgeBoys : weightForAgeGirls,
    ageMonths
  );

  let heightRef = null;
  if (ageMonths < 24) {
    heightRef = findNearestRef(
      gender === 'male' ? lengthForAgeBoys : lengthForAgeGirls,
      ageMonths
    );
  } else {
    heightRef = findNearestRef(
      gender === 'male' ? heightForAgeBoys : heightForAgeGirls,
      ageMonths
    );
  }

  // Untuk BB/PB atau BB/TB
  const heightCmRounded = Math.round(finalHeight);
  let whRef = null;
  if (ageMonths < 24) {
    whRef = findNearestRef(
      gender === 'male' ? weightForLengthBoys : weightForLengthGirls,
      heightCmRounded
    );
  } else {
    whRef = findNearestRef(
      gender === 'male' ? weightForHeightBoys : weightForHeightGirls,
      heightCmRounded
    );
  }

  // 3. Hitung Z-Score masing-masing indeks
  let zWeightForAge: number | null = null;
  let zHeightForAge: number | null = null;
  let zWeightForHeight: number | null = null;

  if (weightRef && weight > 0) {
    zWeightForAge = calculateZScore(weight, weightRef);
  }
  if (heightRef && finalHeight > 0) {
    zHeightForAge = calculateZScore(finalHeight, heightRef);
  }
  if (whRef && weight > 0 && finalHeight > 0) {
    zWeightForHeight = calculateZScore(weight, whRef);
  }

  // 4. Dapatkan status gizi
  const weightStatus = zWeightForAge !== null
    ? getNutritionStatus(zWeightForAge, 'weight')
    : { status: 'Tidak ada data', color: 'gray' as const };

  const heightStatus = zHeightForAge !== null
    ? getNutritionStatus(zHeightForAge, 'height')
    : { status: 'Tidak ada data', color: 'gray' as const };

  const whStatus = zWeightForHeight !== null
    ? getNutritionStatus(zWeightForHeight, 'weightForHeight')
    : { status: 'Tidak ada data', color: 'gray' as const };

  // Cari bagian return di paling bawah fungsi calculateNutritionalStatus dalam file nutrition.ts
  return {
    zWeightForAge: zWeightForAge !== null ? zWeightForAge.toFixed(2) : null,
    zHeightForAge: zHeightForAge !== null ? zHeightForAge.toFixed(2) : null,
    zWeightForHeight: zWeightForHeight !== null ? zWeightForHeight.toFixed(2) : null,
    weightStatus,
    heightStatus,
    whStatus,
    // Tambahkan flag ini untuk memudahkan pengecekan di Hook/Komponen
    isStunted: zHeightForAge !== null && zHeightForAge < -2,
    isWasted: zWeightForHeight !== null && zWeightForHeight < -2,
    // Alias untuk kompatibilitas
    nutrition: weightStatus,
    stunting: heightStatus,
    wasted: whStatus,
  };

}