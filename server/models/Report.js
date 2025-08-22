import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalIssues: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Report', reportSchema);