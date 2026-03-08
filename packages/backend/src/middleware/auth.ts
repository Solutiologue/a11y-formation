import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a11y-secret-key-2026';

export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  console.log('DEBUG AUTH HEADER:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('DEBUG AUTH: Missing or invalid header');
    return { error: 'Accès restreint. Token manquant.', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  console.log('DEBUG AUTH TOKEN:', token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    console.log('DEBUG AUTH DECODED:', decoded);
    return { user: decoded, userId: decoded.userId, status: 200 };
  } catch (err) {
    console.log('DEBUG AUTH JWT ERROR:', err);
    return { error: 'Token invalide ou expiré.', status: 403 };
  }
}
