import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
  company: { type: String, trim: true, maxlength: 120, default: '' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);