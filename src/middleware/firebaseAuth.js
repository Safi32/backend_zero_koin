const { admin } = require('../config/firebase');

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // First check if Firebase admin has been initialized
    if (!admin.apps.length) {
      console.error('Firebase Admin SDK not initialized');
      return res.status(500).json({
        message: 'Server configuration error: Firebase not initialized'
      });
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authorization header with Bearer token required' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ 
        message: 'ID token not found' 
      });
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('🔐 Firebase token verified for user:', decodedToken.uid);

    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.display_name,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};

// Optional middleware - doesn't fail if no token provided
const optionalFirebaseAuth = async (req, res, next) => {
  try {
    // Check if Firebase admin has been initialized
    if (!admin.apps.length) {
      console.warn('Firebase Admin SDK not initialized for optional auth');
      return next();
    }
    
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      if (idToken) {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.display_name,
          emailVerified: decodedToken.email_verified
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user info
    console.warn('Optional Firebase auth failed:', error.message);
    next();
  }
};

module.exports = { verifyFirebaseToken, optionalFirebaseAuth };
