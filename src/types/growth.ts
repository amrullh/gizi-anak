export interface GrowthRecord {
    id: string;
    childId: string;
    date: Date;
    weight: number;
    height: number;
    headCircumference?: number;
    nutritionalStatus?: 'underweight' | 'normal' | 'overweight' | 'obese';
    notes?: string;
    createdAt: Date;
}