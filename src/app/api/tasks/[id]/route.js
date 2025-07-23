import { connectMongo } from '@/lib/mongodb';
import Task from '@/models/tasks';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  await connectMongo();

  try {
    const { id } = await params;
    const task = await Task.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongo();
    const body = await req.json();
    const updatedItem = await Task.updateOne({ _id: new mongoose.Types.ObjectId(params.id) }, { $set: body }, { new: true });
    return NextResponse.json(updatedItem);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectMongo();
  try {
    const id = new mongoose.Types.ObjectId(params.id);
    const deleted = await Task.deleteOne({ _id: id });
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return NextResponse.json({ error: 'Invalid ID or deletion error' }, { status: 400 });
  }
}
