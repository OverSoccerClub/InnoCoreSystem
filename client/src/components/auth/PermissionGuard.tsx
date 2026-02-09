import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface PermissionGuardProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    children,
    fallback = null
}) => {
    const { user } = usePermission();

    // Admin has full access
    if (user?.role === 'ADMIN') {
        return <>{children}</>;
    }

    const hasPermission = user?.permissions?.includes(permission);

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
