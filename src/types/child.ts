export interface Child {
    id: string;
    userId: string;
    name: string;
    birthDate: Date;
    gender: 'male' | 'female';
    birthWeight?: number;
    birthHeight?: number;
    createdAt: Date;
    updatedAt: Date;
    age?: number;
} 