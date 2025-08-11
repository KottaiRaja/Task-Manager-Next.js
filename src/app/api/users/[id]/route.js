import { connectMongo } from '@/lib/mongodb';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Activity from '@/models/Activity';
// ✅ UPDATE USER by ID
export async function PUT(req, { params }) {

  await connectMongo();
  const { id } = await params;

  const data = await req.json();

  try {

    const updatedUser = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: data },
      { runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    
    // Log activity for user update
    await Activity.create({
      user: id,
      action: 'updated',
      targetType: 'user',
      targetId: id,
      message: `User with ID ${id} updated`,
    });

    return NextResponse.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
  }
}

// ✅ DELETE USER by ID
export async function DELETE(req, { params }) {
  await connectMongo();
  const { id } = await params;

  try {
    const deletedUser = await User.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (deletedUser.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user', error: error.message }, { status: 500 });
  }
}

// ✅ GET USER by ID (used for editing)
export async function GET(req, { params }) {
  await connectMongo();
  const { id } = await params;

  try {
    const user = await User.findOne({_id: new mongoose.Types.ObjectId(id) }).lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching user', error: error.message }, { status: 500 });
  }
}
