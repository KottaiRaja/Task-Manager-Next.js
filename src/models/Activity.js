import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
  },
  targetId: {
    type: String,
  },
  message: {
    type: String,
  },
  taskTitle: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema)
