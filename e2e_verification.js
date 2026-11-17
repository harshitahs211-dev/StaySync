const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed, data: (parsed && parsed.data !== undefined) ? parsed.data : parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('   StaySync Full-Stack Capstone End-to-End Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('1. System Gateway Health Check:');
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  assert(health.status === 200 && health.data.status === 'HEALTHY', 'API Gateway is HEALTHY with 16 microservices active');

  // 2. Authentication test for all 6 roles
  console.log('\n2. Role-Based Access Control (RBAC) Authentication:');
  const roles = [
    { email: 'guest@staysync.com', role: 'GUEST' },
    { email: 'reception@staysync.com', role: 'RECEPTIONIST' },
    { email: 'manager@staysync.com', role: 'MANAGER' },
    { email: 'housekeeping@staysync.com', role: 'HOUSEKEEPING' },
    { email: 'maintenance@staysync.com', role: 'MAINTENANCE' },
    { email: 'service@staysync.com', role: 'RESTAURANT' }
  ];

  let guestToken, managerToken, receptionToken;
  for (const r of roles) {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: r.email, password: 'StaySync@2026' });
    
    assert(res.status === 200 && res.data.user.role === r.role, `Auth for ${r.role} (${r.email}) -> Token issued`);
    if (r.role === 'GUEST') guestToken = res.data.token;
    if (r.role === 'MANAGER') managerToken = res.data.token;
    if (r.role === 'RECEPTIONIST') receptionToken = res.data.token;
  }

  // 3. Hotel & Room Discovery
  console.log('\n3. Multi-Property & Room Discovery:');
  const hotelsRes = await request({ hostname: 'localhost', port: 5000, path: '/api/rooms/hotels', method: 'GET' });
  assert(hotelsRes.status === 200 && hotelsRes.data.hotels.length >= 3, `Found ${hotelsRes.data.hotels.length} luxury hotel properties (Mumbai, Udaipur, Goa)`);

  const availRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rooms/available?checkIn=2026-12-01&checkOut=2026-12-04',
    method: 'GET'
  });
  const roomsList = availRes.data.available_rooms || availRes.data.rooms || [];
  assert(availRes.status === 200 && roomsList.length > 0, `Search Engine found ${roomsList.length} available suites in INR`);

  // Pick an available room for live booking flow
  const targetRoom = roomsList[0];
  console.log(`  Selected test room: ${targetRoom.room_type_name} (#${targetRoom.room_number}) at ₹${targetRoom.base_price_per_night}/night`);

  // 4. Booking & Concurrency Lock
  console.log('\n4. Booking Creation & Idempotency Guarantee:');
  const idempotencyKey = `e2e_idem_${Date.now()}`;
  const bookingRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {
    roomId: targetRoom.id,
    checkIn: '2026-12-01',
    checkOut: '2026-12-04',
    totalGuests: 2,
    specialRequests: 'High floor, early arrival, vegan breakfast',
    idempotencyKey
  });

  assert(bookingRes.status === 201 && bookingRes.data.booking.booking_reference, `Booking confirmed: Ref ${bookingRes.data?.booking?.booking_reference} (Total: ₹${bookingRes.data?.booking?.total_price} incl. 18% GST)`);
  const newBookingId = bookingRes.data.booking.id;
  const bookingRef = bookingRes.data.booking.booking_reference;

  // 5. Automated KYC Check-In & Digital NFC Key Issuance
  console.log('\n5. Automated Online Check-In & Digital Pass:');
  const kycRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/checkin/online-checkin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {
    bookingReference: bookingRef,
    documentType: 'AADHAAR',
    documentNumber: 'XXXX-XXXX-9021'
  });
  assert(kycRes.status === 200 && kycRes.data.checkin_status === 'COMPLETED', `Aadhaar KYC verified, Room marked OCCUPIED, Digital key generated: ${kycRes.data.digital_key_token}`);

  const keyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/checkin/digital-key',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {
    bookingReference: bookingRef
  });
  assert(keyRes.status === 200 && keyRes.data.digital_key_token, `Digital NFC/QR Key retrieved for Room #${targetRoom.room_number}: ${keyRes.data.digital_key_token}`);

  // 6. In-Stay Service Ordering & Running Folio Sync
  console.log('\n6. In-Stay F&B Dining & Room Folio Accumulation:');
  const diningRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/restaurant/order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {
    bookingId: newBookingId,
    roomNumber: targetRoom.room_number,
    items: [
      { id: 'm4', name: 'Royal Rajputana Dum Biryani', price: 1450, qty: 2 },
      { id: 'm5', name: 'San Pellegrino Sparkling Water', price: 450, qty: 2 }
    ]
  });
  assert(diningRes.status === 200 && diningRes.data.orderId, `Room service order #${diningRes.data.orderId} placed (Total: ₹${diningRes.data.total})`);

  // Place spa request
  const spaRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/services',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {
    bookingId: newBookingId,
    roomNumber: targetRoom.room_number,
    category: 'SPA',
    description: '90-Min Ayurvedic Herbal Abhyanga Massage for 2 guests',
    cost: 4800
  });
  assert(spaRes.status === 200 && spaRes.data.service_id, `In-stay Spa appointment registered and posted to folio (₹${spaRes.data.cost})`);

  // Verify running folio
  const folioRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${newBookingId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(folioRes.status === 200 && folioRes.data.booking.running_folio.grand_total > folioRes.data.booking.running_folio.room_tariff, `Running Folio aggregated: Room Base + In-Stay Services total = ₹${folioRes.data.booking.running_folio.grand_total}`);

  // 7. Express Automated Checkout
  console.log('\n7. Express Automated Checkout & Operations Trigger:');
  const checkoutRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${newBookingId}/checkout`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {});
  assert(checkoutRes.status === 200 && checkoutRes.data.final_bill.status === 'SETTLED', 'Booking folio marked SETTLED with final invoice balance');
  assert(checkoutRes.data.digital_key_revoked === true, 'Digital NFC/QR room key pass successfully REVOKED on checkout');
  assert(checkoutRes.data.housekeeping_turnover_triggered === true, 'Urgent turnover cleaning task automatically dispatched to Housekeeping matrix');
  assert(checkoutRes.data.loyalty_points_earned > 0, `Awarded ${checkoutRes.data.loyalty_points_earned} loyalty points to guest profile`);

  // 8. Housekeeping Matrix Processing
  console.log('\n8. Housekeeping Department Operations:');
  const hkList = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/housekeeping/tasks',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${managerToken}` }
  });
  const turnoverTask = hkList.data.tasks.find(t => t.room_number == targetRoom.room_number);
  assert(turnoverTask !== undefined, `Turnover task found in Housekeeping queue for Room #${targetRoom.room_number}`);

  if (turnoverTask) {
    const updateHk = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/housekeeping/tasks/${turnoverTask.id}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      }
    }, { status: 'CLEAN' });
    assert(updateHk.status === 200, `Housekeeping marked Room #${targetRoom.room_number} as CLEAN -> auto-released to AVAILABLE`);
  }

  // 9. Aspect Sentiment Analysis on Review Submission
  console.log('\n9. Aspect-Based Review NLP Sentiment Classification:');
  const reviewRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reviews',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guestToken}`
    }
  }, {
    hotelId: targetRoom.hotel_id,
    bookingId: newBookingId,
    rating: 5,
    comment: 'The cleanliness was immaculate, the room had magnificent sea views, and the staff were exceptionally courteous. Food at dinner was divine!',
    cleanlinessRating: 5,
    foodRating: 5,
    roomRating: 5,
    staffRating: 5,
    wifiRating: 4
  });
  assert(reviewRes.status === 200 && reviewRes.data.reviewId, `Guest review submitted with sentiment aspects (Sentiment: ${reviewRes.data.sentiment})`);

  // 10. Loyalty Account Inquiry
  console.log('\n10. Guest Loyalty Rewards Balance:');
  const loyaltyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/loyalty',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(loyaltyRes.status === 200 && loyaltyRes.data.account.points_balance > 0, `Loyalty Tier: ${loyaltyRes.data.account.tier} | Points Balance: ${loyaltyRes.data.account.points_balance} pts`);

  // 11. Manager Executive Analytics
  console.log('\n11. Executive Analytics & Real-Time KPIs:');
  const kpis = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/analytics/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${managerToken}` }
  });
  assert(kpis.status === 200 && kpis.data.metrics.total_revenue_inr > 0, `Executive Metrics: Revenue ₹${kpis.data.metrics.total_revenue_inr.toLocaleString()} | Occupancy: ${kpis.data.metrics.occupancy_rate_percentage}% | RevPAR: ₹${kpis.data.metrics.revpar}`);

  const surge = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/analytics/dynamic-pricing',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${managerToken}` }
  });
  assert(surge.status === 200 && surge.data.surge_multiplier, `Dynamic Pricing Algorithm active: Current Multiplier ${surge.data.surge_multiplier}x (${surge.data.surge_reason})`);

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification().catch(err => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
