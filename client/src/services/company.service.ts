import type { Company } from '../types/company';

const API_URL = 'http://localhost:3001/api/company';

export const companyService = {
    async getCompany(): Promise<Company | null> {
        const token = localStorage.getItem('token');

        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Falha ao buscar dados da empresa');
        }

        return response.json();
    },

    async saveCompany(data: Partial<Company>): Promise<Company> {
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
            throw new Error(error.message || 'Falha ao salvar dados da empresa');
        }

        return response.json();
    }
};
