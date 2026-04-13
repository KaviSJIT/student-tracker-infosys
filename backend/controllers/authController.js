const { db, auth } = require('../firebase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ── STUDENT REGISTER ──────────────────────────────────
exports.registerStudent = async (req, res) => {
  try {
    const { email, password, name, registerNumber, department, year, section, phone, college, gender } = req.body;
    if (!email || !password || !name || !registerNumber) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }

    // Check duplicate register number
    const existing = await db.collection('students').where('registerNumber', '==', registerNumber).get();
    if (!existing.empty) {
      return res.status(400).json({ message: 'Register number already exists.' });
    }

    // Create Firebase Auth user (disabled until admin approves)
    const userRecord = await auth.createUser({ email, password, displayName: name, disabled: true });

    // Save student profile in Firestore with status 'pending'
    await db.collection('students').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      registerNumber,
      department,
      year,
      section,
      phone,
      college,
      gender,
      domain: '',
      cgpa: '',
      arrears: '',
      courses: '0',
      certs: '0',
      accommodation: '',
      native: '',
      bus: '',
      plan: '',
      role: 'student',
      status: 'pending',   // pending | approved | rejected
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Registration request sent. Awaiting admin approval.' });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    console.error('registerStudent error:', error);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// ── STUDENT LOGIN ─────────────────────────────────────
exports.loginStudent = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'ID token required.' });

    // Verify Firebase ID token
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Get student profile
    const doc = await db.collection('students').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Student profile not found.' });

    const student = doc.data();

    if (student.status === 'pending') {
      return res.status(403).json({ message: 'Your registration is pending admin approval.' });
    }
    if (student.status === 'rejected') {
      return res.status(403).json({ message: 'Your registration was rejected by admin.' });
    }

    const token = jwt.sign({ uid, role: 'student', email: student.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful.', token, student });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
  }
};

// ── ADMIN LOGIN ───────────────────────────────────────
exports.loginAdmin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'ID token required.' });

    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const doc = await db.collection('admins').doc(uid).get();
    if (!doc.exists) return res.status(403).json({ message: 'Not an admin account.' });

    const admin = doc.data();
    const token = jwt.sign({ uid, role: admin.role, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Admin login successful.', token, admin });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
  }
};

// ── SEND PASSWORD RESET EMAIL ───────────────────────
exports.sendPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const continueUrl = 'http://localhost:5000/reset-password.html';
    const link = await auth.generatePasswordResetLink(email, { url: continueUrl });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"CompanyConnect" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify Password Change – CompanyConnect',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#7c3aed;margin-bottom:8px;">Password Change Request</h2>
          <p style="color:#374151;margin-bottom:16px;">We received a request to change the password for your <strong>CompanyConnect</strong> account.</p>
          <p style="color:#374151;margin-bottom:24px;">Click the button below to verify it's you. After verification, you'll be redirected to set your new password.</p>
          <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:600;">Verify & Change Password</a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Verification email sent.' });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'No account found with this email.' });
    }
    console.error('sendPasswordReset error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── FACULTY LOGIN ───────────────────────────────────────────
exports.loginFaculty = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'ID token required.' });
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const doc = await db.collection('faculty').doc(uid).get();
    if (!doc.exists) return res.status(403).json({ message: 'Not a faculty account.' });
    const faculty = doc.data();
    if (faculty.status === 'pending') return res.status(403).json({ message: 'Your registration is pending admin approval.' });
    if (faculty.status === 'rejected') return res.status(403).json({ message: 'Your registration was rejected by admin.' });
    const token = jwt.sign({ uid, role: 'faculty', email: faculty.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Faculty login successful.', token, faculty });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
  }
};

// ── FACULTY REGISTER ───────────────────────────────────────────
exports.registerFaculty = async (req, res) => {
  try {
    const { email, password, name, employeeId, department, designation, phone, college } = req.body;
    if (!email || !password || !name || !employeeId) return res.status(400).json({ message: 'Required fields missing.' });

    const existing = await db.collection('faculty').where('employeeId', '==', employeeId).get();
    if (!existing.empty) return res.status(400).json({ message: 'Employee ID already registered.' });

    const userRecord = await auth.createUser({ email, password, displayName: name, disabled: true });

    await db.collection('faculty').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email, name, employeeId, department, designation, phone, college,
      role: 'faculty',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Faculty registration request sent. Awaiting admin approval.' });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') return res.status(400).json({ message: 'Email already registered.' });
    console.error('registerFaculty error:', error);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// ── GET CURRENT USER PROFILE ──────────────────────────
exports.getMe = async (req, res) => {
  try {
    const { uid, role } = req.user;
    const collection = role === 'student' ? 'students' : 'admins';
    const doc = await db.collection(collection).doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Profile not found.' });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
