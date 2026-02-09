import { API_CONFIG } from '../config/api.config';
import type { User } from '../types/auth';

const API_URL = API_CONFIG.ENDPOINTS.USERS;

export const userService = {
    async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: User[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
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

        if (!response.ok) {
            throw new Error('Falha ao buscar usuários');
        }

        return response.json();
    },

    async create(user: Partial<User> & { password?: string }): Promise<User> {
        const token = localStorage.getItem('token');
        // Using auth endpoint for registration is possible, or a dedicated user create endpoint.
        // For now, let's assume we use the auth register logic BUT passing the token to allow admin creation.
        // Wait, the backend usually has a separate user create route for admins or we reuse register.
        // Let's check backend routes. Route /api/users usually is for management.
        // Assuming POST /api/auth/register is open, but we want an authenticated way or we duplicate logic.
        // Let's use the implementation from user.controller. Wait, user.controller only had update/delete/get.
        // I need to add 'create' to user.controller or use auth/register.
        // Let's use auth/register for now but call it from here? No, auth/register logs you in.
        // I should probably add a create method to user.controller in the backend next. 
        // For now I will mock the call to point to /api/auth/register but realistically we should fix the backend.

        // Let's assume we'll fix the backend to have POST /api/users
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar usuário');
        }

        return response.json();
    },

    async update(id: string, user: Partial<User>): Promise<User> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao atualizar usuário');
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
            throw new Error('Falha ao deletar usuário');
        }
    }
};
