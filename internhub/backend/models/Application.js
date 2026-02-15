const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'selected', 'rejected'],
    default: 'pending'
  },
  coverLetter: { type: String, default: '' },
  resume: { type: String, default: '' },
  answers: [{
    question: String,
    answer: String
  }],
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  feedback: { type: String, default: '' },
  interviewDate: { type: Date }
});

applicationSchema.index({ internshipId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
