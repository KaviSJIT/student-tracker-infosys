const API = 'http://localhost:5000/api';

const firebaseConfig = {
  apiKey: "AIzaSyBNxLSTxcwQbTohuI-dfI3wO_zOFJtof34",
  authDomain: "student-tracker-infosys.firebaseapp.com",
  projectId: "student-tracker-infosys",
  storageBucket: "student-tracker-infosys.firebasestorage.app",
  messagingSenderId: "660446692211",
  appId: "1:660446692211:web:bf0e2c748fa7e7579bfb06",
  measurementId: "G-93342Z6FSZ"
};

if (typeof firebase !== 'undefined' && !firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}

const Auth = {
  setToken: t => localStorage.setItem('authToken', t),
  getToken: () => localStorage.getItem('authToken'),
  setUser: u => localStorage.setItem('currentUser', JSON.stringify(u)),
  getUser: () => JSON.parse(localStorage.getItem('currentUser') || 'null'),
  setAdmin: a => localStorage.setItem('currentAdmin', JSON.stringify(a)),
  getAdmin: () => JSON.parse(localStorage.getItem('currentAdmin') || 'null'),
  logout: () => {
    localStorage.clear();
    if (typeof firebase !== 'undefined') firebase.auth().signOut();
  }
};

async function apiCall(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function requireStudent() {
  const u = Auth.getUser();
  if (!u) { window.location.href = 'login.html'; return null; }
  return u;
}
function requireAdmin() {
  const a = Auth.getAdmin();
  if (!a) { window.location.href = 'admin-login.html'; return null; }
  return a;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function badgeHTML(status) {
  const map = {
    'Under Review': 'badge-review', 'Verified': 'badge-verified',
    'Completed': 'badge-completed', 'Rejected': 'badge-rejected',
    'Need Re-upload': 'badge-reupload', 'Doing': 'badge-review',
    'Not Started': 'badge-submitted', 'Submitted': 'badge-submitted',
    'pending': 'badge-review', 'approved': 'badge-verified', 'rejected': 'badge-rejected',
  };
  return `<span class="badge ${map[status] || 'badge-submitted'}">${status}</span>`;
}

function typeBadge(type) {
  const map = { Training: 'badge-training', Internship: 'badge-internship', Certification: 'badge-certification', Workshop: 'badge-workshop' };
  return `<span class="badge ${map[type] || ''}">${type || ''}</span>`;
}

function showAlert(containerId, msg, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${icons[type]} ${msg}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 5000);
}

function buildStudentNav(active) {
  return [
    { href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: 'profile.html', icon: '👤', label: 'My Profile' },
    { href: 'programs.html', icon: '📚', label: 'Programs' },
    { href: 'participation.html', icon: '📝', label: 'Submit Participation' },
    { href: 'upload.html', icon: '📎', label: 'Upload Documents' },
    { href: 'status.html', icon: '🔍', label: 'Track Status' },
  ].map(n => `<a href="${n.href}" class="${active === n.href ? 'active' : ''}"><span class="icon">${n.icon}</span>${n.label}</a>`).join('');
}

function buildAdminNav(active) {
  return [
    { href: 'admin-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: 'admin-students.html', icon: '👥', label: 'Students' },
    { href: 'admin-pending.html', icon: '⏳', label: 'Pending Approvals' },
    { href: 'admin-verify.html', icon: '✅', label: 'Verify Documents' },
    { href: 'admin-programs.html', icon: '📚', label: 'Programs' },
    { href: 'admin-search.html', icon: '🔍', label: 'Search & Filter' },
    { href: 'admin-reports.html', icon: '📄', label: 'Reports' },
  ].map(n => `<a href="${n.href}" class="${active === n.href ? 'active' : ''}"><span class="icon">${n.icon}</span>${n.label}</a>`).join('');
}

function doLogout(redirect = 'login.html') {
  Auth.logout();
  window.location.href = redirect;
}

function exportToExcel(data, filename) {
  if (!data.length) return alert('No data to export.');
  const keys = Object.keys(data[0]);
  let csv = keys.join('\t') + '\n';
  data.forEach(row => { csv += keys.map(k => `"${row[k] ?? ''}"`).join('\t') + '\n'; });
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
  a.click();
}
