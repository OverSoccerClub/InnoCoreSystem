const API_BASE_URL = 'http://localhost:3001/api';

const API_URL = `${API_BASE_URL}/accounts/receivable`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export interface AccountsReceivable {
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
    saleId?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountsReceivableDto {
    description: string;
    partnerId: string;
    accountId: string;
    amount: number;
    dueDate: string;
    issueDate?: string;
    paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
    saleId?: string;
    notes?: string;
}

export interface UpdateAccountsReceivableDto extends Partial<CreateAccountsReceivableDto> { }

export interface PayAccountsReceivableDto {
    paidAmount: number;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
    paidAt?: string;
}

export interface AccountsReceivableStats {
    pending: { amount: number; count: number };
    overdue: { amount: number; count: number };
    paid: { amount: number; count: number };
    total: { amount: number; count: number };
}

export const accountsReceivableService = {
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
        if (!response.ok) throw new Error('Failed to fetch accounts receivable');
        return response.json();
    },

    async getStats() {
        const response = await fetch(`${API_URL}/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    async create(data: CreateAccountsReceivableDto) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create account receivable');
        return response.json();
    },

    async update(id: string, data: UpdateAccountsReceivableDto) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update account receivable');
        return response.json();
    },

    async pay(id: string, data: PayAccountsReceivableDto) {
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
        if (!response.ok) throw new Error('Failed to cancel account receivable');
        return response.json();
    },
};
