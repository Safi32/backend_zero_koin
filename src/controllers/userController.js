const User = require('../models/User');
const crypto = require('crypto');

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 34; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

exports.registerUser = async (req, res) => {
  try {
    let inviteCode = generateInviteCode();
    while (await User.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }
    const user = new User({ inviteCode });
    await user.save();
    res.status(201).json({ inviteCode });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

exports.getInviteDetails = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const user = await User.findOne({ inviteCode });
    if (!user) return res.status(404).json({ message: 'Invite not found' });
    res.json({ inviteCode, recentAmount: user.recentAmount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invite details' });
  }
};

exports.processReferral = async (req, res) => {
  try {
    const { inviteCode, referredBy } = req.body;
    console.log('Processing referral:', { inviteCode, referredBy });

    const referrer = await User.findOne({ inviteCode: referredBy });
    if (!referrer) return res.status(400).json({ message: 'Invalid referrer invite code' });

    let newInviteCode = generateInviteCode();
    while (await User.findOne({ inviteCode: newInviteCode })) {
      newInviteCode = generateInviteCode();
    }

    const newUser = new User({ inviteCode: newInviteCode, referredBy });
    await newUser.save();

    referrer.recentAmount += 50;
    await referrer.save();

    res.status(200).json({ message: 'Referral processed', recentAmount: referrer.recentAmount });
  } catch (error) {
    console.error('Referral error:', error.message);
    res.status(500).json({ message: 'Error processing referral', error: error.message });
  }
};

exports.syncFirebaseUser = async (req, res) => {
  try {
    const { uid, email, name } = req.user; // From Firebase auth middleware
    console.log('🔥 Syncing Firebase user:', { uid, email, name });

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // Update existing user data
      console.log('📝 Updating existing user:', user.inviteCode);
      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();

      res.status(200).json({
        message: 'User data updated successfully',
        user: {
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          inviteCode: user.inviteCode,
          recentAmount: user.recentAmount,
          balance: user.balance,
          walletAddresses: user.walletAddresses || { metamask: null, trustWallet: null }
        }
      });
    } else {
      // Create new user with Firebase data
      console.log('✨ Creating new user for Firebase UID:', uid);
      let inviteCode = generateInviteCode();
      while (await User.findOne({ inviteCode })) {
        inviteCode = generateInviteCode();
      }

      const newUser = new User({
        firebaseUid: uid,
        name: name,
        email: email,
        inviteCode: inviteCode
      });

      await newUser.save();
      console.log('✅ User created successfully with invite code:', inviteCode);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          firebaseUid: newUser.firebaseUid,
          name: newUser.name,
          email: newUser.email,
          inviteCode: newUser.inviteCode,
          recentAmount: newUser.recentAmount,
          balance: newUser.balance,
          walletAddresses: newUser.walletAddresses || { metamask: null, trustWallet: null }
        }
      });
    }
  } catch (error) {
    console.error('Firebase user sync error:', error.message);
    res.status(500).json({ message: 'Error syncing user data', error: error.message });
  }
};

// Get user profile (Firebase authenticated)
exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user; // From Firebase auth middleware

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        inviteCode: user.inviteCode,
        referredBy: user.referredBy,
        recentAmount: user.recentAmount,
        balance: user.balance,
        walletAddresses: user.walletAddresses || { metamask: null, trustWallet: null },
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error.message);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Update wallet addresses (Firebase authenticated)
exports.updateWalletAddress = async (req, res) => {
  try {
    const { uid } = req.user; // From Firebase auth middleware
    const { walletType, address } = req.body;

    // Validate wallet type
    if (!['metamask', 'trustWallet'].includes(walletType)) {
      return res.status(400).json({ message: 'Invalid wallet type. Must be "metamask" or "trustWallet"' });
    }

    // Validate Ethereum address format
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ message: 'Address is required and must be a string' });
    }

    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(address)) {
      return res.status(400).json({ message: 'Invalid Ethereum address format' });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize walletAddresses if it doesn't exist
    if (!user.walletAddresses) {
      user.walletAddresses = { metamask: null, trustWallet: null };
    }

    // Update the specific wallet address
    user.walletAddresses[walletType] = address;

    // Mark the nested object as modified for Mongoose
    user.markModified('walletAddresses');

    await user.save();

    console.log(`💰 Updated ${walletType} wallet address for user ${user.inviteCode}: ${address}`);

    res.status(200).json({
      message: `${walletType} wallet address updated successfully`,
      walletAddresses: user.walletAddresses
    });
  } catch (error) {
    console.error('Update wallet address error:', error.message);
    res.status(500).json({ message: 'Error updating wallet address', error: error.message });
  }
};