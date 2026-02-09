import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { PermissionResource, PermissionAction } from '../types/auth';

interface PermissionGateProps {
    resource: PermissionResource;
    action: PermissionAction;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    resource,
    action,
    children,
    fallback = null
}) => {
    const { can } = usePermission();

    if (can(resource, action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
