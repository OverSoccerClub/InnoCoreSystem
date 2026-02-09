import { useAuth } from '../contexts/AuthContext';
import { PermissionResource, PermissionAction } from '../types/auth';

export const usePermission = () => {
    const { user } = useAuth();

    const can = (resource: PermissionResource, action: PermissionAction): boolean => {
        if (!user) return false;

        // Admin has full access
        if (user.role === 'ADMIN') return true;

        // Construct permission string
        const permission = `${resource}.${action}`;

        // Check if user has permission
        return user.permissions?.includes(permission) || false;
    };

    const hasRole = (roles: string[]): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    return { can, hasRole, user };
};
