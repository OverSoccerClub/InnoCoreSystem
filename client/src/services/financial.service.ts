import { API_CONFIG } from '../config/api.config';
export interface FinancialTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    status: 'PENDING' | 'PAID';
    dueDate: string;
    paidAt?: string | null;
    category: string;
    partnerId?: string | null;
    partner?: { name: string };
    userId?: string;
    user?: { name: string };
    createdAt: string;
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

const API_URL = API_CONFIG.ENDPOINTS.FINANCIAL;

export const financialService = {
    async getTransactions(params?: any): Promise<PaginatedResponse<FinancialTransaction>> {
        const token = localStorage.getItem('token');
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}?${query}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Falha ao buscar transações');
        return response.json();
    },

    async createTransaction(data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error creating transaction');
        }
        return response.json();
    },

    async updateTransaction(id: string, data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Error updating transaction');
        return response.json();
    },

    async deleteTransaction(id: string): Promise<void> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error deleting transaction');
    },

    async getStats(): Promise<any[]> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Error fetching stats');
        return response.json();
    }
};
