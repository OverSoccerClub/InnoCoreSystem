import { useAuth } from '../contexts/AuthContext';

export const usePermission = (requiredPermission: string): boolean => {
    const { user } = useAuth();

    if (!user) return false;

    // Admin has full access
    if (user.role === 'ADMIN') return true;

    // Check if user has the specific permission
    return user.permissions?.includes(requiredPermission) || false;
};
