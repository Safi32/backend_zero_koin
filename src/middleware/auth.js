// Dummy middleware for demonstration. Replace with real Firebase token verification!
const User = require('../models/User');
module.exports = async (req, res, next) => {
  // In production, verify token and get user info
  // For now, simulate user
  const user = await User.findOne(); // Get any user for testing
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user;
  next();
};