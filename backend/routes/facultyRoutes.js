const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get faculty participations
router.get('/participation', async (req, res) => {
  try {
    const snap = await db.collection('faculty_participation').where('facultyUid', '==', req.user.uid).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn)));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Submit participation
router.post('/participation', async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { programId, programName, programType, regId, enrollDate, status, startDate, endDate, project, feedback, certLink } = req.body;
    if (!programName) return res.status(400).json({ message: 'Program name is required.' });
    const facDoc = await db.collection('faculty').doc(uid).get();
    const fac = facDoc.data();
    const ref = await db.collection('faculty_participation').add({
      facultyUid: uid, facultyEmail: email, name: fac.name, department: fac.department,
      programId: programId||'', programName, programType: programType||'',
      regId: regId||'', enrollDate: enrollDate||new Date().toISOString().split('T')[0],
      startDate: startDate||'', endDate: endDate||'', project: project||'',
      feedback: feedback||'', certLink: certLink||'',
      status: status||'Doing', submittedOn: new Date().toISOString(),
    });
    res.status(201).json({ message: 'Participation submitted.', id: ref.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Update participation status
router.put('/participation/:id', async (req, res) => {
  try {
    await db.collection('faculty_participation').doc(req.params.id).update(req.body);
    res.json({ message: 'Updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get faculty documents
router.get('/documents', async (req, res) => {
  try {
    const snap = await db.collection('faculty_documents').where('facultyUid', '==', req.user.uid).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get faculty profile
router.get('/profile', async (req, res) => {
  try {
    const doc = await db.collection('faculty').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Faculty not found.' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Update faculty profile
router.put('/profile', async (req, res) => {
  try {
    const allowed = ['name','phone','department','college','designation'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updatedAt = new Date().toISOString();
    await db.collection('faculty').doc(req.user.uid).update(updates);
    res.json({ message: 'Profile updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
