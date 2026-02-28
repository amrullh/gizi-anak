export interface Article {
    id: string;
    adminId: string;
    title: string;
    slug: string;
    content: string;
    category: 'Nutrisi' | 'Imunisasi' | 'Edukasi' | 'Resep' | 'Parenting';
    status: 'draft' | 'published';
    views: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}