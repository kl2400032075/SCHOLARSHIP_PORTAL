// ===== Data Management =====
let scholarships = [];
let applications = [];
let currentUser = null;
let isLoggedIn = false;
let userType = null; // 'student' or 'admin'

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const STORAGE_KEYS = { scholarships: 'scholarships', applications: 'applications' };

// Load data on page init
window.onload = () => {
  loadFromStorage();
  if (scholarships.length === 0) {
    initializeSampleData();
  }
  // Go directly to student dashboard (no welcome screen)
  goToStudentDashboard();
};

// ===== Storage Functions =====
function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.scholarships, JSON.stringify(scholarships));
  localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
}

function loadFromStorage() {
  scholarships = JSON.parse(localStorage.getItem(STORAGE_KEYS.scholarships)) || [];
  applications = JSON.parse(localStorage.getItem(STORAGE_KEYS.applications)) || [];
}

function initializeSampleData() {
  scholarships = [
    { id: 1, name: "Merit Scholarship", description: "For high achievers with outstanding academic records", amount: 5000, deadline: "2025-11-30", gpa: 3.5, awards: 10 },
    { id: 2, name: "Need-Based Aid", description: "For students in financial need", amount: 3000, deadline: "2025-12-15", gpa: 2.0, awards: 20 },
    { id: 3, name: "STEM Excellence", description: "For STEM majors with strong performance", amount: 7500, deadline: "2025-12-01", gpa: 3.7, awards: 5 }
  ];
  saveToStorage();
}

// ===== UI Control Functions =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

// ===== Welcome Screen Functions =====
function showWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const sidebar = document.getElementById('sidebar');
  const header = document.querySelector('.top-header');
  const mainContent = document.querySelector('.main-content');
  
  welcomeScreen.style.display = 'flex';
  sidebar.style.display = 'none';
  header.style.display = 'none';
  mainContent.style.display = 'none';
  userType = null;
  isLoggedIn = false;
}

function goToStudentDashboard() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const sidebar = document.getElementById('sidebar');
  const header = document.querySelector('.top-header');
  const mainContent = document.querySelector('.main-content');
  
  welcomeScreen.style.display = 'none';
  sidebar.style.display = 'flex';
  header.style.display = 'flex';
  mainContent.style.display = 'block';
  
  userType = 'student';
  isLoggedIn = false;
  currentUser = null;
  showSection('student');
  updateAdminUI();
  showNotification('✓ Welcome to Student Dashboard!', 'success');
}

function goToAdminLogin() {
  showWelcomeScreen();
  setTimeout(() => {
    openLoginModal();
  }, 300);
}

// ===== Utility Functions =====
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('✓ Copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('✓ Copied to clipboard!', 'success');
  });
}

// ===== Authentication =====
function openLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('loginError').textContent = '';
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    isLoggedIn = true;
    currentUser = username;
    userType = 'admin';
    closeLoginModal();
    
    // Show dashboard
    const welcomeScreen = document.getElementById('welcomeScreen');
    const sidebar = document.getElementById('sidebar');
    const header = document.querySelector('.top-header');
    const mainContent = document.querySelector('.main-content');
    
    welcomeScreen.style.display = 'none';
    sidebar.style.display = 'flex';
    header.style.display = 'flex';
    mainContent.style.display = 'block';
    
    showSection('admin');
    updateAdminUI();
    showNotification('✓ Login successful! Welcome to Admin Panel', 'success');
  } else {
    document.getElementById('loginError').textContent = '❌ Invalid username or password';
  }
}

function handleLogout() {
  isLoggedIn = false;
  currentUser = null;
  userType = null;
  document.getElementById('adminUsername').value = '';
  document.getElementById('adminPassword').value = '';
  updateAdminUI();
  showWelcomeScreen();
  showNotification('✓ Logged out successfully', 'info');
}

