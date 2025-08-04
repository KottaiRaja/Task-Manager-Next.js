import { connectMongo } from '@/lib/mongodb';
import { parse } from 'cookie';
import Task from '@/models/tasks';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request) {
  await connectMongo();

  const cookieHeader = request.headers.get('cookie') || '';
  const token = parse(cookieHeader)?.token;


  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 15;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';

  const type = searchParams.get('type') || '';

  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  let query = {};

  if (user.role === 'manager') {
    query.createdBy = user.id;
  } else if (user.role === 'user') {
    query.assignedTo = user.id; // or match by `email` if needed
  }

  if (type === 'fullTask') {
    const tasks = await Task.find(query).sort({ createdAt: 1 }); // Sort by oldest first

    // Add "Task 1", "Task 2", ... to each task
    const numberedTasks = tasks.map((task, index) => ({
      ...task.toObject(), // Convert Mongoose document to plain object
      name: `Task ${index + 1}`,
    }));

    return NextResponse.json({ tasks: numberedTasks });
  }

  const skip = (page - 1) * limit;

  // Build role-based query


  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (status && status !== 'All') {
    query.status = status;
  }
  if (priority && priority !== 'All') {
    query.priority = priority;
  }
  


  const total = await Task.countDocuments(query);
  
  console.log('Fetching tasks with query:', query, 'Page:', page, 'Limit:', limit);

  const tasks = await Task.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return NextResponse.json({ tasks, total, page, limit });
}


export async function POST(req) {
  try {
    await connectMongo();

    const cookieHeader = req.headers.get('cookie') || '';
    const token = parse(cookieHeader)?.token;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, priority, dueDate, assignedTo } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo,
      createdBy: new mongoose.Types.ObjectId(user.id),
    };

    console.log('Creating task with data:', taskData);

    const newItem = await Task.insertOne(taskData);

    if (!newItem) {
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error('Error creating task:', err);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
