import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb';
import Activity from '@/models/Activity'

export async function POST(req) {
  await connectMongo()
  const { user, action, targetType, targetId, message } = await req.json()

  try {
    const activity = await Activity.create({
      user,
      action,
      targetType,
      targetId,
      message,
    })

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  await connectMongo()

    try {
    const activities = await Activity.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user', 
        },
      },
      {
        $unwind: {path: '$user', preserveNullAndEmptyArrays: true},
      },
      {
        $project: {
          _id: 1,
          action: 1,
          targetType: 1,
          targetId: 1,
          message: 1,
          timestamp: 1,
          taskTitle: 1,
          user: {
            _id: 1,
            username: 1,
            role: 1,
            email: 1,
          },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
    ])

    console.log('Fetched activities:', activities)
    return NextResponse.json(activities)
    } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  } 
}
