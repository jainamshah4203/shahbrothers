import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

function toPublicUser(u: any) {
  return { _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt };
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: String(email).toLowerCase(), passwordHash, role: 'user' });

    const token = signAccessToken(String(user._id), user.role);
    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signAccessToken(String(user._id), user.role);
    return res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

function signAccessToken(userId: string, role: 'user' | 'admin') {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];
  // Put subject into payload as 'sub' to avoid option overloading issues
  return jwt.sign({ sub: userId, role }, secret as Secret, { expiresIn } as SignOptions);
}

