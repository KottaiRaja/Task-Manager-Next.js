import { connectMongo } from '@/lib/mongodb';
import { User } from '@/models/User';
import mongoose from 'mongoose'; // You’ll create this
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';



export async function GET(req) {
    await connectMongo();

    try {

        const cookieHeader = req.headers.get('cookie') || '';
        const token = parse(cookieHeader)?.token;
        const user = await verifyToken(token);

        if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        let users
        if (user.role === 'manager') {

            users = await User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(user.id) } },
                {
                    $lookup: {
                        from: 'users',
                        let: { assignedUserIds: '$assignedUser' }, // assignedUser is an array
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$assignedUserIds']
                                    }
                                }
                            },
                            {
                                $project: {
                                    username: 1,
                                    email: 1,
                                    role: 1,
                                    _id: 1
                                }
                            }
                        ],
                        as: 'userRole'
                    }
                }
            ]);

            users = users[0]?.userRole || [];
        } else {
            users = await User.find({ role: { $ne: 'admin' }})
                .select('username email role _id')
        }

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { message: 'Failed to fetch users', error: error.message },
            { status: 500 }
        );
    }
}