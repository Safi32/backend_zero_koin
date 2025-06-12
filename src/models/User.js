const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  referredBy: {
    type: String,
    default: null
  },
  recentAmount: {
    type: Number,
    default: 0
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  balance: {
    type: Number,
    default: 0
  },
  walletAddresses: {
    metamask: {
      type: String,
      default: null
    },
    trustWallet: {
      type: String,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);