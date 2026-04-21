export interface Child {
    id: string;
    userId: string;
    name: string;
    birthDate: Date;
    gender: 'male' | 'female';
    birthWeight?: number;
    birthHeight?: number;
    wilayah?: string; // Tambahkan baris ini
    createdAt: Date;
    updatedAt: Date;
    age?: number;
} 