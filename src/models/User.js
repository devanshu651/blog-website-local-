const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false, minlength: 12 },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }
}, { timestamps: true, strict: 'throw' });

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.checkPassword = function checkPassword(password) { return bcrypt.compare(password, this.password); };

module.exports = mongoose.model('User', userSchema);
