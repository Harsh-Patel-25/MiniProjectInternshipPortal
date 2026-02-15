const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number
  }],
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  resume: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
