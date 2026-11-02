// Admin Dashboard Management Script for CloudCon 2026

let allParticipants = [];

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
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const stats = await res.json();

    document.getElementById('adminStatTotal').innerText = stats.total || 0;
    document.getElementById('adminStatPending').innerText = stats.pending || 0;
    document.getElementById('adminStatApproved').innerText = stats.approved || 0;
    document.getElementById('adminStatRejected').innerText = stats.rejected || 0;
    document.getElementById('adminStatCheckedIn').innerText = stats.checkedIn || 0;
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

// Fetch all participants
async function loadParticipants() {
  const tbody = document.getElementById('participantsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">Loading participants...</td></tr>';

  try {
    const res = await fetch('/api/participants');
    if (!res.ok) throw new Error('Failed to fetch data');
    allParticipants = await res.json();
    filterAndRender();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--danger); padding: 2rem;">Error: ${err.message}</td></tr>`;
  }
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
    const res = await fetch(`/api/participants/${regId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Error updating status: ${err.error || 'Server error'}`);
      return;
    }

    // Refresh state
    await loadAdminStats();
    await loadParticipants();
  } catch (err) {
    alert(`Network error: ${err.message}`);
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
