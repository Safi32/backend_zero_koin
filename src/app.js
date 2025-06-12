const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Firebase config to ensure initialization happens at startup
const { admin } = require('./config/firebase');
const userRoutes = require('./routes/userRoutes');
const tokenRoutes = require('./routes/tokenRoutes');  
const withdrawRoutes = require('./routes/withdrawRoutes');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:root@cluster0.ye7aj3h.mongodb.net/zero_koin';

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/token', tokenRoutes);  
app.use('/api/withdraw', withdrawRoutes);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Verify Firebase is initialized
    if (admin.apps.length) {
      console.log('Firebase Admin SDK is initialized');
    } else {
      console.error('Firebase Admin SDK initialization failed');
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});