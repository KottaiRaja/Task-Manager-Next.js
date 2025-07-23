import { connectMongo } from '@/lib/mongodb';
import { User } from '../../../models/User.js';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendResetEmail } from '@/lib/sendEmail';

export async function POST(req) {
  await connectMongo();

  const { email } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const resetToken = jwt.sign(
    { userId: user._id },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: '15m' }
  );

  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  try {
    await sendResetEmail(email, resetUrl);
    return NextResponse.json({
      success: true,
      message: 'Reset link sent to email',
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send email',
    }, { status: 500 });
  }
}
