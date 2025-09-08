const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);

module.exports = PasswordReset;