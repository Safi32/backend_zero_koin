const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    // Check if we have service account key file or use default credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // If service account key is provided as environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'zerokoin-4e239'
      });
    } else {
      // Use default credentials (for development or when deployed with proper IAM)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'zerokoin-4e239'
      });
    }
    console.log('Firebase Admin SDK initialized successfully');
  }
  return admin;
};

// Initialize Firebase immediately
initializeFirebase();

module.exports = { admin };
