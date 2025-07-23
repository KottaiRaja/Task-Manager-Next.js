import mongoose from 'mongoose';

const TasksSchema = new mongoose.Schema(
  {
    title: String,
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    dueDate: Date,
    email: String,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.models.Tasks || mongoose.model('Tasks', TasksSchema);
