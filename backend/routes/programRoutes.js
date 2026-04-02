const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public: get all programs
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('programs').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: add program
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, type, desc, duration, eligibility, start, end } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type required.' });
    const ref = await db.collection('programs').add({ name, type, desc: desc || '', duration: duration || '—', eligibility: eligibility || 'All Students', start: start || '', end: end || '', createdAt: new Date().toISOString() });
    res.status(201).json({ message: 'Program added.', id: ref.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: update program
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await db.collection('programs').doc(req.params.id).update(req.body);
    res.json({ message: 'Program updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: delete program
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await db.collection('programs').doc(req.params.id).delete();
    res.json({ message: 'Program deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
