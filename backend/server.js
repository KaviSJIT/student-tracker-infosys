require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '../frontend')));

// Public stats — no auth, same data as admin dashboard
app.get('/api/public/stats', async (req, res) => {
  try {
    const [studSnap, docsSnap, partsSnap, pendingSnap] = await Promise.all([
      db.collection('students').where('status', '==', 'approved').get(),
      db.collection('documents').get(),
      db.collection('participation').get(),
      db.collection('students').where('status', '==', 'pending').get(),
    ]);
    const docs = docsSnap.docs.map(d => d.data());
    res.json({
      totalStudents: studSnap.size,
      enrolled: partsSnap.size,
      completed: partsSnap.docs.filter(d => d.data().status === 'Completed').length,
      verified: docs.filter(d => d.status === 'Verified').length,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));

app.get('/', (req, res) => res.send('Backend running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
