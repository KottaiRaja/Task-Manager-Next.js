import { connectMongo } from '@/lib/mongodb';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// ✅ UPDATE USER by ID
export async function PUT(req, { params }) {
  await connectMongo();
  const { id } = params;
  const data = await req.json();

  try {

    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: data },
      { runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
  }
}

// ✅ DELETE USER by ID
export async function DELETE(req, { params }) {
  await connectMongo();
  const { id } = params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted', user: deletedUser });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user', error: error.message }, { status: 500 });
  }
}

// ✅ GET USER by ID (used for editing)
export async function GET(req, { params }) {
  await connectMongo();
  const { id } = params;

  try {
    const user = await User.findById(id).lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching user', error: error.message }, { status: 500 });
  }
}
