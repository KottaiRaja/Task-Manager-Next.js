import Task from '../src/models/tasks.js';
import User from '../src/models/User.js';

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connectMongo() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function assignTaskAuto(taskData) {

    await connectMongo();
    // Step 1: Find eligible users
    const eligibleUsers = await User.find({ role: 'user', status: 'active' });

    if (!eligibleUsers.length) {
        throw new Error('No active users with role "user" available for task assignment.');
    }

    let tasks = await Task.find({ status: 'In Progress' });

    if (!tasks.length) {
        console.log('No pending tasks to assign.');
        return;
    }

    // Step 2: Assign tasks to users
    for (let task of tasks) {
        const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
        task.assignedTo = new mongoose.Types.ObjectId(randomUser._id); // Assign the user ID
        task.status = 'In Progress'; // Update task status to In Progress
    }

    console.log(`✅ Assigned ${tasks.length} tasks to users successfully.`);

    // Step 3: Save updated tasks
    try {
        await Task.bulkWrite(
            tasks.map(task => ({
                updateOne: {
                    filter: { _id: task._id },
                    update: { assignedTo: new mongoose.Types.ObjectId(task.assignedTo), status: task.status }
                }
            }))
        );
        console.log(`✅ Assigned ${tasks.length} tasks to users successfully.`);
    } catch (error) {
        console.error('❌ Error assigning tasks:', error);
        throw new Error('Failed to assign tasks');
    }

}

assignTaskAuto()
