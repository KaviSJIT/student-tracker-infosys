const { db } = require('../firebase');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed.'));
  },
});

exports.uploadMiddleware = upload.single('pdf');

// ── STUDENT UPLOADS PDF ───────────────────────────────
exports.submitDocument = async (req, res) => {
  try {
    const { programName, docType, description, replaceDocId } = req.body;
    const { uid, email } = req.user;

    if (!req.file) return res.status(400).json({ message: 'PDF file is required.' });
    if (!programName || !docType) return res.status(400).json({ message: 'Program name and document type are required.' });

    const studentDoc = await db.collection('students').doc(uid).get();
    if (!studentDoc.exists) return res.status(404).json({ message: 'Student not found.' });
    const student = studentDoc.data();

    // Upload to Cloudinary
    const fileUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'companyconnect', format: 'pdf' },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      );
      stream.end(req.file.buffer);
    });

    // If re-uploading, update the existing doc record instead of creating new
    if (replaceDocId) {
      await db.collection('documents').doc(replaceDocId).update({
        fileUrl,
        fileName: req.file.originalname,
        status: 'Under Review',
        adminRemark: '',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
      });
      return res.status(200).json({ message: 'Document re-uploaded successfully.', id: replaceDocId });
    }

    const docRef = await db.collection('documents').add({
      studentUid: uid,
      studentEmail: email,
      studentName: student.name,
      department: student.department,
      registerNumber: student.registerNumber,
      programName,
      docType,
      fileUrl,
      fileName: req.file.originalname,
      description: description || '',
      status: 'Under Review',
      adminRemark: '',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
    });

    res.status(201).json({ message: 'Document uploaded successfully.', id: docRef.id });
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
