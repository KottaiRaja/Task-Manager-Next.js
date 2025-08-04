import { connectMongo } from '@/lib/mongodb'
import { User } from '@/models/User'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  await connectMongo()

  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, message: 'Missing token or password' }, { status: 400 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET)
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 })
    }
    console.log(decoded)
    const user = await User.findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.status = 'active' // Ensure the user is active after password reset
    await user.save()

    return NextResponse.json({ success: true, message: 'Password reset successful' })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
