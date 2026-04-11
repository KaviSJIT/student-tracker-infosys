const { db } = require('../firebase');

async function syncParticipation(docId, status, remark) {
  const doc = await db.collection('documents').doc(docId).get();
  if (!doc.exists) return;
  const { studentUid, programName } = doc.data();
  const snap = await db.collection('participation')
    .where('studentUid', '==', studentUid)
    .where('programName', '==', programName)
    .get();
  const updates = { status };
  if (remark) updates.adminRemark = remark;
  snap.forEach(p => p.ref.update(updates));
}

// ── ADMIN: VERIFY DOCUMENT ────────────────────────────
exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    await db.collection('documents').doc(id).update({
      status: 'Verified',
      adminRemark: remark || '',
      reviewedAt: new Date().toISOString(),
    });
    await syncParticipation(id, 'Completed', remark);
    res.status(200).json({ message: 'Document verified.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── ADMIN: REJECT DOCUMENT ────────────────────────────
exports.rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    if (!remark) return res.status(400).json({ message: 'Rejection reason is required.' });
    await db.collection('documents').doc(id).update({
      status: 'Rejected',
      adminRemark: remark,
      reviewedAt: new Date().toISOString(),
    });
    await syncParticipation(id, 'Rejected', remark);
    res.status(200).json({ message: 'Document rejected.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── ADMIN: REQUEST RE-UPLOAD ──────────────────────────
exports.requestReupload = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    const msg = remark || 'Please re-upload the document.';
    await db.collection('documents').doc(id).update({
      status: 'Need Re-upload',
      adminRemark: msg,
      reviewedAt: new Date().toISOString(),
    });
    await syncParticipation(id, 'Need Re-upload', msg);
    res.status(200).json({ message: 'Re-upload requested.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
