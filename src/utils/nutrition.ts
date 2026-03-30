/**
 * DATA REFERENSI STANDAR ANTROPOMETRI WHO/KEMENKES 2020
 * Median & Standar Deviasi (SD) untuk menghitung Z-Score
 */

interface GrowthReference {
    [month: number]: { median: number; sd: number };
}

// --- DATA ANAK PEREMPUAN ---
const HEIGHT_REF_GIRLS: GrowthReference = {
    0: { median: 49.1, sd: 1.9 }, 6: { median: 65.7, sd: 2.3 }, 12: { median: 74.0, sd: 2.6 },
    18: { median: 80.7, sd: 2.9 }, 24: { median: 86.4, sd: 3.2 }, 30: { median: 91.3, sd: 3.5 },
    36: { median: 95.1, sd: 3.8 }, 40: { median: 97.7, sd: 4.0 }, 42: { median: 99.0, sd: 4.1 },
    48: { median: 102.7, sd: 4.3 }, 54: { median: 106.2, sd: 4.5 }, 60: { median: 109.4, sd: 4.8 }
};

const BMI_REF_GIRLS: GrowthReference = {
    0: { median: 13.3, sd: 1.1 }, 6: { median: 16.0, sd: 1.1 }, 12: { median: 16.3, sd: 1.2 },
    18: { median: 16.0, sd: 1.2 }, 24: { median: 15.7, sd: 1.2 }, 30: { median: 15.4, sd: 1.2 },
    36: { median: 15.3, sd: 1.2 }, 40: { median: 15.2, sd: 1.2 }, 42: { median: 15.2, sd: 1.2 },
    48: { median: 15.0, sd: 1.3 }, 54: { median: 14.9, sd: 1.4 }, 60: { median: 14.8, sd: 1.5 }
};

// --- DATA ANAK LAKI-LAKI ---
const HEIGHT_REF_BOYS: GrowthReference = {
    0: { median: 49.9, sd: 1.9 }, 6: { median: 67.6, sd: 2.3 }, 12: { median: 75.7, sd: 2.6 },
    18: { median: 82.3, sd: 2.9 }, 24: { median: 87.8, sd: 3.2 }, 30: { median: 92.4, sd: 3.5 },
    36: { median: 96.1, sd: 3.8 }, 40: { median: 98.6, sd: 4.0 }, 42: { median: 99.9, sd: 4.1 },
    48: { median: 103.3, sd: 4.3 }, 54: { median: 106.7, sd: 4.5 }, 60: { median: 110.0, sd: 4.8 }
};

const BMI_REF_BOYS: GrowthReference = {
    0: { median: 13.4, sd: 1.1 }, 6: { median: 16.8, sd: 1.1 }, 12: { median: 17.1, sd: 1.2 },
    18: { median: 16.7, sd: 1.2 }, 24: { median: 16.3, sd: 1.2 }, 30: { median: 16.0, sd: 1.2 },
    36: { median: 15.8, sd: 1.2 }, 40: { median: 15.7, sd: 1.2 }, 42: { median: 15.6, sd: 1.3 },
    48: { median: 15.5, sd: 1.3 }, 54: { median: 15.3, sd: 1.4 }, 60: { median: 15.2, sd: 1.5 }
};

/**
 * MENGHITUNG Z-SCORE
 */
function calculateZScore(value: number, month: number, reference: GrowthReference): number {
    const keys = Object.keys(reference).map(Number).sort((a, b) => a - b);
    let closestMonth = keys[0];
    for (const m of keys) {
        if (month >= m) closestMonth = m;
        else break;
    }
    const ref = reference[closestMonth];
    return (value - ref.median) / ref.sd;
}

export function calculateDetailedAge(birthDate: Date, referenceDate: Date = new Date()) {
    let years = referenceDate.getFullYear() - birthDate.getFullYear();
    let months = referenceDate.getMonth() - birthDate.getMonth();
    let days = referenceDate.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const totalMonths = (years * 12) + months;

    return {
        totalMonths,
        years,
        months,
        days,
        label: years > 0
            ? `${years} thn ${months} bln ${days} hr`
            : `${months} bln ${days} hr`
    };
}

export function calculateNutritionalStatus(
    ageMonths: number,
    gender: 'male' | 'female',
    weight: number,
    height: number
) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    // 1. Pilih referensi berdasarkan gender
    const bmiRef = gender === 'female' ? BMI_REF_GIRLS : BMI_REF_BOYS;
    const heightRef = gender === 'female' ? HEIGHT_REF_GIRLS : HEIGHT_REF_BOYS;

    // 2. Hitung Z-Score
    const zBmi = calculateZScore(bmi, ageMonths, bmiRef);
    const zHeight = calculateZScore(height, ageMonths, heightRef);

    // LOGIKA GIZI (Wasting/BMI-for-Age)
    let nutrition = { status: 'Gizi Baik (Normal)', color: 'green' };
    if (zBmi < -3) nutrition = { status: 'Gizi Buruk (Malnutrisi)', color: 'red' };
    else if (zBmi < -2) nutrition = { status: 'Gizi Kurang (Wasted)', color: 'orange' };
    else if (zBmi > 3) nutrition = { status: 'Obesitas', color: 'red' };
    else if (zBmi > 2) nutrition = { status: 'Gizi Lebih (Overweight)', color: 'orange' };

    // LOGIKA STUNTING (Height-for-Age)
    let stunting = { status: 'Normal', color: 'green', isStunted: false };
    if (zHeight < -3) {
        stunting = { status: 'Sangat Pendek (Stunting)', color: 'red', isStunted: true };
    } else if (zHeight < -2) {
        stunting = { status: 'Pendek (Berpotensi Stunting)', color: 'orange', isStunted: true };
    }

    return { nutrition, stunting, zBmi: zBmi.toFixed(2), zHeight: zHeight.toFixed(2) };
}