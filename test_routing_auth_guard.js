const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\KASHISH JAIN\\OneDrive\\Desktop\\StaySync_2026';

console.log('=================================================================');
console.log(' STAYSYNC ROUTING, AUTH GUARD & DEFAULT LANDING PAGE TEST SUITE  ');
console.log('=================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Verify App.jsx Routing
console.log('--- TEST 1: App.jsx Default Application Route ---');
const appPath = path.join(ROOT, 'frontend/src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes('<Route path="/" element={<AuthLandingPage defaultTab="LOGIN" />} />') ||
  appContent.includes('<Route path="/" element={<AuthLandingPage'),
  'Root route "/" points directly to AuthLandingPage'
);

assert(
  appContent.includes('<Route path="/login" element={<AuthLandingPage'),
  'Route "/login" points directly to AuthLandingPage'
);

assert(
  appContent.includes('<Route path="/register" element={<AuthLandingPage'),
  'Route "/register" points directly to AuthLandingPage'
);

assert(
  !appContent.includes('<Route path="/" element={<LandingPage />'),
  'Root route does NOT point to old hotel browsing LandingPage'
);

// 2. Verify Route Protection in App.jsx
console.log('\n--- TEST 2: Protected Routes in App.jsx ---');
const protectedRoutes = [
  '/guest/dashboard',
  '/receptionist/dashboard',
  '/admin/dashboard',
  '/housekeeping/dashboard',
  '/maintenance/dashboard',
  '/services/dashboard',
  '/booking'
];

for (const route of protectedRoutes) {
  const hasProtection = appContent.includes(`path="${route}"`) && appContent.includes('ProtectedRoute');
  assert(hasProtection, `Route ${route} is strictly wrapped in ProtectedRoute`);
}

// 3. Verify ProtectedRoute.jsx
console.log('\n--- TEST 3: ProtectedRoute.jsx Guard Logic ---');
const guardPath = path.join(ROOT, 'frontend/src/components/ProtectedRoute.jsx');
const guardContent = fs.readFileSync(guardPath, 'utf8');

assert(
  guardContent.includes('<Navigate to="/login" replace />'),
  'ProtectedRoute strictly redirects unauthenticated visitors to /login with replace'
);

assert(
  guardContent.includes('403 Forbidden') || guardContent.includes('Access Restricted'),
  'ProtectedRoute renders 403 Forbidden when role is unauthorized'
);

assert(
  guardContent.includes('getRoleDashboard'),
  'ProtectedRoute provides return link to user designated role dashboard'
);

// 4. Verify AuthLandingPage.jsx Content
console.log('\n--- TEST 4: AuthLandingPage.jsx Required Elements ---');
const authPagePath = path.join(ROOT, 'frontend/src/pages/AuthLandingPage.jsx');
const authPageContent = fs.readFileSync(authPagePath, 'utf8');

assert(authPageContent.includes('StaySync'), 'Contains StaySync brand name');
assert(authPageContent.includes('“Your Stay, Seamlessly Connected.”'), 'Contains official tagline');
assert(authPageContent.includes('Continue as Guest'), 'Contains Continue as Guest option');
assert(authPageContent.includes('Guest Portal') || authPageContent.includes('1. Guest Portal'), 'Contains Guest Portal');
assert(authPageContent.includes('Hotel Manager') || authPageContent.includes('Admin Portal') || authPageContent.includes('3. Hotel Manager'), 'Contains Admin / Manager Portal');
assert(authPageContent.includes('Receptionist Portal') || authPageContent.includes('2. Receptionist Portal'), 'Contains Receptionist Portal');
assert(authPageContent.includes('Housekeeping Portal') || authPageContent.includes('4. Housekeeping Portal'), 'Contains Housekeeping Portal');
assert(authPageContent.includes('Maintenance Portal') || authPageContent.includes('5. Maintenance Portal'), 'Contains Maintenance Portal');
assert(authPageContent.includes('Restaurant') || authPageContent.includes('6. Restaurant'), 'Contains Restaurant / Service Staff Portal');

// 5. Verify Light Luxury Color Palette
console.log('\n--- TEST 5: Light Luxury Design Palette Compliance ---');
const requiredColors = ['#FAF9F6', '#F4F0E8', '#5B6A53', '#8C754E', '#343B36', '#FFFFFF'];
for (const color of requiredColors) {
  assert(authPageContent.includes(color), `Uses light luxury token ${color}`);
}

// 6. Verify AuthContext.jsx Session Persistence
console.log('\n--- TEST 6: AuthContext.jsx Persistence & Expiry Handling ---');
const authCtxPath = path.join(ROOT, 'frontend/src/context/AuthContext.jsx');
const authCtxContent = fs.readFileSync(authCtxPath, 'utf8');

assert(authCtxContent.includes('staysync_token') && authCtxContent.includes('staysync_user'), 'Persists token and user in localStorage');
assert(authCtxContent.includes('api.getMe()'), 'Validates session with server on initialization');
assert(authCtxContent.includes('logout()'), 'Provides secure logout method that purges credentials');

// 7. Verify Navbar.jsx Navigation
console.log('\n--- TEST 7: Navbar.jsx Authentication Links ---');
const navbarPath = path.join(ROOT, 'frontend/src/components/Navbar.jsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

assert(navbarContent.includes("navigate('/login', { replace: true })"), 'Navbar logout redirects to /login with history replacement');
assert(navbarContent.includes('Portal Login') || navbarContent.includes('Sign In'), 'Unauthenticated users see Portal Login / Sign In');

console.log('\n=================================================================');
console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('=================================================================\n');

if (failed > 0) process.exit(1);
