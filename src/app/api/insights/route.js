import { connectMongo } from '@/lib/mongodb';
import Task from '@/models/tasks';


export async function GET() {
  await connectMongo();

  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'Completed' });
  const overdueTasks = await Task.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $ne: 'Completed' },
  });

  const tasksPerUser = await Task.aggregate([
    {
      $group: {
        _id: '$assignedTo',
        taskCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        name: '$user.username',
        taskCount: 1
      }
    }
  ]);

  return Response.json({ totalTasks, completedTasks, overdueTasks, tasksPerUser });
}
