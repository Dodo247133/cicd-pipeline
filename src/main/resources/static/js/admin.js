// Admin Dashboard Management, Authentication & Event Hosting Script for CloudCon 2026

const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '8080' && window.location.port !== '80'))
  ? 'http://localhost:8080'
  : '';

let allParticipants = [];
let allAdminEvents = [];

const DEFAULT_EVENTS = [
  {
    id: 1,
    eventId: 'EVT-CLOUD2026',
    title: 'Cloud Native & Kubernetes Global Summit 2026',
    track: 'DevOps & Cloud',
    date: '2026-11-14',
    location: 'San Francisco, CA & Virtual Stream',
    capacity: 350,
    registeredCount: 42,
    price: 'Free / Standard $49',
    description: 'Deep dive into Kubernetes v1.31, eBPF observability, service mesh architectures, and production GitOps workflows.'
  },
  {
    id: 2,
    eventId: 'EVT-AIGEN2026',
    title: 'Generative AI & LLM Systems Symposium',
    track: 'AI & Data',
    date: '2026-11-20',
    location: 'Virtual Live Stream',
    capacity: 500,
    registeredCount: 88,
    price: 'Free / VIP $99',
    description: 'Practical engineering for multi-agent workflows, fine-tuning reasoning models, RAG pipelines, and vector databases.'
  },
  {
    id: 3,
    eventId: 'EVT-SECDEV2026',
    title: 'Zero-Trust DevSecOps Hands-On Workshop',
    track: 'Security & Governance',
    date: '2026-12-05',
    location: 'Austin Tech Center & Virtual',
    capacity: 150,
    registeredCount: 19,
    price: 'Standard $79',
    description: 'Automated container vulnerability scanning with Trivy, SBOM enforcement, and policy-as-code guardrails.'
  },
  {
    id: 4,
    eventId: 'EVT-GITOPS2026',
    title: 'Continuous Delivery & GitOps Masterclass',
    track: 'DevOps & Cloud',
    date: '2026-12-12',
    location: 'Online Interactive Lab',
    capacity: 200,
    registeredCount: 31,
    price: 'Student Free / Pro $29',
    description: 'Master ArgoCD, Declarative Jenkins Pipelines, automated canary releases, and self-healing cloud clusters.'
  }
];

