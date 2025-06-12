const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Environment check:', {
      hasMongoURI: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    });

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 