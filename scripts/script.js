// scripts/seedTasks.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Tasks from '../src/models/tasks.js';

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

function getRandomStatus() {
  const statuses = ['Pending', 'In Progress', 'Completed'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomPriority() {
  const priorities = ['Low', 'Medium', 'High'];
  return priorities[Math.floor(Math.random() * priorities.length)];
}

async function seedTasks() {
  await connectMongo();

  const tasks = [];

  for (let i = 1; i <= 1000; i++) {
    tasks.push({
      title: `Task ${i}: ${faker.hacker.phrase()}`,
      description: faker.lorem.sentences(2),
      status: getRandomStatus(),
      priority: getRandomPriority(),
      dueDate: faker.date.soon({ days: 30 }),
      email: faker.internet.email(),
    });
  }

  try {
    await Tasks.insertMany(tasks);
    console.log(`✅ Inserted ${tasks.length} tasks`);
  } catch (err) {
    console.error('❌ Insert error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedTasks();