function getLocalEvents() {
  try {
    const raw = localStorage.getItem('cloudcon_events');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('cloudcon_events', JSON.stringify(DEFAULT_EVENTS));
  return DEFAULT_EVENTS;
}

function saveLocalEvents(list) {
  try {
    localStorage.setItem('cloudcon_events', JSON.stringify(list));
  } catch (e) {}
}

function getLocalParticipants() {
  try {
    const raw = localStorage.getItem('cloudcon_participants');
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return [
    {
      id: 1,
      registrationId: 'CONF-DEMO001',
      fullName: 'Grace Hopper',
      email: 'grace.hopper@navy.mil',
      affiliation: 'Computing Pioneer Lab',
      ticketType: 'VIP',
      track: 'DevOps & Cloud',
      eventId: 'EVT-CLOUD2026',
      eventTitle: 'Cloud Native & Kubernetes Global Summit 2026',
      dietaryRequirement: 'None',
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      registrationId: 'CONF-DEMO002',
      fullName: 'Alan Turing',
      email: 'alan.turing@manchester.ac.uk',
      affiliation: 'Cryptography Institute',
      ticketType: 'Speaker',
      track: 'AI & Data',
      eventId: 'EVT-AIGEN2026',
      eventTitle: 'Generative AI & LLM Systems Symposium',
      dietaryRequirement: 'Vegetarian',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
  ];
}

function saveLocalParticipants(list) {
  try {
    localStorage.setItem('cloudcon_participants', JSON.stringify(list));
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndRender();

  // Admin Login Handler
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  // Logout Handler
  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleAdminLogout);
  }

  // Tab Switching
  const tabBtnReg = document.getElementById('tabBtnRegistrations');
  const tabBtnEvt = document.getElementById('tabBtnEvents');
  const viewReg = document.getElementById('viewRegistrations');
  const viewEvt = document.getElementById('viewEvents');

  if (tabBtnReg && tabBtnEvt) {
    tabBtnReg.addEventListener('click', () => {
      tabBtnReg.classList.add('active');
      tabBtnEvt.classList.remove('active');
      viewReg.style.display = 'block';
      viewEvt.style.display = 'none';
    });

    tabBtnEvt.addEventListener('click', () => {
      tabBtnEvt.classList.add('active');
      tabBtnReg.classList.remove('active');
      viewEvt.style.display = 'block';
      viewReg.style.display = 'none';
      loadAdminEvents();
    });
  }

  // Host New Event Form
  const hostEventForm = document.getElementById('hostEventForm');
  if (hostEventForm) {
    hostEventForm.addEventListener('submit', handleHostNewEvent);
  }

  document.getElementById('btnRefresh')?.addEventListener('click', () => {
    loadAdminStats();
    loadParticipants();
    loadAdminEvents();
  });

  document.getElementById('searchInput')?.addEventListener('input', filterAndRender);
  document.getElementById('statusFilter')?.addEventListener('change', filterAndRender);
  document.getElementById('trackFilter')?.addEventListener('change', filterAndRender);
  document.getElementById('btnExportCSV')?.addEventListener('click', exportToCSV);
});

// Authentication Gate Check
function checkAuthAndRender() {
  const token = sessionStorage.getItem('cloudcon_admin_token');
  const loginSection = document.getElementById('adminLoginSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const navAuth = document.getElementById('adminNavAuth');

  if (token) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    navAuth.style.display = 'flex';
    loadAdminStats();
    loadParticipants();
    loadAdminEvents();
  } else {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    navAuth.style.display = 'none';
  }
}

// Handle Admin Login Submission
async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const errorAlert = document.getElementById('adminLoginError');
  const submitBtn = document.getElementById('adminLoginSubmitBtn');

  errorAlert.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.innerText = 'Verifying...';

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem('cloudcon_admin_token', data.token || 'admin-active-session');
      checkAuthAndRender();
      return;
    } else if (res.status === 401) {
      errorAlert.innerText = 'Invalid administrator credentials. Access denied.';
      errorAlert.style.display = 'block';
      return;
    }
  } catch (err) {
    // Offline / static fallback
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Authenticate as Administrator';
  }

  if (username === 'admin' && password === 'admin123') {
    sessionStorage.setItem('cloudcon_admin_token', 'admin-session-' + Date.now());
    checkAuthAndRender();
  } else {
    errorAlert.innerText = 'Access Denied: Invalid admin username or password.';
    errorAlert.style.display = 'block';
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem('cloudcon_admin_token');
  checkAuthAndRender();
}

// Load Events for Admin
async function loadAdminEvents() {
  const tbody = document.getElementById('eventsTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Loading events...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/api/events`);
    if (res.ok) {
      allAdminEvents = await res.json();
      saveLocalEvents(allAdminEvents);
      renderAdminEventsTable();
      return;
    }
  } catch (err) {}

  allAdminEvents = getLocalEvents();
  renderAdminEventsTable();
}

