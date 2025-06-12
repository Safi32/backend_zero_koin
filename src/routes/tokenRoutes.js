const express = require('express');
const router = express.Router();
const { saveToken } = require('../controllers/tokenController');

// POST /api/token - Save a token ID
router.post('/', saveToken);

module.exports = router; 