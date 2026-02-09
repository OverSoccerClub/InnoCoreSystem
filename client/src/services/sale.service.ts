import { API_CONFIG } from '../config/api.config';
import type { Partner } from '../types/partner';

export interface SaleItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product?: { name: string };
}

export interface Sale {
    id: string;
    code: number;
    total: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
    partnerId?: string;
    userId: string;
    items: SaleItem[];
    createdAt: string;
    partner?: Partner;
    user?: { name: string };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const API_URL = API_CONFIG.ENDPOINTS.SALES;

export const saleService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<PaginatedResponse<Sale>> {
        const token = localStorage.getItem('token');

        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar vendas');
        }

        return response.json();
    },

    async create(saleData: { partnerId?: string, paymentMethod: string, items: { productId: string, quantity: number, unitPrice: number }[] }): Promise<Sale> {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(saleData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao realizar venda');
        }

        return response.json();
    },

    async getById(id: string): Promise<Sale> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar venda');
        }

        return response.json();
    }
};
