import { Request, Response, NextFunction } from 'express';

export const checkPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Admin has full access
        if (user.role === 'ADMIN') {
            next();
            return;
        }

        if (user.permissions && user.permissions.includes(requiredPermission)) {
            next();
            return;
        }

        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    };
};
