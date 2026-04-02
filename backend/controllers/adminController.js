const { db, auth } = require('../firebase');

exports.getPendingStudents = async (req, res) => {
  try {
    const snap = await db.collection('students').where('status', '==', 'pending').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.approveStudent = async (req, res) => {
  try {
    const { uid } = req.params;
    await auth.updateUser(uid, { disabled: false });
    await db.collection('students').doc(uid).update({ status: 'approved', approvedAt: new Date().toISOString() });
    res.json({ message: 'Student approved.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.rejectStudent = async (req, res) => {
  try {
    const { uid } = req.params;
    const { reason } = req.body;
    await auth.updateUser(uid, { disabled: true });
    await db.collection('students').doc(uid).update({ status: 'rejected', rejectionReason: reason || 'Not specified', rejectedAt: new Date().toISOString() });
    res.json({ message: 'Student rejected.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { dept, year } = req.query;
    let q = db.collection('students').where('status', '==', 'approved');
    const snap = await q.get();
    let students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (dept) students = students.filter(s => s.department === dept);
    if (year) students = students.filter(s => s.year === year);
    res.json(students);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [studSnap, docsSnap, partsSnap, pendingSnap] = await Promise.all([
      db.collection('students').where('status', '==', 'approved').get(),
      db.collection('documents').get(),
      db.collection('participation').get(),
      db.collection('students').where('status', '==', 'pending').get(),
    ]);
    const docs = docsSnap.docs.map(d => d.data());
    const parts = partsSnap.docs.map(d => d.data());
    res.json({
      totalStudents: studSnap.size,
      pendingApprovals: pendingSnap.size,
      enrolled: parts.length,
      completed: parts.filter(p => p.status === 'Completed').length,
      verifiedDocs: docs.filter(d => d.status === 'Verified').length,
      pendingDocs: docs.filter(d => d.status === 'Under Review').length,
      rejectedDocs: docs.filter(d => d.status === 'Rejected').length,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getReportData = async (req, res) => {
  try {
    const { dept, year, program, status, type } = req.query;

    const [studSnap, partsSnap, docsSnap] = await Promise.all([
      db.collection('students').where('status', '==', 'approved').get(),
      db.collection('participation').get(),
      db.collection('documents').get(),
    ]);

    let students = studSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    let parts = partsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    let docs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (dept) { students = students.filter(s => s.department === dept); parts = parts.filter(p => p.department === dept); }
    if (year) { students = students.filter(s => s.year === year); parts = parts.filter(p => p.year === year); }
    if (program) parts = parts.filter(p => p.programName === program);
    if (status) parts = parts.filter(p => p.status === status);

    if (type === 'documents') {
      return res.json(docs.map(d => ({
        'Student Name': d.studentName, 'Register No': d.registerNumber,
        Department: d.department, 'Program Name': d.programName,
        'Doc Type': d.docType, Status: d.status,
        'Admin Remark': d.adminRemark || '', 'Submitted At': d.submittedAt,
        'Drive Link': d.driveLink,
      })));
    }

    // Default: participation report
    res.json(parts.map(p => ({
      'Student Name': p.name, Department: p.department, Batch: p.year,
      'Program Name': p.programName, 'Program Type': p.programType || '',
      'Reg ID': p.regId || '', 'Enroll Date': p.enrollDate || '',
      Status: p.status, 'Submitted On': p.submittedOn,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
};
