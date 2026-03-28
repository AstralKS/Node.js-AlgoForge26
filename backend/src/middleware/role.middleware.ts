import { Request, Response, NextFunction } from 'express';

/**
 * Simple role middleware — no JWT, reads from x-user-role header or query param
 * For testing purposes only. In production, replace with proper auth.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.headers['x-user-role'] as string) || (req.query.role as string);
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

    if (!role || !roles.includes(role)) {
      res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Required role: ${roles.join(' or ')}. Provide x-user-role header.`,
          code: 'FORBIDDEN',
        },
      });
      return;
    }

    // Attach to request for downstream use
    (req as any).userRole = role;
    (req as any).userId = userId || 'anonymous';

    next();
  };
}
