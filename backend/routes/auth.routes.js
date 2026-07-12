const express = require('express');
const { register, login, googleLogin, getMe, updateMe, changePassword, forgotPassword } = require('../controllers/auth.controller');
const protect = require('../middleware/auth');

const router = express.Router();
console.log("✅ Auth Routes Loaded");
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
