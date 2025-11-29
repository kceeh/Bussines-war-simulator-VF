const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserProfile, updateUserStats } = require('../controllers/userController');

router.get('/profile', auth, getUserProfile);
router.put('/stats', auth, updateUserStats);

module.exports = router;