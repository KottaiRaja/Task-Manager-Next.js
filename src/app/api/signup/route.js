import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User'
import Activity from '@/models/Activity';

export async function POST(req) {
  try {
    await connectMongo()
    const { username, email, password, confirmPassword } = await req.json()

    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({username, email, password: hashedPassword})

    await newUser.save()

    // Log activity for user registration
    await Activity.create({
      user: new mongoose.Types.ObjectId(newUser._id),
      action: 'registered',
      targetType: 'user',
      targetId: newUser._id,
      message: `User registered with email: ${email}`,
    })

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}
