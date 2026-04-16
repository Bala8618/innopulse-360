const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', loginValidator, validate, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);

module.exports = router;
