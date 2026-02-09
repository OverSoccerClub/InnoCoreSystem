import { API_CONFIG } from '../config/api.config';
const API_BASE_URL = API_CONFIG.ENDPOINTS.FISCAL;

const API_URL = `${API_BASE_URL}/fiscal/invoices`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export interface Invoice {
    id: string;
    number: string;
    series: string;
    type: 'NFE' | 'NFCE' | 'NFSE';
    partnerId: string;
    partner: {
        id: string;
        name: string;
    };
    amount: number;
    status: 'DRAFT' | 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELLED';
    key?: string;
    protocol?: string;
    xml?: string;
    issueDate: string;
    authorizedAt?: string;
    saleId?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInvoiceDto {
    number: string;
    series?: string;
    type: 'NFE' | 'NFCE' | 'NFSE';
    partnerId: string;
    amount: number;
    saleId?: string;
    notes?: string;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> { }

export const fiscalService = {
    async getAll(params?: { status?: string; type?: string; page?: number; limit?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const url = queryParams.toString() ? `${API_URL}?${queryParams}` : API_URL;
        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        return response.json();
    },

    async getById(id: string) {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch invoice');
        return response.json();
    },

    async create(data: CreateInvoiceDto) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create invoice');
        return response.json();
    },

    async update(id: string, data: UpdateInvoiceDto) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update invoice');
        return response.json();
    },

    async transmit(id: string) {
        const response = await fetch(`${API_URL}/${id}/transmit`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to transmit invoice');
        return response.json();
    },

    async cancel(id: string) {
        const response = await fetch(`${API_URL}/${id}/cancel`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to cancel invoice');
        return response.json();
    },

    async downloadXml(id: string) {
        const response = await fetch(`${API_URL}/${id}/xml`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to download XML');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NFe-${id}.xml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
