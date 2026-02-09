export interface Category {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    sku: string;
    stockQuantity: number;
    imageUrl?: string;
    categoryId?: string;
    category?: Category;
    // Fiscal Data
    ncm?: string;
    cest?: string;
    origin?: number;
    cfop?: string;
    icmsRate?: number;
    createdAt: string;
    updatedAt: string;
}
