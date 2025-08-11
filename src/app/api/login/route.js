import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectMongo();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          imageUrl: user.imageUrl || '',
        },
      },
      { status: 200 }
    );

    response.headers.set(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 1, // 7 days
      })
    );

    // Log activity for user login
    await Activity.create({
      user: new mongoose.Types.ObjectId(user._id),
      action: 'login',
      targetType: 'user',
      targetId: user._id,
      message: `User logged in with email: ${email}`,
    }); 

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
