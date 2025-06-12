#!/usr/bin/env node

const mongoose = require("mongoose");
require("dotenv").config({ path: "./src/.env" });
const readline = require("readline");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:root@cluster0.ye7aj3h.mongodb.net/zero_koin";

// Define User schema matching the one in the application
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, sparse: true },
  name: { type: String },
  email: { type: String, sparse: true },
  inviteCode: { type: String, required: true, unique: true },
  referredBy: { type: String },
  recentAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Console colors for better readability
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  fg: {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  },
  bg: {
    red: "\x1b[41m",
    blue: "\x1b[44m",
  },
};

// Format user object for display
function formatUser(user) {
  return `
${colors.bright}${colors.fg.cyan}User ID:${colors.reset} ${user._id}
${colors.bright}${colors.fg.cyan}Firebase UID:${colors.reset} ${user.firebaseUid || "Not set"}
${colors.bright}${colors.fg.cyan}Name:${colors.reset} ${user.name || "Not set"}
${colors.bright}${colors.fg.cyan}Email:${colors.reset} ${user.email || "Not set"}
${colors.bright}${colors.fg.cyan}Invite Code:${colors.reset} ${user.inviteCode}
${colors.bright}${colors.fg.cyan}Referred By:${colors.reset} ${user.referredBy || "None"}
${colors.bright}${colors.fg.cyan}Balance:${colors.reset} ${user.balance}
${colors.bright}${colors.fg.cyan}Created At:${colors.reset} ${user.createdAt}
${colors.fg.yellow}${"-".repeat(50)}${colors.reset}`;
}

// Function to find and delete a user by email
async function findAndDeleteUserByEmail(email) {
  try {
    // Find the user first to show their info
    const user = await User.findOne({ email });

    if (!user) {
      console.log(
        `${colors.fg.yellow}No user found with email: ${email}${colors.reset}`,
      );
      return false;
    }

    console.log(`${colors.fg.green}User found:${colors.reset}`);
    console.log(formatUser(user));

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(
        `${colors.bg.red}${colors.fg.white}${colors.bright} WARNING: ${colors.reset} ${colors.fg.red}Are you sure you want to delete this user? This action cannot be undone! (y/n): ${colors.reset}`,
        async (answer) => {
          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            try {
              // Delete the user
              const result = await User.deleteOne({ email });
              if (result.deletedCount === 1) {
                console.log(
                  `${colors.fg.green}User with email ${email} has been successfully deleted!${colors.reset}`,
                );
                resolve(true);
              } else {
                console.log(
                  `${colors.fg.red}Failed to delete user. No changes were made.${colors.reset}`,
                );
                resolve(false);
              }
            } catch (error) {
              console.error(
                `${colors.fg.red}Error during deletion:${colors.reset}`,
                error,
              );
              resolve(false);
            }
          } else {
            console.log(
              `${colors.fg.yellow}Deletion cancelled. No changes were made.${colors.reset}`,
            );
            resolve(false);
          }
          rl.close();
        },
      );
    });
  } catch (error) {
    console.error(`${colors.fg.red}Error finding user:${colors.reset}`, error);
    return false;
  }
}

// Interactive CLI menu
function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
${colors.bg.blue}${colors.fg.white}${colors.bright} MongoDB User Deletion Tool ${colors.reset}

${colors.fg.cyan}Select an option:${colors.reset}
1. Delete user by email
2. Exit
  `);

  rl.question(
    `${colors.fg.green}Enter your choice (1-2):${colors.reset} `,
    (choice) => {
      switch (choice) {
        case "1":
          rl.question(
            `${colors.fg.green}Enter email of user to delete:${colors.reset} `,
            async (email) => {
              rl.close();
              await findAndDeleteUserByEmail(email);
              setTimeout(() => showMenu(), 1000); // Return to menu after operation
            },
          );
          return;
        case "2":
          console.log(`${colors.fg.yellow}Exiting...${colors.reset}`);
          rl.close();
          process.exit(0);
          break;
        default:
          console.log(
            `${colors.fg.red}Invalid choice. Please try again.${colors.reset}`,
          );
          rl.close();
          showMenu();
      }
    },
  );
}

// Process command line arguments
async function processArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // No arguments, show interactive menu
    return showMenu();
  }

  // Handle command line arguments
  const command = args[0];

  switch (command) {
    case "email":
      if (args.length < 2) {
        console.log(
          `${colors.fg.red}Please provide an email address${colors.reset}`,
        );
        return;
      }
      const success = await findAndDeleteUserByEmail(args[1]);
      // Exit after operation completes
      setTimeout(() => process.exit(success ? 0 : 1), 1000);
      break;
    default:
      console.log(`
${colors.fg.yellow}Usage:${colors.reset}
node deleteuser.js [command] [value]

${colors.fg.cyan}Commands:${colors.reset}
- email [email]  : Delete user by email

${colors.fg.cyan}Examples:${colors.reset}
node deleteuser.js email user@example.com
      `);
      process.exit(1);
  }
}

// Connect to MongoDB and start the application
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(
      `${colors.fg.green}Connected to MongoDB successfully${colors.reset}`,
    );
    processArgs();
  })
  .catch((error) => {
    console.error(
      `${colors.fg.red}MongoDB connection error:${colors.reset}`,
      error,
    );
    process.exit(1);
  });

// Handle process termination
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log(
      `${colors.fg.yellow}MongoDB connection closed through app termination${colors.reset}`,
    );
    process.exit(0);
  });
});
