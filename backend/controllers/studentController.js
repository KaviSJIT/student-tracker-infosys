const { db } = require('../firebase');

// ── GET STUDENT PROFILE ───────────────────────────────
exports.getStudentProfile = async (req, res) => {
  try {
    const uid = req.params.id || req.user.uid;
    const doc = await db.collection('students').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Student not found.' });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE STUDENT PROFILE ────────────────────────────
exports.updateStudentProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const allowed = ['name', 'phone', 'department', 'year', 'section', 'gender', 'college',
      'cgpa', 'arrears', 'courses', 'certs', 'plan', 'domain', 'accommodation', 'native', 'bus'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updatedAt = new Date().toISOString();
    await db.collection('students').doc(uid).update(updates);
    res.status(200).json({ message: 'Profile updated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── SUBMIT PARTICIPATION ──────────────────────────────
exports.submitParticipation = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { programId, programName, programType, regId, enrollDate, startDate, endDate, project, feedback, certLink } = req.body;
    if (!programName) return res.status(400).json({ message: 'Program name is required.' });

    const studentDoc = await db.collection('students').doc(uid).get();
    const student = studentDoc.data();

    const ref = await db.collection('participation').add({
      studentUid: uid,
      studentEmail: email,
      name: student.name,
      department: student.department,
      year: student.year,
      programId: programId || '',
      programName,
      programType: programType || '',
      regId: regId || '',
      enrollDate: enrollDate || new Date().toISOString().split('T')[0],
      startDate: startDate || '',
      endDate: endDate || '',
      project: project || '',
      feedback: feedback || '',
      certLink: certLink || '',
      status: 'Doing',
      verification: 'Under Review',
      submittedOn: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Participation submitted.', id: ref.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET STUDENT PARTICIPATIONS ────────────────────────
exports.getMyParticipations = async (req, res) => {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection('participation').where('studentUid', '==', uid).get();
    const parts = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE PARTICIPATION STATUS ───────────────────────
exports.updateParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endDate, project, feedback, certLink } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (endDate) updates.endDate = endDate;
    if (project) updates.project = project;
    if (feedback) updates.feedback = feedback;
    if (certLink) updates.certLink = certLink;
    await db.collection('participation').doc(id).update(updates);
    res.status(200).json({ message: 'Participation updated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
