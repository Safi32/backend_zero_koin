const Token = require('../models/Token');

const saveToken = async (req, res) => {
  const { token_id } = req.body;

  if (!token_id) {
    return res.status(400).json({ message: 'token_id is required' });
  }

  try {
    const newToken = new Token({
      tokenId: token_id
    });

    await newToken.save();

    res.status(201).json({ message: 'Token saved successfully', token: newToken });
  } catch (error) {
    console.error('Error saving token:', error);
    // Handle duplicate key error specifically if unique index is used
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Token ID already exists' });
    }
    res.status(500).json({ message: 'Failed to save token' });
  }
};

module.exports = {
  saveToken
}; 