// src/lib/auth.js

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_default_secret_key';

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: '1d' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}
