const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

router.get('/students/pending', adminController.getPendingStudents);
router.get('/students', adminController.getAllStudents);
router.put('/students/:uid/approve', adminController.approveStudent);
router.put('/students/:uid/reject', adminController.rejectStudent);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/report', adminController.getReportData);

module.exports = router;
