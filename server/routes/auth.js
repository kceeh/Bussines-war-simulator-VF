const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validate');
const authController = require('../controllers/authController');

// Rutas de autenticación
router.post('/register', validateRegistration, authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);

module.exports = router;