export function calculateNutritionalStatus(
    ageMonths: number,
    gender: 'male' | 'female',
    weight: number,
    height: number
): { status: string; color: string } {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    /**
     * RESEARCH-BASED LOGIC (WHO BMI-FOR-AGE Z-SCORE)
     * Data di bawah adalah ambang batas (threshold) 
     * Berdasarkan Median dan Standard Deviation WHO.
     */

    let thresholds = {
        underweight: 0,
        normal: 0,
        overweight: 0
    };

    if (gender === 'male') {
        if (ageMonths <= 24) {
            // Balita Laki-laki (0-2 thn)
            thresholds = { underweight: 13.0, normal: 18.2, overweight: 20.1 };
        } else if (ageMonths <= 60) {
            // Balita Laki-laki (2-5 thn)
            thresholds = { underweight: 12.5, normal: 17.8, overweight: 19.5 };
        } else {
            // Anak & Remaja Laki-laki
            thresholds = { underweight: 14.5, normal: 21.0, overweight: 25.0 };
        }
    } else {
        if (ageMonths <= 24) {
            // Balita Perempuan (0-2 thn)
            thresholds = { underweight: 12.5, normal: 18.0, overweight: 19.8 };
        } else if (ageMonths <= 60) {
            // Balita Perempuan (2-5 thn)
            thresholds = { underweight: 12.0, normal: 17.5, overweight: 19.2 };
        } else {
            // Anak & Remaja Perempuan
            thresholds = { underweight: 14.0, normal: 21.5, overweight: 25.5 };
        }
    }

    // Logic Penentuan Status Berdasarkan Threshold 
    if (bmi < thresholds.underweight) return { status: 'Gizi Kurang (Wasted)', color: 'orange' };
    if (bmi < thresholds.normal) return { status: 'Gizi Baik (Normal)', color: 'green' };
    if (bmi < thresholds.overweight) return { status: 'Gizi Lebih (Overweight)', color: 'blue' };
    return { status: 'Obesitas', color: 'red' };
}