function renderAdminEventsTable() {
  const tbody = document.getElementById('eventsTableBody');
  const countSpan = document.getElementById('adminEventsTabCount');
  const badgeTotal = document.getElementById('eventsBadgeTotal');

  if (countSpan) countSpan.innerText = allAdminEvents.length;
  if (badgeTotal) badgeTotal.innerText = `${allAdminEvents.length} Events Active`;

  if (!tbody) return;

  if (allAdminEvents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No events hosted yet. Use the form above to host a new event!</td></tr>';
    return;
  }

  tbody.innerHTML = allAdminEvents.map(e => {
    const percentage = Math.min(100, Math.round(((e.registeredCount || 0) / (e.capacity || 200)) * 100));

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--primary);">${e.eventId}</td>
        <td>
          <strong>${escapeHtml(e.title)}</strong>
          <div style="font-size: 0.8rem; color: var(--gray-600);">${escapeHtml(e.price || 'Free')}</div>
        </td>
        <td><span class="badge" style="background: var(--primary-light); color: var(--primary);">${escapeHtml(e.track)}</span></td>
        <td>
          <div>📅 ${escapeHtml(e.date)}</div>
          <div style="font-size: 0.8rem; color: var(--gray-600);">📍 ${escapeHtml(e.location || 'Virtual')}</div>
        </td>
        <td style="min-width: 140px;">
          <div style="font-size: 0.85rem; font-weight: 600;">${e.registeredCount || 0} / ${e.capacity || 200}</div>
          <div class="capacity-bar-container">
            <div class="capacity-bar" style="width: ${percentage}%;"></div>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteEvent('${e.eventId}')">Remove</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Handle Host New Event Form Submission
async function handleHostNewEvent(e) {
  e.preventDefault();
  const alertBox = document.getElementById('hostEventAlert');
  const errorBox = document.getElementById('hostEventError');
  const submitBtn = document.getElementById('btnPublishEvent');

  alertBox.style.display = 'none';
  errorBox.style.display = 'none';

  const title = document.getElementById('newEventTitle').value.trim();
  const track = document.getElementById('newEventTrack').value;
  const date = document.getElementById('newEventDate').value;
  const location = document.getElementById('newEventLocation').value.trim();
  const capacity = parseInt(document.getElementById('newEventCapacity').value) || 250;
  const price = document.getElementById('newEventPrice').value.trim();
  const description = document.getElementById('newEventDesc').value.trim();

  if (!title || !track || !date) {
    errorBox.innerText = 'Event Title, Conference Track, and Date are required.';
    errorBox.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = 'Publishing Event...';

  const payload = {
    title,
    track,
    date,
    location,
    capacity,
    price,
    description
  };

  try {
    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alertBox.innerText = `Event "${title}" published successfully! Attendees can now search and register for it.`;
      alertBox.style.display = 'block';
      document.getElementById('hostEventForm').reset();
      await loadAdminEvents();
      return;
    }
  } catch (err) {}

  // Fallback local store
  const list = getLocalEvents();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const newEvt = {
    id: Date.now(),
    eventId: `EVT-${randomSuffix}`,
    title,
    track,
    date,
    location: location || 'San Francisco & Virtual',
    capacity,
    registeredCount: 0,
    price: price || 'Free Registration',
    description: description || 'Specialized technical summit session.'
  };

  list.unshift(newEvt);
  saveLocalEvents(list);
  allAdminEvents = list;
  renderAdminEventsTable();

  alertBox.innerText = `Event "${title}" hosted and published successfully!`;
  alertBox.style.display = 'block';
  document.getElementById('hostEventForm').reset();
  submitBtn.disabled = false;
  submitBtn.innerText = 'Publish & Host Event';
}

// Global hook to delete event
window.deleteEvent = async function(eventId) {
  if (!confirm(`Are you sure you want to remove event ${eventId}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await loadAdminEvents();
      return;
    }
  } catch (err) {}

  const list = getLocalEvents();
  const updated = list.filter(e => e.eventId !== eventId);
  saveLocalEvents(updated);
  allAdminEvents = updated;
  renderAdminEventsTable();
};

// Load KPI counts
async function loadAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (res.ok) {
      const stats = await res.json();
      renderAdminStats(stats);
      return;
    }
  } catch (err) {}

  const list = getLocalParticipants();
  const total = list.length;
  const pending = list.filter(p => p.status === 'PENDING').length;
  const approved = list.filter(p => p.status === 'APPROVED').length;
  const rejected = list.filter(p => p.status === 'REJECTED').length;
  const checkedIn = list.filter(p => p.status === 'CHECKED_IN').length;
  renderAdminStats({ total, pending, approved, rejected, checkedIn });
}

function renderAdminStats(stats) {
  const total = stats.total || 0;
  document.getElementById('adminStatTotal').innerText = total;
  document.getElementById('adminStatPending').innerText = stats.pending || 0;
  document.getElementById('adminStatApproved').innerText = stats.approved || 0;
  document.getElementById('adminStatRejected').innerText = stats.rejected || 0;
  document.getElementById('adminStatCheckedIn').innerText = stats.checkedIn || 0;

  const tabCount = document.getElementById('adminStatTabCount');
  if (tabCount) tabCount.innerText = total;
}

// Fetch all participants
async function loadParticipants() {
  const tbody = document.getElementById('participantsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">Loading participants...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/api/participants`);
    if (res.ok) {
      allParticipants = await res.json();
      filterAndRender();
      return;
    }
  } catch (err) {}

  allParticipants = getLocalParticipants();
  filterAndRender();
}

// Filter and render table
function filterAndRender() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const status = document.getElementById('statusFilter').value.toUpperCase();
  const track = document.getElementById('trackFilter').value;

  const filtered = allParticipants.filter(p => {
    const matchSearch = !search ||
      p.fullName.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      p.registrationId.toLowerCase().includes(search) ||
      (p.eventTitle && p.eventTitle.toLowerCase().includes(search)) ||
      p.affiliation.toLowerCase().includes(search);

    const matchStatus = !status || p.status.toUpperCase() === status;
    const matchTrack = !track || p.track === track;

    return matchSearch && matchStatus && matchTrack;
  });

  const tbody = document.getElementById('participantsTableBody');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--gray-600);">No matching participant records found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const statusClass = `badge-${p.status.toLowerCase()}`;
    const approvedMarker = p.status === 'APPROVED' ? 'status-badge-approved' : '';

    return `
      <tr data-id="${p.registrationId}">
        <td style="font-family: monospace; font-weight: 600;">${p.registrationId}</td>
        <td><strong>${escapeHtml(p.fullName)}</strong></td>
        <td>${escapeHtml(p.email)}</td>
        <td>
          <span style="font-weight: 600; color: var(--primary); font-size: 0.85rem;">
            ${escapeHtml(p.eventTitle || 'CloudCon Global Summit')}
          </span>
        </td>
        <td><span class="badge" style="background: var(--gray-200); color: var(--dark);">${p.ticketType}</span></td>
        <td>${escapeHtml(p.track)}</td>
        <td><span class="badge ${statusClass} ${approvedMarker}">${p.status}</span></td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            ${p.status !== 'APPROVED' ? `<button class="btn btn-sm btn-success btn-approve" onclick="updateStatus('${p.registrationId}', 'APPROVED')">Approve</button>` : ''}
            ${p.status !== 'REJECTED' ? `<button class="btn btn-sm btn-danger btn-reject" onclick="updateStatus('${p.registrationId}', 'REJECTED')">Reject</button>` : ''}
            ${p.status === 'APPROVED' ? `<button class="btn btn-sm btn-primary btn-checkin" onclick="updateStatus('${p.registrationId}', 'CHECKED_IN')">Check-In</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update status handler
async function updateStatus(regId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/participants/${regId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      await loadAdminStats();
      await loadParticipants();
      return;
    }
  } catch (err) {}

  const list = getLocalParticipants();
  const target = list.find(p => p.registrationId === regId);
  if (target) {
    target.status = newStatus;
    saveLocalParticipants(list);
    allParticipants = list;
    loadAdminStats();
    filterAndRender();
  }
}

// CSV Export
function exportToCSV() {
  if (allParticipants.length === 0) {
    alert('No participant records to export.');
    return;
  }

  const headers = ['Registration ID', 'Full Name', 'Email', 'Event Registered', 'Affiliation', 'Ticket Type', 'Track', 'Dietary Preference', 'Status', 'Registered At'];
  const rows = allParticipants.map(p => [
    `"${p.registrationId}"`,
    `"${p.fullName.replace(/"/g, '""')}"`,
    `"${p.email.replace(/"/g, '""')}"`,
    `"${(p.eventTitle || 'CloudCon Global Summit').replace(/"/g, '""')}"`,
    `"${p.affiliation.replace(/"/g, '""')}"`,
    `"${p.ticketType}"`,
    `"${p.track}"`,
    `"${(p.dietaryRequirement || 'None').replace(/"/g, '""')}"`,
    `"${p.status}"`,
    `"${p.createdAt || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `conference_participants_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
