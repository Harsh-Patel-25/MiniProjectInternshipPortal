const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyLogo: { type: String, default: '' },
  location: { type: String, required: true },
  type: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
  category: {
    type: String,
    enum: ['technology', 'marketing', 'design', 'finance', 'hr', 'sales', 'operations', 'data', 'engineering', 'other'],
    default: 'technology'
  },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  skills: [{ type: String }],
  stipend: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: ['paid', 'unpaid', 'performance-based'], default: 'paid' }
  },
  duration: { type: String, required: true },
  openings: { type: Number, default: 1 },
  applicationDeadline: { type: Date, required: true },
  startDate: { type: Date },
  perks: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

internshipSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Internship', internshipSchema);
