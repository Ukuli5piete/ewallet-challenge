const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  walletBalance: {
    type: Number,
    default: 1000,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
