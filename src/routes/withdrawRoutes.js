const express = require('express');
const router = express.Router();
const { withdrawCoins, getWithdrawalHistory } = require('../controllers/withdrawController');
const auth = require('../middleware/auth'); // Middleware to set req.user

router.post('/withdraw-coins', auth, withdrawCoins);
router.get('/withdrawal-history', auth, getWithdrawalHistory);

module.exports = router;