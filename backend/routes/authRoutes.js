const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register/student', authController.registerStudent);
router.post('/register/faculty', authController.registerFaculty);
router.post('/login/student', authController.loginStudent);
router.post('/login/admin', authController.loginAdmin);
router.post('/login/faculty', authController.loginFaculty);
router.post('/send-password-reset', authController.sendPasswordReset);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
