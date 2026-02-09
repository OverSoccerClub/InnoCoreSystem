
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
    const hasPermission = usePermission(permission);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
