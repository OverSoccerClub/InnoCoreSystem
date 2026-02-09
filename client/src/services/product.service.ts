import { API_CONFIG } from '../config/api.config';
import type { Product } from '../types/product';

const API_URL = API_CONFIG.ENDPOINTS.PRODUCTS;

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProductQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    stockFilter?: string;
}

export const productService = {
    async getAll(options: ProductQueryOptions = {}): Promise<PaginatedResponse<Product>> {
        const token = localStorage.getItem('token');

        // Build query string
        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.search) params.append('search', options.search);
        if (options.categoryId) params.append('categoryId', options.categoryId);
        if (options.stockFilter) params.append('stockFilter', options.stockFilter);

        const response = await fetch(`${API_URL}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar produtos');
        }

        return response.json();
    },

    async create(product: Partial<Product>): Promise<Product> {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar produto');
        }

        return response.json();
    },

    async update(id: string, product: Partial<Product>): Promise<Product> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao atualizar produto');
        }

        return response.json();
    },

    async delete(id: string): Promise<void> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao deletar produto');
        }
    }
};
