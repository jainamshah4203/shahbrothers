import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  userId?: string;
  role?: 'user' | 'admin';
}

function verifyToken(authHeader?: string): { userId?: string; role?: 'user' | 'admin' } {
  try {
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) return {};
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const payload = jwt.verify(token, secret) as { sub?: string; role?: 'user' | 'admin' };
    return { userId: payload.sub, role: payload.role || 'user' };
  } catch {
    return {};
  }
}

// Optional auth: attach userId/role if valid JWT, otherwise continue anonymously.
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const { userId, role } = verifyToken(req.headers.authorization);
  if (userId) {
    req.userId = userId;
    req.role = role;
  }
  next();
}

// Require a valid JWT
export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const { userId, role } = verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.userId = userId;
  req.role = role;
  next();
}

// Require admin role
export function adminRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const { userId, role } = verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  req.userId = userId;
  req.role = role;
  next();
}
