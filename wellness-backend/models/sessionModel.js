import { model, Schema } from "mongoose";

const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1d' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deviceInfo: {
    type: Object,
    required: false
  }
}, { timestamps: true });

const Session = model('Session', sessionSchema);

export default Session;