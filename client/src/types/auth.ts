export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
    permissions: string[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    name: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
