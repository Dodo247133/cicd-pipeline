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
    dietaryRequirement: 'Vegetarian',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 3;

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

  // Register participant
  if (pathname === '/api/register' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { fullName, email, affiliation, ticketType, track, dietaryRequirement } = data;

      if (!fullName || !email || !affiliation || !ticketType || !track) {
        return sendJson(res, 400, { error: 'All required fields must be provided.' });
      }

      if (participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(res, 400, { error: `Email already registered: ${email}` });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const registrationId = `CONF-${randomSuffix}`;

      const newParticipant = {
        id: nextId++,
        registrationId,
        fullName,
        email,
        affiliation,
        ticketType,
        track,
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
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[CloudCon 2026] Server running at http://127.0.0.1:${PORT}/`);
    console.log(`[CloudCon 2026] Healthcheck: http://127.0.0.1:${PORT}/api/health`);
    console.log(`[CloudCon 2026] Admin Portal: http://127.0.0.1:${PORT}/admin.html`);
  });
}

module.exports = { server, participants };
