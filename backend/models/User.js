const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  profilePic: { type: String, default: '' },
  profilePicPublicId: { type: String, default: '' },
  bio:        { type: String, default: '', maxlength: 150 },
  isOnline:   { type: Boolean, default: false },
  lastSeen:   { type: Date, default: Date.now },
  // Store refresh tokens for multi-device support
  refreshTokens: [{ type: String }],
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
