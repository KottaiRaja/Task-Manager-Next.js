import { connectMongo } from '@/lib/mongodb';
import Task from '@/models/tasks';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Activity from '@/models/Activity';

export async function GET(request, { params }) {
  await connectMongo();

  try {
    const { id } = await params;
    // Log activity for fetching task
    const user = await verifyToken(request.headers.get('cookie')?.token);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const task = await Task.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (user) {
      await Activity.create({
        user: new mongoose.Types.ObjectId(user.id),
        action: 'fetched',
        targetType: 'task',
        targetId: id,
        taskTitle: task.title,
        message: `Fetched task with ID: ${id}`,
      });
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

    const user = await verifyToken(req.headers.get('cookie')?.token);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    if (user) {
      
      await Activity.create({
        user: new mongoose.Types.ObjectId(user.id),
        action: 'updated',
        targetType: 'task',
        targetId: params.id,
        taskTitle: body.title,
        message: `Updated task with ID: ${params.id}`,
      });
    }

    const updatedItem = await Task.updateOne({ _id: new mongoose.Types.ObjectId(params.id) }, { $set: body }, { new: true });
    return NextResponse.json(updatedItem);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectMongo();
  try {
    let { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const taskName = await Task.findOne({ _id: new mongoose.Types.ObjectId(id) });

    const deleted = await Task.deleteOne({ _id: id });
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const user = await verifyToken(request.headers.get('cookie')?.token);

    if (user) {
      await Activity.create({
        user: new mongoose.Types.ObjectId(user.id),
        action: 'deleted',
        targetType: 'task',
        targetId: id,
        taskTitle: taskName.title,
        message: `Deleted task with ID: ${id}`,
      });
    } 

    return NextResponse.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return NextResponse.json({ error: 'Invalid ID or deletion error' }, { status: 400 });
  }
}
