// Admin Dashboard Management Script for CloudCon 2026

const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '8080' && window.location.port !== '80'))
  ? 'http://localhost:8080'
  : '';

let allParticipants = [];

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
  loadAdminStats();
  loadParticipants();

  document.getElementById('btnRefresh').addEventListener('click', () => {
    loadAdminStats();
    loadParticipants();
  });

  document.getElementById('searchInput').addEventListener('input', filterAndRender);
  document.getElementById('statusFilter').addEventListener('change', filterAndRender);
  document.getElementById('trackFilter').addEventListener('change', filterAndRender);
  document.getElementById('btnExportCSV').addEventListener('click', exportToCSV);
});

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

  // Fallback
  const list = getLocalParticipants();
  const total = list.length;
  const pending = list.filter(p => p.status === 'PENDING').length;
  const approved = list.filter(p => p.status === 'APPROVED').length;
  const rejected = list.filter(p => p.status === 'REJECTED').length;
  const checkedIn = list.filter(p => p.status === 'CHECKED_IN').length;
  renderAdminStats({ total, pending, approved, rejected, checkedIn });
}

function renderAdminStats(stats) {
  document.getElementById('adminStatTotal').innerText = stats.total || 0;
  document.getElementById('adminStatPending').innerText = stats.pending || 0;
  document.getElementById('adminStatApproved').innerText = stats.approved || 0;
  document.getElementById('adminStatRejected').innerText = stats.rejected || 0;
  document.getElementById('adminStatCheckedIn').innerText = stats.checkedIn || 0;
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

  // Fallback to local store
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
        <td>${escapeHtml(p.affiliation)}</td>
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

  // Fallback to local store
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

  const headers = ['Registration ID', 'Full Name', 'Email', 'Affiliation', 'Ticket Type', 'Track', 'Dietary Preference', 'Status', 'Registered At'];
  const rows = allParticipants.map(p => [
    `"${p.registrationId}"`,
    `"${p.fullName.replace(/"/g, '""')}"`,
    `"${p.email.replace(/"/g, '""')}"`,
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
