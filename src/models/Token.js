const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true // Assuming each token ID should be unique
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d' // Optional: Automatically remove tokens after 7 days
  }
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token; 