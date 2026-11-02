// Public Application Frontend Script for CloudCon 2026 Registration Portal

// Determine API Base: points to localhost:8080 if running on file:// or VS Code Live Server (port 5500)
const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '8080' && window.location.port !== '80'))
  ? 'http://localhost:8080'
  : '';

// Local fallback store for offline / static-server testing
function getLocalParticipants() {
  try {
    const raw = localStorage.getItem('cloudcon_participants');
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaults = [
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
  localStorage.setItem('cloudcon_participants', JSON.stringify(defaults));
  return defaults;
}

function saveLocalParticipants(list) {
  try {
    localStorage.setItem('cloudcon_participants', JSON.stringify(list));
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  loadLiveStats();

  const regForm = document.getElementById('registrationForm');
  const trackBtn = document.getElementById('trackBtn');

  if (regForm) {
    regForm.addEventListener('submit', handleRegistrationSubmit);
  }

  if (trackBtn) {
    trackBtn.addEventListener('click', handleTrackStatus);
  }
});

// Load summary metrics
async function loadLiveStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (res.ok) {
      const stats = await res.json();
      renderStats(stats);
      return;
    }
  } catch (err) {
    // Backend offline; use local fallback store
  }

  // Fallback to local store
  const list = getLocalParticipants();
  const total = list.length;
  const approved = list.filter(p => p.status === 'APPROVED').length;
  const pending = list.filter(p => p.status === 'PENDING').length;
  const activePercentage = total > 0 ? (approved / total) * 100 : 0;
  renderStats({ total, approved, pending, activePercentage });
}

function renderStats(stats) {
  const totalEl = document.getElementById('statTotal');
  const approvedEl = document.getElementById('statApproved');
  const pendingEl = document.getElementById('statPending');
  const rateEl = document.getElementById('statRate');

  if (totalEl) totalEl.innerText = stats.total || 0;
  if (approvedEl) approvedEl.innerText = stats.approved || 0;
  if (pendingEl) pendingEl.innerText = stats.pending || 0;
  if (rateEl) {
    rateEl.innerText = (stats.activePercentage !== undefined 
      ? Math.round(stats.activePercentage) 
      : 0) + '%';
  }
}

// Handle Form Submission with Validation
async function handleRegistrationSubmit(e) {
  e.preventDefault();

  const validationAlert = document.getElementById('validationAlert');
  const errorAlert = document.getElementById('errorAlert');
  const confirmationBox = document.getElementById('confirmationBox');
  const submitBtn = document.getElementById('submitBtn');

  validationAlert.style.display = 'none';
  errorAlert.style.display = 'none';
  confirmationBox.style.display = 'none';

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const affiliation = document.getElementById('affiliation').value.trim();
  const ticketType = document.getElementById('ticketType').value;
  const track = document.getElementById('track').value;
  const dietaryRequirement = document.getElementById('dietaryRequirement').value.trim();

  // Client-side validations
  if (!fullName || fullName.length < 2) {
    validationAlert.innerText = 'Full name is required (at least 2 characters).';
    validationAlert.style.display = 'block';
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    validationAlert.innerText = 'Please enter a valid work email address.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!affiliation) {
    validationAlert.innerText = 'Organization / Affiliation is required.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!ticketType) {
    validationAlert.innerText = 'Please select a valid ticket type.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!track) {
    validationAlert.innerText = 'Please select a conference track.';
    validationAlert.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = 'Submitting...';

  const payload = {
    fullName,
    email,
    affiliation,
    ticketType,
    track,
    dietaryRequirement
  };

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      displaySuccess(data.registrationId);
      return;
    } else if (res.status === 400) {
      const data = await res.json();
      errorAlert.innerText = data.error || 'Registration rejected.';
      errorAlert.style.display = 'block';
      return;
    }
    // If status 404 or server error, fall through to fallback
  } catch (err) {
    // Network error connecting to backend
  }

  // Graceful Local Fallback: allows testing directly via file:// or Live Server without 404!
  const list = getLocalParticipants();
  if (list.some(p => p.email.toLowerCase() === email.toLowerCase())) {
    errorAlert.innerText = `Email already registered: ${email}`;
    errorAlert.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Registration';
    return;
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const registrationId = `CONF-${randomSuffix}`;

  const newParticipant = {
    id: Date.now(),
    registrationId,
    fullName,
    email,
    affiliation,
    ticketType,
    track,
    dietaryRequirement: dietaryRequirement || 'None',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  list.push(newParticipant);
  saveLocalParticipants(list);
  displaySuccess(registrationId);

  function displaySuccess(regId) {
    document.getElementById('confirmedRegId').innerText = regId;
    confirmationBox.style.display = 'block';
    document.getElementById('registrationForm').reset();
    loadLiveStats();
    confirmationBox.scrollIntoView({ behavior: 'smooth' });
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Registration';
  }
}

// Self-Service Lookup
async function handleTrackStatus() {
  const query = document.getElementById('trackInput').value.trim();
  const notFoundAlert = document.getElementById('trackNotFound');
  const resultCard = document.getElementById('trackResultCard');

  notFoundAlert.style.display = 'none';
  resultCard.style.display = 'none';

  if (!query) {
    notFoundAlert.innerText = 'Please enter your Registration ID or Email address.';
    notFoundAlert.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/track/${encodeURIComponent(query)}`);
    if (res.ok) {
      const p = await res.json();
      renderTrackResult(p);
      return;
    }
  } catch (err) {
    // fallback to local store
  }

  // Fallback to local store
  const list = getLocalParticipants();
  const match = list.find(p => 
    p.registrationId.toLowerCase() === query.toLowerCase() ||
    p.email.toLowerCase() === query.toLowerCase()
  );

  if (match) {
    renderTrackResult(match);
  } else {
    notFoundAlert.innerText = 'No registration found for that ID or Email.';
    notFoundAlert.style.display = 'block';
  }
}

function renderTrackResult(p) {
  document.getElementById('trackFullName').innerText = p.fullName;
  document.getElementById('trackRegId').innerText = p.registrationId;
  document.getElementById('trackEmail').innerText = p.email;
  document.getElementById('trackOrg').innerText = p.affiliation;
  document.getElementById('trackTrack').innerText = p.track;
  document.getElementById('trackTicket').innerText = p.ticketType;

  const badge = document.getElementById('trackStatusBadge');
  badge.innerText = p.status;
  badge.className = `badge badge-${p.status.toLowerCase()}`;

  document.getElementById('trackResultCard').style.display = 'block';
}
