import mongoose from 'mongoose';

export const DEAL_STAGES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

const dealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  value: { type: Number, required: true, min: 0, default: 0 },
  stage: { type: String, enum: DEAL_STAGES, default: 'New' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);