
const API_URL = 'http://localhost:3001/api/categories';

export interface Category {
    id: string;
    name: string;
    _count?: {
        products: number;
    };
    createdAt?: string;
}

export const categoryService = {
    async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: Category[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Falha ao buscar categorias');
        return response.json();
    },

    async create(name: string): Promise<Category> {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Falha ao criar categoria');
        }
        return response.json();
    },

    async update(id: string, name: string): Promise<Category> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Falha ao atualizar categoria');
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
            const error = await response.json();
            throw new Error(error.message || 'Falha ao excluir categoria');
        }
    }
};
