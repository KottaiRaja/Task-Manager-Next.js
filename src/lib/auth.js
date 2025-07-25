// src/lib/auth.js

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_default_secret_key';

export function generateToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}
