import { API_CONFIG } from '../config/api.config';
import type { Partner } from '../types/partner';

const API_URL = API_CONFIG.ENDPOINTS.PARTNERS;

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface PartnerQueryOptions {
    type?: 'CLIENT' | 'SUPPLIER';
    page?: number;
    limit?: number;
    search?: string;
}

export const partnerService = {
    async getAll(options: PartnerQueryOptions = {}): Promise<PaginatedResponse<Partner>> {
        const token = localStorage.getItem('token');

        // Build query string
        const params = new URLSearchParams();
        if (options.type) params.append('type', options.type);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.search) params.append('search', options.search);

        const response = await fetch(`${API_URL}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar parceiros');
        }

        return response.json();
    },

    async create(partner: Partial<Partner>): Promise<Partner> {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(partner),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar parceiro');
        }

        return response.json();
    },

    async update(id: string, partner: Partial<Partner>): Promise<Partner> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(partner),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao atualizar parceiro');
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
            throw new Error('Falha ao deletar parceiro');
        }
    }
};
