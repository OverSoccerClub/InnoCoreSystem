import { API_CONFIG } from '../config/api.config';
const API_BASE_URL = API_CONFIG.ENDPOINTS.ACCOUNTS_PAYABLE;

const API_URL = `${API_BASE_URL}/accounts/payable`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export interface AccountsPayable {
    id: string;
    description: string;
    partnerId: string;
    partner: {
        id: string;
        name: string;
    };
    accountId: string;
    account: {
        id: string;
        code: string;
        name: string;
    };
    amount: number;
    issueDate: string;
    dueDate: string;
    paidAt?: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paidAmount?: number;
    paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
    purchaseId?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountsPayableDto {
    description: string;
    partnerId: string;
    accountId: string;
    amount: number;
    dueDate: string;
    issueDate?: string;
    paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
    purchaseId?: string;
    notes?: string;
}

export interface UpdateAccountsPayableDto extends Partial<CreateAccountsPayableDto> { }

export interface PayAccountsPayableDto {
    paidAmount: number;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
    paidAt?: string;
}

export interface AccountsPayableStats {
    pending: { amount: number; count: number };
    overdue: { amount: number; count: number };
    paid: { amount: number; count: number };
    total: { amount: number; count: number };
}

export const accountsPayableService = {
    async getAll(params?: { status?: string; partnerId?: string; page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.partnerId) queryParams.append('partnerId', params.partnerId);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const url = queryParams.toString() ? `${API_URL}?${queryParams}` : API_URL;
        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch accounts payable');
        return response.json();
    },

    async getStats() {
        const response = await fetch(`${API_URL}/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    async create(data: CreateAccountsPayableDto) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create account payable');
        return response.json();
    },

    async update(id: string, data: UpdateAccountsPayableDto) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update account payable');
        return response.json();
    },

    async pay(id: string, data: PayAccountsPayableDto) {
        const response = await fetch(`${API_URL}/${id}/pay`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to register payment');
        return response.json();
    },

    async cancel(id: string) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to cancel account payable');
        return response.json();
    },
};
