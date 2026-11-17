const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runRBACTests() {
  console.log('=====================================================');
  console.log('STAYSYNC RBAC SECURITY & ROLE LOGIN TEST SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`PASS: ${message}`);
      passed++;
    } else {
      console.error(`FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Reject public signup with MANAGER role
  console.log('--- TEST 1: Public privilege escalation prevention ---');
  const managerSignup = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Attacker User',
    email: `attacker_${Date.now()}@staysync.com`,
    password: 'Password123!',
    role: 'MANAGER'
  });
  assert(managerSignup.status === 403, `Public registration with role MANAGER rejected with 403 (got ${managerSignup.status})`);

  // TEST 2: Reject public signup with RECEPTIONIST role
  const receptionSignup = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Attacker User',
    email: `attacker_rec_${Date.now()}@staysync.com`,
    password: 'Password123!',
    role: 'RECEPTIONIST'
  });
  assert(receptionSignup.status === 403, `Public registration with role RECEPTIONIST rejected with 403 (got ${receptionSignup.status})`);

  // TEST 3: Public signup with GUEST role succeeds
  console.log('\n--- TEST 2: Legitimate guest registration ---');
  const guestEmail = `test_guest_${Date.now()}@staysync.com`;
  const guestSignup = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Eleanor Vance',
    email: guestEmail,
    password: 'Password123!',
    role: 'GUEST',
    phone: '+91 98200 11111'
  });
  assert(guestSignup.status === 201, `Guest registration returns 201 Created (got ${guestSignup.status})`);
  assert(guestSignup.data.data.user.role === 'GUEST', `Guest registration user role is strictly GUEST`);
  assert(!!guestSignup.data.data.token, `Guest registration returns valid JWT token`);

  // TEST 4: Duplicate email returns 409 Conflict
  console.log('\n--- TEST 3: Duplicate email prevention ---');
  const duplicateSignup = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Eleanor Vance Duplicate',
    email: guestEmail,
    password: 'Password123!',
    role: 'GUEST'
  });
  assert(duplicateSignup.status === 409, `Duplicate email registration returns 409 Conflict (got ${duplicateSignup.status})`);

  // TEST 5: Verify login for all 6 demo role accounts
  console.log('\n--- TEST 4: Verification of all 6 Demo Role Logins ---');
  const demoAccounts = [
    { role: 'GUEST', email: 'guest@staysync.com' },
    { role: 'RECEPTIONIST', email: 'reception@staysync.com' },
    { role: 'MANAGER', email: 'manager@staysync.com' },
    { role: 'HOUSEKEEPING', email: 'housekeeping@staysync.com' },
    { role: 'MAINTENANCE', email: 'maintenance@staysync.com' },
    { role: 'RESTAURANT', email: 'service@staysync.com' }
  ];

  for (const acc of demoAccounts) {
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: acc.email,
      password: 'StaySync@2026'
    });

    assert(loginRes.status === 200, `Login for ${acc.role} (${acc.email}) returns 200 OK`);
    assert(loginRes.data.data.user.role === acc.role, `Login payload matches role ${acc.role}`);
    assert(!!loginRes.data.data.token, `Token issued for ${acc.role}`);
  }

  // TEST 6: Invalid password returns 401 Unauthorized
  console.log('\n--- TEST 5: Invalid credentials handling ---');
  const badLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'guest@staysync.com',
    password: 'WrongPassword999'
  });
  assert(badLogin.status === 401, `Invalid credentials returns 401 Unauthorized (got ${badLogin.status})`);

  console.log(`\n=====================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRBACTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
