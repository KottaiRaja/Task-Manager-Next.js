import { connectMongo } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendResetEmail } from '@/lib/sendEmail'; // You’ll create this
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    await connectMongo();
    const { username, email, password, role, assignedUser, imageUrl } = await req.json();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    let hashedPassword = '';
    let isAdminCreating = !password;

    let status = 'pending'; // Default status for new users

    if (!isAdminCreating) {
        hashedPassword = await bcrypt.hash(password, 10);
        status = 'active'; // Set status to active if password is provided
    }

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
        assignedToManager: false,
        assignedUser,
        status,
        imageUrl,
    });

    if (assignedUser && assignedUser.length > 0) {
        // If assignedUser is provided, update the assignedManager field
        await User.updateMany(
            { _id: { $in: assignedUser } },
            { $set: { assignedToManager: true } }
        );
    }

    // If admin created the user (no password), send reset password email
    if (isAdminCreating) {
        const resetToken = jwt.sign(
            { userId: newUser._id },
            process.env.RESET_PASSWORD_SECRET,
            { expiresIn: '15m' }
        );

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        await sendResetEmail(email, resetUrl);
    }

    return NextResponse.json(newUser);
}


export async function GET(req) {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // e.g., 'user'

    try {
        const query = {};

        if (role) {
            query.role = role;
        }


        query.$or = [
    { assignedToManager: false },
    { assignedToManager: { $exists: false } }
  ]

        let users, total;

        if (role) {
            console.log(JSON.stringify(query))
            users = await User.find(query).select('-password').sort({ createdAt: -1 });
            console.log(users)
            total = users.length;
        } else {
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 15;
            const skip = (page - 1) * limit;

            users = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            total = await User.countDocuments(query);
        }

        return NextResponse.json({ users, total });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { message: 'Failed to fetch users', error: error.message },
            { status: 500 }
        );
    }
}
