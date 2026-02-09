export interface StockMovement {
    id: string;
    productId: string;
    userId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    referenceId?: string;
    createdAt: string;
    product?: { name: string; sku: string };
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

const API_URL = 'http://localhost:3001/api/inventory';

export const inventoryService = {
    async getMovements(params?: {
        productId?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<StockMovement>> {
        const token = localStorage.getItem('token');

        const queryParams = new URLSearchParams();
        if (params?.productId) queryParams.append('productId', params.productId);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_URL}/movements?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar movimentações');
        }

        return response.json();
    },

    async adjustStock(data: { productId: string; type: 'IN' | 'OUT'; quantity: number; reason: string }): Promise<void> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/adjust`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao ajustar estoque');
        }
    }
};
