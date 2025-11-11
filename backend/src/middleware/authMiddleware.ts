import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 Authenticate middleware called for:', req.method, req.path);
  // 1️⃣ Try Authorization header first
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // 2️⃣ Fallback: try cookie named "accessToken"
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 3️⃣ If no token found
  if (!token) {
    return res.status(401).json({ message: 'No token provided!' });
  }

  try {
    // 4️⃣ Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    // 5️⃣ Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
