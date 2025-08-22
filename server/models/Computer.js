import mongoose from 'mongoose';

const computerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  macAddress: {
    type: String,
    required: true,
    unique: true
  },
  specs: {
    cpu: String,
    ram: String,
    storage: String,
    os: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  operationalStatus: {
    type: String,
    enum: ['available', 'in-use', 'maintenance'],
    default: 'available'
  }
}, { timestamps: true });

export default mongoose.model('Computer', computerSchema);