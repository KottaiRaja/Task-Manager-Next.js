import { connectMongo } from '@/lib/mongodb';
import Task from '@/models/tasks';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await connectMongo();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 5;
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  // Build query
  const query = search
    ? { title: { $regex: search, $options: 'i' } }
    : {};

  const total = await Task.countDocuments(query);

  const tasks = await Task.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: 1 });

  return NextResponse.json({ tasks, total, page, limit });
}


export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    const { title, description, status, priority, dueDate, email } = body;
    if (!title) {
      return Response.json({ error: 'Title is required' }, {
        status:
          400
      });
    }
    if (dueDate) {
      body.dueDate = new Date(dueDate);
    }
    const newItem = await Task.insertOne({
      title,
      description,
      status,
      priority,
      dueDate: body.dueDate || null,
      email
    });

    if (!newItem) {
      return Response.json({ error: 'Failed to create item' }, { status: 500 });
    }
    return Response.json(newItem, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
