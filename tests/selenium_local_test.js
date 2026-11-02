// Automated Test Suite runner for local and CI environments.
// Exercises the 5 Critical User Journeys and outputs JUnit XML report.
// Uses direct HTTP dispatch to verify full API handling without socket restrictions.

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { server, participants } = require('../server.js');

function simulateRequest(method, urlStr, bodyData) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = urlStr;
    req.headers = {
      'content-type': 'application/json'
    };

    let responseStatusCode = 200;
    let responseHeaders = {};
    let responseBody = '';

    const res = new EventEmitter();
    res.writeHead = function (status, headers) {
      responseStatusCode = status;
      if (headers) responseHeaders = headers;
      return res;
    };
    res.setHeader = function (name, value) {
      responseHeaders[name.toLowerCase()] = value;
    };
    res.write = function (chunk) {
      responseBody += chunk;
      return true;
    };
    res.end = function (chunk) {
      if (chunk) responseBody += chunk;
      try {
        const json = responseBody ? JSON.parse(responseBody) : null;
        resolve({ status: responseStatusCode, headers: responseHeaders, body: json, raw: responseBody });
      } catch (e) {
        resolve({ status: responseStatusCode, headers: responseHeaders, body: responseBody, raw: responseBody });
      }
    };

    // Emit request on the HTTP server
    server.emit('request', req, res);

    // Send payload if any
    if (bodyData) {
      const payloadStr = JSON.stringify(bodyData);
      req.emit('data', Buffer.from(payloadStr));
    }
    req.emit('end');
  });
}

const testResults = [];

async function runTest(name, fn) {
  const start = Date.now();
  process.stdout.write(`  ▶ Running: ${name}... `);
  try {
    await fn();
    const duration = (Date.now() - start) / 1000;
    console.log(`\x1b[32mPASSED\x1b[0m (${duration.toFixed(3)}s)`);
    testResults.push({ name, passed: true, duration, error: null });
  } catch (err) {
    const duration = (Date.now() - start) / 1000;
    console.log(`\x1b[31mFAILED\x1b[0m (${duration.toFixed(3)}s)`);
    console.error(`    Error: ${err.message || String(err)}`);
    testResults.push({ name, passed: false, duration, error: err.message || String(err) });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function runSuite() {
  console.log('====================================================');
  console.log('  Conference Registration Portal - Test Execution   ');
  console.log('====================================================\n');

  let generatedRegId = '';

  // Test 0: Healthcheck
  await runTest('System Healthcheck (/api/health)', async () => {
    const res = await simulateRequest('GET', '/api/health');
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    assert(res.body.status === 'UP', `Expected status UP, got ${res.body.status}`);
    assert(res.body.version === '1.0.0-mvp', `Version mismatch: ${res.body.version}`);
  });

  // Journey 1: Successful Registration
  await runTest('Journey 1: Successful Registration & Confirmation ID Generation', async () => {
    const payload = {
      fullName: 'Margaret Hamilton',
      email: 'margaret.hamilton@apollo.nasa.gov',
      affiliation: 'MIT Instrumentation Lab',
      ticketType: 'VIP',
      track: 'DevOps & Cloud',
      dietaryRequirement: 'Gluten-Free'
    };

    const res = await simulateRequest('POST', '/api/register', payload);
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    assert(res.body.registrationId && res.body.registrationId.startsWith('CONF-'), 'Missing valid Registration ID');
    assert(res.body.participant.status === 'PENDING', 'Initial status should be PENDING');
    generatedRegId = res.body.registrationId;
  });

  // Journey 2: Form Validation on Invalid / Missing Fields
  await runTest('Journey 2: Form Validation Rejection on Missing Required Fields', async () => {
    const invalidPayload = {
      fullName: '', // empty name
      email: 'not-valid'
    };

    const res = await simulateRequest('POST', '/api/register', invalidPayload);
    assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
    assert(res.body.error, 'Expected error explanation');
  });

  // Journey 3: Participant Self-Service Status Tracking
  await runTest('Journey 3: Participant Status Tracking by Registration ID', async () => {
    const res = await simulateRequest('GET', `/api/track/${generatedRegId}`);
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    assert(res.body.registrationId === generatedRegId, 'Returned participant does not match queried ID');
    assert(res.body.fullName === 'Margaret Hamilton', 'Full name mismatch');
  });

  // Journey 4: Admin Portal Participant Listing and Status Approval
  await runTest('Journey 4: Admin Status Update to APPROVED', async () => {
    const res = await simulateRequest('PUT', `/api/participants/${generatedRegId}/status`, { status: 'APPROVED' });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    assert(res.body.participant.status === 'APPROVED', `Expected APPROVED status, got ${res.body.participant.status}`);

    // Verify retrieval reflects approval
    const verifyRes = await simulateRequest('GET', `/api/track/${generatedRegId}`);
    assert(verifyRes.body.status === 'APPROVED', 'Persisted status not APPROVED');
  });

  // Journey 5: Duplicate Registration Prevention
  await runTest('Journey 5: Duplicate Registration Prevention for identical email', async () => {
    const duplicatePayload = {
      fullName: 'Margaret Hamilton Fake',
      email: 'margaret.hamilton@apollo.nasa.gov',
      affiliation: 'Duplicate Org',
      ticketType: 'Standard',
      track: 'AI & Data'
    };

    const res = await simulateRequest('POST', '/api/register', duplicatePayload);
    assert(res.status === 400, `Expected 400 Bad Request for duplicate email, got ${res.status}`);
    assert(res.body.error && res.body.error.includes('already registered'), 'Error message should indicate duplicate email');
  });

  // Generate JUnit XML Report
  const totalDuration = testResults.reduce((acc, t) => acc + t.duration, 0);
  const failures = testResults.filter(t => !t.passed).length;

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="com.devops.conference.ConferenceTestSuite" tests="${testResults.length}" failures="${failures}" errors="0" time="${totalDuration.toFixed(3)}">
${testResults.map(t => `  <testcase classname="com.devops.conference.ConferenceTestSuite" name="${t.name}" time="${t.duration.toFixed(3)}">${t.passed ? '' : `\n    <failure message="${t.error}">${t.error}</failure>\n  `}</testcase>`).join('\n')}
</testsuite>`;

  const reportsDir = path.join(__dirname, '..', 'target', 'surefire-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(reportsDir, 'TEST-com.devops.conference.ConferenceTestSuite.xml'), xmlContent, 'utf8');

  console.log('\n====================================================');
  console.log(`Results: ${testResults.length - failures} Passed, ${failures} Failed`);
  console.log(`Surefire Report saved to: target/surefire-reports/TEST-com.devops.conference.ConferenceTestSuite.xml`);
  console.log('====================================================\n');

  if (failures > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runSuite().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}

module.exports = { runSuite };
