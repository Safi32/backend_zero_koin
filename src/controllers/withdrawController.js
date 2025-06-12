const Withdrawal = require('../models/withdraw');
const User = require('../models/User');

// Withdraw coins
exports.withdrawCoins = async (req, res) => {
  const { amount, walletAddress } = req.body;
  const userId = req.user._id;

  if (!amount || !walletAddress) return res.status(400).json({ message: 'Amount and wallet address required' });

  const user = await User.findById(userId);
  // User must have at least 4000 in balance to withdraw, regardless of amount
  if (!user || user.balance < 4000) return res.status(400).json({ message: 'You must have at least 4000 balance to withdraw.' });
  if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

  user.balance -= amount;
  await user.save();

  const withdrawal = await Withdrawal.create({ user: userId, amount, walletAddress, status: 'pending' });
  res.status(201).json({ message: 'Withdrawal requested', withdrawal });
};

// Get withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin ? {} : { user: req.user._id };
  const history = await Withdrawal.find(filter).populate('user', 'email');
  res.json(history);
};