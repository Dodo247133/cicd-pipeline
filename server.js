// Lightweight, zero-dependency Node.js HTTP server for local testing and demonstration.
// Serves static assets from src/main/resources/static/ and provides the full REST API.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const STATIC_DIR = path.join(__dirname, 'src', 'main', 'resources', 'static');

// In-Memory Database
let participants = [
  {
    id: 1,
    registrationId: 'CONF-DEMO001',
    fullName: 'Grace Hopper',
    email: 'grace.hopper@navy.mil',
    affiliation: 'Computing Pioneer Lab',
    ticketType: 'VIP',
    track: 'DevOps & Cloud',
    eventId: 'EVT-CLOUD2026',
    eventTitle: 'Cloud Native & Kubernetes Global Summit',
    dietaryRequirement: 'None',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    eventTitle: 'Generative AI & LLM Engineering Symposium',
    dietaryRequirement: 'Vegetarian',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 3;

// In-Memory Hosted Events Dataset
let events = [
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

let nextEventId = 5;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const rawPath = parsedUrl.pathname || '/';
  const pathname = (rawPath.length > 1 && rawPath.endsWith('/')) ? rawPath.slice(0, -1) : rawPath;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API Endpoints ---

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'UP',
      service: 'conference-registration-portal',
      version: '1.0.0-mvp',
      timestamp: new Date().toISOString(),
      activeParticipants: participants.length
    });
  }

  // Registration statistics
  if (pathname === '/api/stats' && method === 'GET') {
    const total = participants.length;
    const pending = participants.filter(p => p.status === 'PENDING').length;
    const approved = participants.filter(p => p.status === 'APPROVED').length;
    const rejected = participants.filter(p => p.status === 'REJECTED').length;
    const checkedIn = participants.filter(p => p.status === 'CHECKED_IN').length;
    const activePercentage = total > 0 ? ((approved + checkedIn) / total) * 100 : 0;

    return sendJson(res, 200, {
      total,
      pending,
      approved,
      rejected,
      checkedIn,
      activePercentage
    });
  }

  // Admin Authentication
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { username, password } = data;
      if (username === 'admin' && password === 'admin123') {
        return sendJson(res, 200, {
          success: true,
          token: 'token-' + Buffer.from(username + ':' + Date.now()).toString('base64'),
          username: 'admin',
          role: 'ADMINISTRATOR'
        });
      } else {
        return sendJson(res, 401, { error: 'Invalid administrator credentials. Access denied.' });
      }
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid request body' });
    }
  }

  // --- Events API Endpoints ---
  // List events with search and track filters
  if (pathname === '/api/events' && method === 'GET') {
    let result = [...events];
    const { search, track } = parsedUrl.query;

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
      );
    }
    if (track) {
      result = result.filter(e => e.track.toLowerCase() === track.toLowerCase());
    }

    return sendJson(res, 200, result);
  }

  // Host a new event (Admin)
  if (pathname === '/api/events' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { title, track, date, location, capacity, price, description } = data;

      if (!title || !track || !date) {
        return sendJson(res, 400, { error: 'Event Title, Track, and Date are mandatory.' });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const eventId = `EVT-${randomSuffix}`;

      const newEvent = {
        id: nextEventId++,
        eventId,
        title,
        track,
        date,
        location: location || 'San Francisco & Virtual',
        capacity: parseInt(capacity) || 250,
        registeredCount: 0,
        price: price || 'Free Registration',
        description: description || 'Specialized technical summit keynote and hands-on workshop.',
        createdAt: new Date().toISOString()
      };

      events.unshift(newEvent);

      return sendJson(res, 201, {
        message: 'Event hosted and published successfully!',
        event: newEvent
      });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid event JSON payload' });
    }
  }

  // Delete an event
  const eventDeleteMatch = pathname.match(/^\/api\/events\/([^/]+)$/);
  if (eventDeleteMatch && method === 'DELETE') {
    const targetId = eventDeleteMatch[1];
    const index = events.findIndex(e => e.eventId === targetId || String(e.id) === targetId);
    if (index !== -1) {
      const removed = events.splice(index, 1)[0];
      return sendJson(res, 200, { message: 'Event removed successfully', event: removed });
    } else {
      return sendJson(res, 404, { error: 'Event not found' });
    }
  }

  // Register participant
  if (pathname === '/api/register' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { fullName, email, affiliation, ticketType, track, dietaryRequirement, eventId } = data;

      if (!fullName || !email || !affiliation || !ticketType || !track) {
        return sendJson(res, 400, { error: 'All required fields must be provided.' });
      }

      if (participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(res, 400, { error: `Email already registered: ${email}` });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const registrationId = `CONF-${randomSuffix}`;

      // Link to selected event if applicable
      let selectedEvt = events.find(e => e.eventId === eventId || e.title === data.eventTitle);
      if (selectedEvt) {
        selectedEvt.registeredCount = (selectedEvt.registeredCount || 0) + 1;
      }

      const newParticipant = {
        id: nextId++,
        registrationId,
        fullName,
        email,
        affiliation,
        ticketType,
        track,
        eventId: selectedEvt ? selectedEvt.eventId : (eventId || 'EVT-GLOBAL'),
        eventTitle: selectedEvt ? selectedEvt.title : (data.eventTitle || 'Cloud & DevOps Global Summit 2026'),
        dietaryRequirement: dietaryRequirement || 'None',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      participants.push(newParticipant);

      return sendJson(res, 201, {
        message: 'Registration submitted successfully!',
        registrationId,
        participant: newParticipant
      });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
  }

  // List participants with filters
  if (pathname === '/api/participants' && method === 'GET') {
    let result = [...participants];
    const { status, track } = parsedUrl.query;

    if (status) {
      result = result.filter(p => p.status.toUpperCase() === status.toUpperCase());
    }
    if (track) {
      result = result.filter(p => p.track.toLowerCase() === track.toLowerCase());
    }

    return sendJson(res, 200, result);
  }

  // Track status by ID or Email
  if (pathname.startsWith('/api/track/') && method === 'GET') {
    const query = decodeURIComponent(pathname.replace('/api/track/', '')).trim().toLowerCase();
    const match = participants.find(p =>
      p.registrationId.toLowerCase() === query ||
      p.email.toLowerCase() === query
    );

    if (match) {
      return sendJson(res, 200, match);
    } else {
      return sendJson(res, 404, { error: `No registration found for: ${query}` });
    }
  }

  // Update status
  const statusMatch = pathname.match(/^\/api\/participants\/([^/]+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const regId = statusMatch[1];
    try {
      const data = await parseBody(req);
      const newStatus = (data.status || '').toUpperCase().trim();
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN'];

      if (!validStatuses.includes(newStatus)) {
        return sendJson(res, 400, { error: `Invalid status: ${newStatus}` });
      }

      const target = participants.find(p => p.registrationId === regId);
      if (!target) {
        return sendJson(res, 404, { error: `Participant not found: ${regId}` });
      }

      target.status = newStatus;
      target.updatedAt = new Date().toISOString();

      return sendJson(res, 200, { message: 'Status updated successfully', participant: target });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid request' });
    }
  }

  // --- Static File Serving ---
  let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[CloudCon 2026] Server running at http://localhost:${PORT}/`);
    console.log(`[CloudCon 2026] Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`[CloudCon 2026] Admin Portal: http://localhost:${PORT}/admin.html`);
  });
}

module.exports = { server, participants };