// ===== Help Modal Functions =====
function openHelpModal() {
  document.getElementById('helpModal').style.display = 'block';
}

function closeHelpModal() {
  document.getElementById('helpModal').style.display = 'none';
}

function updateAdminUI() {
  const userProfile = document.getElementById('userProfile');
  const adminNavBtn = document.getElementById('adminNavBtn');
  const logoutNavBtn = document.getElementById('logoutNavBtn');
  const adminSection = document.getElementById('adminSection');

  if (isLoggedIn) {
    userProfile.style.display = 'flex';
    adminNavBtn.style.display = 'none';
    logoutNavBtn.style.display = flex';
    adminSection.classList.add('active');
    updateAnalytics();
    updateApplicationsReview();
  } else {
    userProfile.style.display = 'none';
    adminNavBtn.style.display = 'block';
    logoutNavBtn.style.display = 'none';
    adminSection.classList.remove('active');
  }
}

// ===== Section Management =====
function showSection(section) {
  if (section === 'admin' && !isLoggedIn) {
    openLoginModal();
    return;
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  if (section === 'student') {
    document.getElementById('studentSection').classList.add('active');
    filterAndSortScholarships();
    updateStudentApplications();
  } else if (section === 'admin' && isLoggedIn) {
    document.getElementById('adminSection').classList.add('active');
    updateAdminScholarshipList();
  }

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (section === 'student') {
    document.querySelector('[onclick="showSection(\'student\')"]').classList.add('active');
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
}

// ===== Scholarship Functions =====
function addScholarship(e) {
  e.preventDefault();
  const id = Date.now();
  const scholarship = {
    id,
    name: document.getElementById('newScholarshipName').value,
    description: document.getElementById('newScholarshipDesc').value,
    amount: parseFloat(document.getElementById('newScholarshipAmount').value),
    deadline: document.getElementById('newScholarshipDeadline').value,
    gpa: parseFloat(document.getElementById('newScholarshipGPA').value) || 0.0,
    awards: parseInt(document.getElementById('newScholarshipAwards').value)
  };

  scholarships.push(scholarship);
  saveToStorage();
  e.target.reset();
  filterAndSortScholarships();
  updateAdminScholarshipList();
  updateAnalytics();
  showNotification(`✅ Scholarship "${scholarship.name}" added successfully!`, 'success');
}

function deleteScholarship(id) {
  if (confirm('Are you sure you want to delete this scholarship?')) {
    scholarships = scholarships.filter(s => s.id !== id);
    saveToStorage();
    filterAndSortScholarships();
    updateAdminScholarshipList();
    updateAnalytics();
    showNotification('✓ Scholarship deleted', 'info');
  }
}

function editScholarship(id) {
  const scholarship = scholarships.find(s => s.id === id);
  if (scholarship) {
    document.getElementById('newScholarshipName').value = scholarship.name;
    document.getElementById('newScholarshipDesc').value = scholarship.description;
    document.getElementById('newScholarshipAmount').value = scholarship.amount;
    document.getElementById('newScholarshipDeadline').value = scholarship.deadline;
    document.getElementById('newScholarshipGPA').value = scholarship.gpa;
    document.getElementById('newScholarshipAwards').value = scholarship.awards;
    deleteScholarship(id);
  }
}

function filterAndSortScholarships() {
  const query = document.getElementById('searchBar').value.toLowerCase();
  const minAmount = parseFloat(document.getElementById('filterAmount').value) || 0;
  const minGPA = parseFloat(document.getElementById('filterGPA').value) || 0;
  const sortBy = document.getElementById('sortBy').value;

  let filtered = scholarships.filter(s =>
    s.name.toLowerCase().includes(query) &&
    s.amount >= minAmount &&
    s.gpa >= minGPA
  );

  if (sortBy === 'deadline') {
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (sortBy === 'amount') {
    filtered.sort((a, b) => b.amount - a.amount);
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  updateScholarshipList(filtered);
  updateScholarshipSelect(filtered);
}

function updateScholarshipList(list) {
  const ul = document.getElementById('scholarshipList');
  ul.innerHTML = '';
  
  if (list.length === 0) {
    ul.innerHTML = '<li style="grid-column: 1/-1; text-align: center; padding: 40px; color: #718096;">No scholarships found matching your criteria</li>';
    return;
  }

  list.forEach(s => {
    const li = document.createElement('li');
    li.className = 'scholarship-item';
    const daysLeft = Math.ceil((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    const deadlineStatus = daysLeft < 0 ? '⏰ Closed' : `⏰ ${daysLeft} days left`;
    
    li.innerHTML = `
      <div class="scholarship-header">
        <strong>${s.name}</strong>
        <span class="amount">$${s.amount.toLocaleString()}</span>
      </div>
      <p>${s.description}</p>
      <p><strong>Min GPA:</strong> ${s.gpa} | <strong>Awards:</strong> ${s.awards}</p>
      <p style="color: #ff9800; font-size: 12px;">${deadlineStatus} - Deadline: ${s.deadline}</p>
      <button onclick="openDetailModal(${s.id})" class="detail-btn">📋 View Details</button>
    `;
    ul.appendChild(li);
  });
}

function updateScholarshipSelect(list) {
  const select = document.getElementById('scholarshipSelect');
  select.innerHTML = '';
  list.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = `${s.name} - $${s.amount.toLocaleString()}`;
    select.appendChild(option);
  });
}

function openDetailModal(id) {
  const scholarship = scholarships.find(s => s.id === id);
  if (scholarship) {
    const detail = document.getElementById('scholarshipDetail');
    const daysLeft = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    detail.innerHTML = `
      <h3>📖 ${scholarship.name}</h3>
      <p><strong>💰 Amount:</strong> $${scholarship.amount.toLocaleString()}</p>
      <p><strong>📅 Deadline:</strong> ${scholarship.deadline} (${daysLeft} days left)</p>
      <p><strong>📊 Min GPA:</strong> ${scholarship.gpa}</p>
      <p><strong>🏆 Awards Available:</strong> ${scholarship.awards}</p>
      <p><strong>📝 Description:</strong></p>
      <p>${scholarship.description}</p>
    `;
    document.getElementById('detailModal').style.display = 'block';
  }
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

// ===== Application Functions =====
function submitApplication(e) {
  e.preventDefault();
  const name = document.getElementById('studentName').value;
  const email = document.getElementById('studentEmail').value;
  const scholarshipId = parseInt(document.getElementById('scholarshipSelect').value);
  const essay = document.getElementById('essayText').value;

  const scholarship = scholarships.find(s => s.id === scholarshipId);
  const application = {
    id: Date.now(),
    studentName: name,
    studentEmail: email,
    scholarshipId,
    scholarshipName: scholarship.name,
    essay,
    status: 'submitted',
    submittedDate: new Date().toLocaleDateString()
  };

  applications.push(application);
  saveToStorage();
  e.target.reset();
  updateStudentApplications();
  updateAnalytics();
  showNotification(`🎉 Application for "${scholarship.name}" submitted successfully!`, 'success');
}

function updateStudentApplications() {
  const container = document.getElementById('myApplications');
  
  if (applications.length === 0) {
    container.innerHTML = '<p style="color: #718096; padding: 20px;">You haven\'t applied for any scholarships yet. Start exploring available opportunities!</p>';
    return;
  }

  container.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'applications-list';
  list.style.listStyle = 'none';

  applications.forEach(app => {
    const li = document.createElement('li');
    li.className = `app-item status-${app.status}`;
    li.innerHTML = `
      <strong>${app.scholarshipName}</strong><br>
      <span style="color: #718096; font-size: 14px;">Submitted: ${app.submittedDate}</span>
      <span class="status-badge">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span><br>
      <span style="color: #718096; font-size: 12px;">Email: ${app.studentEmail}</span>
    `;
    list.appendChild(li);
  });

  container.appendChild(list);
}

function updateApplicationsReview() {
  const container = document.getElementById('applicationsReview');
  if (applications.length === 0) {
    container.innerHTML = '<p style="color: #718096; padding: 20px;">No applications to review yet.</p>';
    return;
  }

  container.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'review-list';
  list.style.listStyle = 'none';

  applications.forEach(app => {
    const li = document.createElement('li');
    li.className = 'review-item';
    li.innerHTML = `
      <strong>${app.studentName}</strong> - ${app.scholarshipName}<br>
      <span style="color: #718096; font-size: 14px;">Email: ${app.studentEmail}</span><br>
      <strong style="margin-top: 8px; display: block;">Update Status:</strong>
      <select onchange="updateApplicationStatus(${app.id}, this.value)" style="padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 8px;">
        <option value="submitted" ${app.status === 'submitted' ? 'selected' : ''}>✓ Submitted</option>
        <option value="under-review" ${app.status === 'under-review' ? 'selected' : ''}>⏳ Under Review</option>
        <option value="approved" ${app.status === 'approved' ? 'selected' : ''}>✅ Approved</option>
        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
      </select>
    `;
    list.appendChild(li);
  });

  container.appendChild(list);
}

function updateApplicationStatus(appId, newStatus) {
  const app = applications.find(a => a.id === appId);
  if (app) {
    app.status = newStatus;
    saveToStorage();
    updateApplicationsReview();
    updateAnalytics();
    const statusText = { submitted: 'Submitted', 'under-review': 'Under Review', approved: 'Approved', rejected: 'Rejected' };
    showNotification(`✓ Application status updated to "${statusText[newStatus]}"`, 'success');
  }
}

// ===== Analytics =====
function updateAnalytics() {
  const total = applications.length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const review = applications.filter(a => a.status === 'under-review').length;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

  document.getElementById('totalApplications').textContent = total;
  document.getElementById('approvedCount').textContent = approved;
  document.getElementById('reviewCount').textContent = review;
  document.getElementById('approvalRate').textContent = rate + '%';
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}

// ===== Admin Management UI =====
function updateAdminScholarshipList() {
  const list = document.getElementById('adminScholarshipList');
  list.innerHTML = '';

  if (scholarships.length === 0) {
    list.innerHTML = '<li style="text-align: center; padding: 20px; color: #718096;">No scholarships added yet</li>';
    return;
  }

  scholarships.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${s.name}</strong> - $${s.amount.toLocaleString()}<br>
        <span style="color: #718096; font-size: 12px;">Deadline: ${s.deadline} | Awards: ${s.awards} | Min GPA: ${s.gpa}</span>
      </div>
      <div>
        <button onclick="editScholarship(${s.id})" style="background: #2196f3;">✏️ Edit</button>
        <button onclick="deleteScholarship(${s.id})" class="delete-btn">🗑️ Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// ===== PDF Export =====
function downloadApplicationsPDF() {
  const element = document.getElementById('myApplications');
  const opt = {
    margin: 10,
    filename: 'my-applications.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  html2pdf().set(opt).from(element).save();
  showNotification('📥 Applications PDF downloaded!', 'success');
}

function downloadScholarshipsPDF() {
  const element = document.getElementById('adminScholarshipList');
  const opt = {
    margin: 10,
    filename: 'scholarships.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  html2pdf().set(opt).from(element).save();
  showNotification('📥 Scholarships PDF downloaded!', 'success');
}

// Close modals on outside click
window.onclick = function(event) {
  const loginModal = document.getElementById('loginModal');
  const detailModal = document.getElementById('detailModal');
  if (event.target === loginModal) {
    closeLoginModal();
  }
  if (event.target === detailModal) {
    closeDetailModal();
  }
};
