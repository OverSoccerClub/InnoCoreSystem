import { API_CONFIG } from '../config/api.config';

const API_URL = API_CONFIG.ENDPOINTS.PURCHASES;

export interface PurchaseItem {
    id?: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total?: number;
    product?: {
        name: string;
        sku: string;
    };
}

export interface Purchase {
    id: string;
    partnerId: string;
    invoiceNumber?: string;
    invoiceSeries?: string;
    invoiceKey?: string;
    issueDate?: string;
    total: number;
    status: string;
    items: PurchaseItem[];
    partner?: {
        name: string;
    };
    createdAt: string;
}

export const purchaseService = {
    async getAll(params?: { page?: number; limit?: number; partnerId?: string }): Promise<{ data: Purchase[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.partnerId) queryParams.append('partnerId', params.partnerId);

        const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Falha ao buscar compras');
        return response.json();
    },

    async getById(id: string): Promise<Purchase> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Falha ao buscar compra');
        return response.json();
    },

    async create(data: Partial<Purchase>): Promise<Purchase> {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Falha ao registrar compra');
        }
        return response.json();
    }
};
