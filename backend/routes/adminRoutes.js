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
router.get('/all-participation', async (req, res) => {
  try {
    const { db } = require('../firebase');
    const snap = await db.collection('participation').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn)));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Faculty approval routes
router.get('/faculty/pending', async (req, res) => {
  try {
    const { db } = require('../firebase');
    const snap = await db.collection('faculty').where('status', '==', 'pending').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/faculty/:uid/approve', async (req, res) => {
  try {
    const { db, auth } = require('../firebase');
    await db.collection('faculty').doc(req.params.uid).update({ status: 'approved' });
    await auth.updateUser(req.params.uid, { disabled: false });
    res.json({ message: 'Faculty approved.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/faculty/:uid/reject', async (req, res) => {
  try {
    const { db } = require('../firebase');
    await db.collection('faculty').doc(req.params.uid).update({ status: 'rejected', rejectionReason: req.body.reason || '' });
    res.json({ message: 'Faculty rejected.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
