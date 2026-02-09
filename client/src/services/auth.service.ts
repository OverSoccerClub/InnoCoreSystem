import type { LoginCredentials, AuthResponse, RegisterData } from '../types/auth';
import { API_CONFIG } from '../config/api.config';

const API_URL = API_CONFIG.ENDPOINTS.AUTH;

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao realizar login');
        }

        return response.json();
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao registrar usuário');
        }

        return response.json();
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    getToken() {
        return localStorage.getItem('token');
    }
};
