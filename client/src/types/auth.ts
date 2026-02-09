export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type PermissionResource =
    | 'dashboard'
    | 'users'
    | 'products'
    | 'categories'
    | 'inventory'
    | 'purchases'
    | 'sales'
    | 'partners'
    | 'financial'
    | 'accounts_receivable'
    | 'accounts_payable'
    | 'chart_of_accounts'
    | 'fiscal'
    | 'settings'
    | 'company';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
    permissions: string[]; // Format: "resource.action" e.g. "products.create"
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
