import mongoose, { isValidObjectId } from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  userIds: {
    type: [String],
    default: [],
  },
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  assignedUser: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }],
  assignedToManager: Boolean,
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending',
  },
  imageUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export default mongoose.models.User || mongoose.model('User', userSchema);