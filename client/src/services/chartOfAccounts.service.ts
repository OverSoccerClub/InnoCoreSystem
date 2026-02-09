import { API_CONFIG } from '../config/api.config';
const API_URL = API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export interface ChartOfAccount {
    id: string;
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY';
    nature: 'DEBIT' | 'CREDIT';
    parentId?: string;
    active: boolean;
    parent?: ChartOfAccount;
    children?: ChartOfAccount[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateChartOfAccountDto {
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY';
    nature: 'DEBIT' | 'CREDIT';
    parentId?: string;
}

export interface UpdateChartOfAccountDto extends Partial<CreateChartOfAccountDto> { }

export const chartOfAccountsService = {
    async getAll(active?: boolean, params?: { page?: number; limit?: number; search?: string; type?: string; nature?: string }) {
        const queryParams = new URLSearchParams();
        if (active !== undefined) queryParams.append('active', active.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.nature) queryParams.append('nature', params.nature);

        const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch chart of accounts');
        return response.json();
    },

    async getById(id: string) {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch account');
        return response.json();
    },

    async create(data: CreateChartOfAccountDto) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create account');
        return response.json();
    },

    async update(id: string, data: UpdateChartOfAccountDto) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update account');
        return response.json();
    },

    async delete(id: string) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete account');
        return response.json();
    },
};
