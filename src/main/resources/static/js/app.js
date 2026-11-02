// Public Attendee & Student Portal Frontend Script for CloudCon 2026

const API_BASE = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '8080' && window.location.port !== '80'))
  ? 'http://localhost:8080'
  : '';

let availableEvents = [];

// Default demo events for instant local & offline fallback
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

  const defaults = [
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
  loadEvents();

  const regForm = document.getElementById('registrationForm');
  const trackBtn = document.getElementById('trackBtn');
  const eventSearchInput = document.getElementById('eventSearchInput');
  const eventTrackFilter = document.getElementById('eventTrackFilter');
  const selectedEvent = document.getElementById('selectedEvent');

  if (regForm) {
    regForm.addEventListener('submit', handleRegistrationSubmit);
  }

  if (trackBtn) {
    trackBtn.addEventListener('click', handleTrackStatus);
  }

  if (eventSearchInput) {
    eventSearchInput.addEventListener('input', renderEvents);
  }

  if (eventTrackFilter) {
    eventTrackFilter.addEventListener('change', renderEvents);
  }

  if (selectedEvent) {
    selectedEvent.addEventListener('change', () => {
      const selectedId = selectedEvent.value;
      const evt = availableEvents.find(e => e.eventId === selectedId);
      if (evt && evt.track) {
        const trackDropdown = document.getElementById('track');
        if (trackDropdown) trackDropdown.value = evt.track;
      }
    });
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
  } catch (err) {}

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

// Load and fetch events
async function loadEvents() {
  try {
    const res = await fetch(`${API_BASE}/api/events`);
    if (res.ok) {
      availableEvents = await res.json();
      saveLocalEvents(availableEvents);
      renderEvents();
      populateEventDropdown();
      return;
    }
  } catch (err) {}

  availableEvents = getLocalEvents();
  renderEvents();
  populateEventDropdown();
}

// Render event cards grid
function renderEvents() {
  const container = document.getElementById('eventsGrid');
  if (!container) return;

  const search = (document.getElementById('eventSearchInput')?.value || '').toLowerCase().trim();
  const track = document.getElementById('eventTrackFilter')?.value || '';

  const filtered = availableEvents.filter(e => {
    const matchSearch = !search ||
      e.title.toLowerCase().includes(search) ||
      (e.description && e.description.toLowerCase().includes(search)) ||
      (e.location && e.location.toLowerCase().includes(search));
    const matchTrack = !track || e.track === track;
    return matchSearch && matchTrack;
  });

  const countBadge = document.getElementById('statEventsCount');
  if (countBadge) countBadge.innerText = availableEvents.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--gray-600); background: var(--gray-100); border-radius: 8px;">
        🔍 No conference events match your search criteria. Try a different keyword or track filter.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(e => {
    const remaining = Math.max(0, (e.capacity || 200) - (e.registeredCount || 0));
    const percentage = Math.min(100, Math.round(((e.registeredCount || 0) / (e.capacity || 200)) * 100));

    return `
      <div class="event-card">
        <div>
          <div class="event-card-header">
            <span class="badge" style="background: var(--primary-light); color: var(--primary); font-size: 0.8rem;">
              ${escapeHtml(e.track)}
            </span>
            <span class="badge ${remaining > 20 ? 'badge-approved' : 'badge-pending'}">
              ${remaining} seats left
            </span>
          </div>
          <h3 class="event-title">${escapeHtml(e.title)}</h3>
          <div class="event-meta">
            <div>📅 <strong>Date:</strong> ${escapeHtml(e.date)}</div>
            <div>📍 <strong>Location:</strong> ${escapeHtml(e.location)}</div>
            <div>🎟️ <strong>Pricing:</strong> ${escapeHtml(e.price || 'Free Registration')}</div>
          </div>
          <p class="event-desc">${escapeHtml(e.description)}</p>
        </div>

        <div>
          <div style="font-size: 0.8rem; color: var(--gray-600); display: flex; justify-content: space-between;">
            <span>Reserved: ${e.registeredCount || 0} / ${e.capacity || 200}</span>
            <span>${percentage}%</span>
          </div>
          <div class="capacity-bar-container">
            <div class="capacity-bar" style="width: ${percentage}%;"></div>
          </div>
          <div class="event-footer">
            <button class="btn btn-primary" onclick="selectEventForRegistration('${e.eventId}')">
              Register for this Event &rarr;
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Populate Event dropdown inside Registration Form
function populateEventDropdown() {
  const dropdown = document.getElementById('selectedEvent');
  if (!dropdown) return;

  if (availableEvents.length === 0) {
    dropdown.innerHTML = '<option value="">No events currently scheduled</option>';
    return;
  }

  dropdown.innerHTML = '<option value="">-- Choose an Event to Register --</option>' +
    availableEvents.map(e => `
      <option value="${e.eventId}" data-track="${e.track}">
        ${escapeHtml(e.title)} (${e.date}) - [${e.track}]
      </option>
    `).join('');
}

// Global hook when clicking "Register for this Event" on card
window.selectEventForRegistration = function(eventId) {
  const dropdown = document.getElementById('selectedEvent');
  const trackDropdown = document.getElementById('track');
  const regSection = document.getElementById('register-section');

  if (dropdown) {
    dropdown.value = eventId;
    const evt = availableEvents.find(e => e.eventId === eventId);
    if (evt && trackDropdown) {
      trackDropdown.value = evt.track;
    }
  }

  if (regSection) {
    regSection.scrollIntoView({ behavior: 'smooth' });
    // Highlight effect
    regSection.style.transition = 'box-shadow 0.3s';
    regSection.style.boxShadow = '0 0 0 4px var(--primary-light)';
    setTimeout(() => {
      regSection.style.boxShadow = 'var(--shadow-sm)';
    }, 1500);
  }
};

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

  const selectedEventId = document.getElementById('selectedEvent').value;
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const affiliation = document.getElementById('affiliation').value.trim();
  const ticketType = document.getElementById('ticketType').value;
  const track = document.getElementById('track').value;
  const dietaryRequirement = document.getElementById('dietaryRequirement').value.trim();

  if (!selectedEventId) {
    validationAlert.innerText = 'Please select an event to register for.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!fullName || fullName.length < 2) {
    validationAlert.innerText = 'Full name is required (at least 2 characters).';
    validationAlert.style.display = 'block';
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    validationAlert.innerText = 'Please enter a valid work or student email address.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!affiliation) {
    validationAlert.innerText = 'Organization or University is required.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!ticketType) {
    validationAlert.innerText = 'Please select a ticket category.';
    validationAlert.style.display = 'block';
    return;
  }

  if (!track) {
    validationAlert.innerText = 'Please select a conference track.';
    validationAlert.style.display = 'block';
    return;
  }

  const chosenEvent = availableEvents.find(e => e.eventId === selectedEventId);
  const eventTitle = chosenEvent ? chosenEvent.title : 'CloudCon 2026 Summit';

  submitBtn.disabled = true;
  submitBtn.innerText = 'Submitting Registration...';

  const payload = {
    eventId: selectedEventId,
    eventTitle,
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
      displaySuccess(data.registrationId, eventTitle);
      loadEvents(); // refresh counts
      return;
    } else if (res.status === 400) {
      const data = await res.json();
      errorAlert.innerText = data.error || 'Registration rejected.';
      errorAlert.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerText = 'Submit Event Registration';
      return;
    }
  } catch (err) {}

  // Fallback local store
  const list = getLocalParticipants();
  if (list.some(p => p.email.toLowerCase() === email.toLowerCase())) {
    errorAlert.innerText = `Email already registered: ${email}`;
    errorAlert.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Event Registration';
    return;
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const registrationId = `CONF-${randomSuffix}`;

  const newParticipant = {
    id: Date.now(),
    registrationId,
    eventId: selectedEventId,
    eventTitle,
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

  // Increment event registered count in local store
  if (chosenEvent) {
    chosenEvent.registeredCount = (chosenEvent.registeredCount || 0) + 1;
    saveLocalEvents(availableEvents);
    renderEvents();
  }

  displaySuccess(registrationId, eventTitle);

  function displaySuccess(regId, title) {
    document.getElementById('confirmedRegId').innerText = regId;
    document.getElementById('confirmedEventName').innerText = `Registered for: ${title}`;
    confirmationBox.style.display = 'block';
    document.getElementById('registrationForm').reset();
    loadLiveStats();
    confirmationBox.scrollIntoView({ behavior: 'smooth' });
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Event Registration';
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
  } catch (err) {}

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
  document.getElementById('trackEventTitle').innerText = p.eventTitle || 'CloudCon 2026 Summit';
  document.getElementById('trackEmail').innerText = p.email;
  document.getElementById('trackOrg').innerText = p.affiliation;
  document.getElementById('trackTrack').innerText = p.track;
  document.getElementById('trackTicket').innerText = p.ticketType;

  const badge = document.getElementById('trackStatusBadge');
  badge.innerText = p.status;
  badge.className = `badge badge-${p.status.toLowerCase()}`;

  document.getElementById('trackResultCard').style.display = 'block';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
