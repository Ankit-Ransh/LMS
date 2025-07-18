import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: any, res: Response, next: NextFunction) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
} 