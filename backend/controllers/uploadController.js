const { db } = require('../firebase');

// ── STUDENT SUBMITS DRIVE LINK ────────────────────────
exports.submitDocument = async (req, res) => {
  try {
    const { programId, programName, docType, driveLink, description } = req.body;
    const { uid, email } = req.user;

    if (!driveLink || !programName || !docType) {
      return res.status(400).json({ message: 'Drive link, program name, and document type are required.' });
    }

    // Validate it looks like a drive/docs link
    if (!driveLink.startsWith('http')) {
      return res.status(400).json({ message: 'Please provide a valid URL.' });
    }

    // Get student info
    const studentDoc = await db.collection('students').doc(uid).get();
    if (!studentDoc.exists) return res.status(404).json({ message: 'Student not found.' });
    const student = studentDoc.data();

    const docRef = await db.collection('documents').add({
      studentUid: uid,
      studentEmail: email,
      studentName: student.name,
      department: student.department,
      registerNumber: student.registerNumber,
      programId: programId || '',
      programName,
      docType,
      driveLink,
      description: description || '',
      status: 'Under Review',
      adminRemark: '',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
    });

    res.status(201).json({ message: 'Document submitted successfully.', id: docRef.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET STUDENT'S OWN DOCUMENTS ───────────────────────
exports.getMyDocuments = async (req, res) => {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection('documents').where('studentUid', '==', uid).get();
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── ADMIN: GET ALL DOCUMENTS ──────────────────────────
exports.getAllDocuments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = db.collection('documents');
    if (status) query = query.where('status', '==', status);
    const snapshot = await query.get();
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
