# CompanyConnect – Infosys Springboard Tracker

A centralized platform for students, faculty, and placement coordinators to manage Infosys Springboard programs, certificates, and verification workflows.

---

## 🚀 Features

### 👤 Student Portal
- Register & login with admin approval flow
- Browse and enroll in programs (Training, Internship, Certification, Workshop)
- Submit participation details
- Upload documents via Google Drive link
- Track verification status with animated timeline
- Live bar chart showing program progress
- Settings with password reset via email

### 🎓 Faculty Portal
- Register & login with admin approval flow
- Browse faculty-assigned programs
- Submit participation and upload documents
- Track verification status
- Settings with password reset via email

### 🛡️ Admin Portal
- Analytics dashboard with live bar chart (department-wise, role & college filters)
- Program completion rate with animated progress bars
- Pending approvals for students and faculty
- Verify / Reject / Request Re-upload documents
- Program management with assignment to Students / Faculty / All
- Search & Filter by role, college (Engineering / Technology), department, batch
- Department Summary with Excel export
- Portal Settings — enable/disable registration, login, submissions per role

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| File Storage | Cloudinary |
| Email | Nodemailer (Gmail) |
| Charts | Chart.js |

---

## 📁 Project Structure

```
student-tracker-infosys/
├── backend/
│   ├── controllers/        # Auth, Admin, Student, Upload, Verification
│   ├── middleware/         # JWT auth middleware
│   ├── models/             # Firestore models
│   ├── routes/             # Express routes
│   ├── firebase.js         # Firebase Admin SDK setup
│   ├── server.js           # Express app entry point
│   └── seedAdmin.js        # Seed admin accounts
└── frontend/
    ├── index.html          # Landing page
    ├── login.html          # Unified login (Student / Faculty / Admin)
    ├── dashboard.html      # Student dashboard
    ├── faculty-dashboard.html
    ├── admin-dashboard.html
    └── ...                 # Other pages
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Firebase project with Firestore & Authentication enabled
- Gmail account with App Password
- Cloudinary account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/KaviSJIT/student-tracker-infosys.git
cd student-tracker-infosys/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `backend/.env`:
```env
PORT=5000
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET="your-jwt-secret"
GMAIL_USER="your-gmail@gmail.com"
GMAIL_PASS="your-app-password"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Seed admin accounts
```bash
node seedAdmin.js
```

### 5. Start the backend
```bash
npm run dev
```

### 6. Open the frontend
Visit `http://localhost:5000` in your browser.

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Coordinator) | admin@stjosephs.ac.in | admin123 |
| Admin (Faculty) | faculty@stjosephs.ac.in | faculty123 |

> ⚠️ Change these credentials after first login.

---

## 🏫 Colleges Supported
- St. Joseph's College of Engineering (Engineering)
- St. Joseph's Institute of Technology (Technology)

---

## 📊 Program Types
- Training
- Internship
- Certification
- Workshop

---

## 📄 License
This project is built for St. Joseph's College of Engineering – Infosys Springboard Tracking Platform.
