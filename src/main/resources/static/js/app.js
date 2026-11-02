// Public Application Frontend Script for CloudCon 2026 Registration Portal

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? ''
  : '';

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
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const stats = await res.json();

    document.getElementById('statTotal').innerText = stats.total || 0;
    document.getElementById('statApproved').innerText = stats.approved || 0;
    document.getElementById('statPending').innerText = stats.pending || 0;
    document.getElementById('statRate').innerText = (stats.activePercentage !== undefined 
      ? Math.round(stats.activePercentage) 
      : 0) + '%';
  } catch (err) {
    console.warn('Could not load stats:', err);
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

  try {
    const payload = {
      fullName,
      email,
      affiliation,
      ticketType,
      track,
      dietaryRequirement
    };

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('confirmedRegId').innerText = data.registrationId;
      confirmationBox.style.display = 'block';
      regForm.reset();
      loadLiveStats();
      confirmationBox.scrollIntoView({ behavior: 'smooth' });
    } else {
      errorAlert.innerText = data.error || 'Registration failed. Please check your details.';
      errorAlert.style.display = 'block';
    }
  } catch (err) {
    errorAlert.innerText = 'Network error communicating with the server.';
    errorAlert.style.display = 'block';
  } finally {
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
    const res = await fetch(`/api/track/${encodeURIComponent(query)}`);
    if (res.ok) {
      const p = await res.json();
      document.getElementById('trackFullName').innerText = p.fullName;
      document.getElementById('trackRegId').innerText = p.registrationId;
      document.getElementById('trackEmail').innerText = p.email;
      document.getElementById('trackOrg').innerText = p.affiliation;
      document.getElementById('trackTrack').innerText = p.track;
      document.getElementById('trackTicket').innerText = p.ticketType;

      const badge = document.getElementById('trackStatusBadge');
      badge.innerText = p.status;
      badge.className = `badge badge-${p.status.toLowerCase()}`;

      resultCard.style.display = 'block';
    } else {
      notFoundAlert.innerText = 'No registration found for that ID or Email.';
      notFoundAlert.style.display = 'block';
    }
  } catch (err) {
    notFoundAlert.innerText = 'Error connecting to lookup service.';
    notFoundAlert.style.display = 'block';
  }
}
