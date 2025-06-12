#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: './src/.env' });
const readline = require('readline');

// MongoDB connection string - same as in app.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:root@cluster0.ye7aj3h.mongodb.net/zero_koin';

// Define User schema matching the one in the application
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, sparse: true },
  name: { type: String },
  email: { type: String, sparse: true },
  inviteCode: { type: String, required: true, unique: true },
  referredBy: { type: String },
  recentAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  walletAddresses: {
    metamask: { type: String, default: '' },
    trustWallet: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Console colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

// Format user object for display
function formatUser(user) {
  const userData = user.toObject();
  return `
${colors.bright}${colors.fg.cyan}User ID:${colors.reset} ${user._id}
${colors.bright}${colors.fg.cyan}Firebase UID:${colors.reset} ${user.firebaseUid || 'Not set'}
${colors.bright}${colors.fg.cyan}Name:${colors.reset} ${user.name || 'Not set'}
${colors.bright}${colors.fg.cyan}Email:${colors.reset} ${user.email || 'Not set'}
${colors.bright}${colors.fg.cyan}Invite Code:${colors.reset} ${user.inviteCode}
${colors.bright}${colors.fg.cyan}Referred By:${colors.reset} ${user.referredBy || 'None'}
${colors.bright}${colors.fg.cyan}Recent Amount:${colors.reset} ${user.recentAmount}
${colors.bright}${colors.fg.cyan}Balance:${colors.reset} ${user.balance}
${colors.bright}${colors.fg.cyan}MetaMask Address:${colors.reset} ${user.walletAddresses?.metamask || 'Not set'}
${colors.bright}${colors.fg.cyan}Trust Wallet Address:${colors.reset} ${user.walletAddresses?.trustWallet || 'Not set'}
${colors.bright}${colors.fg.cyan}Created At:${colors.reset} ${user.createdAt}
${colors.fg.yellow}${'-'.repeat(50)}${colors.reset}`;
}

// Function to find users by various criteria
async function findUsers(criteria = {}) {
  try {
    const users = await User.find(criteria).sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log(`${colors.fg.yellow}No users found matching the criteria.${colors.reset}`);
      return;
    }
    
    console.log(`${colors.fg.green}Found ${users.length} users:${colors.reset}`);
    users.forEach(user => {
      console.log(formatUser(user));
    });
  } catch (error) {
    console.error(`${colors.fg.red}Error finding users:${colors.reset}`, error);
  }
}

// Function to find a user by specific field
async function findUserByField(field, value) {
  try {
    const query = {};
    query[field] = value;
    
    const user = await User.findOne(query);
    
    if (!user) {
      console.log(`${colors.fg.yellow}No user found with ${field} = ${value}${colors.reset}`);
      return;
    }
    
    console.log(`${colors.fg.green}User found:${colors.reset}`);
    console.log(formatUser(user));
  } catch (error) {
    console.error(`${colors.fg.red}Error finding user:${colors.reset}`, error);
  }
}

// Function to show stats about users
async function showStats() {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithFirebase = await User.countDocuments({ firebaseUid: { $exists: true, $ne: null } });
    const usersWithReferrals = await User.countDocuments({ referredBy: { $exists: true, $ne: null } });
    
    const stats = [
      { name: 'Total Users', value: totalUsers },
      { name: 'Users with Firebase Auth', value: usersWithFirebase },
      { name: 'Users with Referrals', value: usersWithReferrals }
    ];
    
    console.log(`${colors.bg.blue}${colors.fg.white}${colors.bright} User Database Statistics ${colors.reset}`);
    stats.forEach(stat => {
      console.log(`${colors.fg.cyan}${stat.name}:${colors.reset} ${stat.value}`);
    });
  } catch (error) {
    console.error(`${colors.fg.red}Error getting stats:${colors.reset}`, error);
  }
}

// Interactive CLI menu
function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
${colors.bg.blue}${colors.fg.white}${colors.bright} MongoDB User Database Checker ${colors.reset}

${colors.fg.cyan}Select an option:${colors.reset}
1. Show all users
2. Find user by email
3. Find user by Firebase UID
4. Find user by invite code
5. Find users referred by a specific invite code
6. Show database stats
7. Exit
  `);

  rl.question(`${colors.fg.green}Enter your choice (1-7):${colors.reset} `, async (choice) => {
    switch (choice) {
      case '1':
        await findUsers();
        break;
      case '2':
        rl.question(`${colors.fg.green}Enter email:${colors.reset} `, async (email) => {
          await findUserByField('email', email);
          rl.close();
          showMenu();
        });
        return;
      case '3':
        rl.question(`${colors.fg.green}Enter Firebase UID:${colors.reset} `, async (uid) => {
          await findUserByField('firebaseUid', uid);
          rl.close();
          showMenu();
        });
        return;
      case '4':
        rl.question(`${colors.fg.green}Enter invite code:${colors.reset} `, async (code) => {
          await findUserByField('inviteCode', code);
          rl.close();
          showMenu();
        });
        return;
      case '5':
        rl.question(`${colors.fg.green}Enter referrer's invite code:${colors.reset} `, async (code) => {
          await findUsers({ referredBy: code });
          rl.close();
          showMenu();
        });
        return;
      case '6':
        await showStats();
        break;
      case '7':
        console.log(`${colors.fg.yellow}Exiting...${colors.reset}`);
        process.exit(0);
        break;
      default:
        console.log(`${colors.fg.red}Invalid choice. Please try again.${colors.reset}`);
    }
    rl.close();
    showMenu();
  });
}

// Process command line arguments
function processArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // No arguments, show interactive menu
    return showMenu();
  }
  
  // Handle command line arguments
  const command = args[0];
  
  switch (command) {
    case 'all':
      return findUsers();
    case 'email':
      if (args.length < 2) {
        console.log(`${colors.fg.red}Please provide an email address${colors.reset}`);
        return;
      }
      return findUserByField('email', args[1]);
    case 'uid':
      if (args.length < 2) {
        console.log(`${colors.fg.red}Please provide a Firebase UID${colors.reset}`);
        return;
      }
      return findUserByField('firebaseUid', args[1]);
    case 'invite':
      if (args.length < 2) {
        console.log(`${colors.fg.red}Please provide an invite code${colors.reset}`);
        return;
      }
      return findUserByField('inviteCode', args[1]);
    case 'referred':
      if (args.length < 2) {
        console.log(`${colors.fg.red}Please provide a referrer's invite code${colors.reset}`);
        return;
      }
      return findUsers({ referredBy: args[1] });
    case 'stats':
      return showStats();
    default:
      console.log(`
${colors.fg.yellow}Usage:${colors.reset}
node checkuser.js [command] [value]

${colors.fg.cyan}Commands:${colors.reset}
- all                     : Show all users
- email [email]           : Find user by email
- uid [firebase_uid]      : Find user by Firebase UID
- invite [invite_code]    : Find user by invite code
- referred [invite_code]  : Find users referred by a specific invite code
- stats                   : Show database stats

${colors.fg.cyan}Examples:${colors.reset}
node checkuser.js all
node checkuser.js email user@example.com
node checkuser.js uid WQnHLdmKhjRTEqXbYivCywhhIzL2
      `);
  }
}

// Connect to MongoDB and start the application
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`${colors.fg.green}Connected to MongoDB successfully${colors.reset}`);
    processArgs();
  })
  .catch((error) => {
    console.error(`${colors.fg.red}MongoDB connection error:${colors.reset}`, error);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log(`${colors.fg.yellow}MongoDB connection closed through app termination${colors.reset}`);
    process.exit(0);
  });
});