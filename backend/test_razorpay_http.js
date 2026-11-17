const express = require('express');
const http = require('http');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('./src/config/env');
const { query, queryOne } = require('./src/db/db');
const paymentRoutes = require('./src/services/payment/paymentRoutes');
const errorHandler = require('./src/middleware/errorHandler');

async function testHttpEndpoints() {
  console.log('--- Testing Payment Express Routes via Local HTTP Server ---');

  const app = express();
  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use('/api/payments', paymentRoutes);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/payments`;

  const guest = await queryOne('SELECT * FROM users WHERE role = "GUEST" LIMIT 1');
  const token = jwt.sign({ id: guest.id, email: guest.email, role: guest.role, name: guest.name }, config.JWT_SECRET, { expiresIn: '1h' });

  let passed = 0;

  try {
    // 1. Test POST /api/payments/create-order with invalid dates
    const resInvalidDates = await fetch(`${baseUrl}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        roomId: 'room_101',
        checkIn: '2026-12-10',
        checkOut: '2026-12-08'
      })
    });
    const dataInvalid = await resInvalidDates.json();
    if (resInvalidDates.status === 400 && dataInvalid.success === false) {
      console.log('  ✓ PASS: POST /api/payments/create-order rejects checkOut <= checkIn with 400');
      passed++;
    } else {
      console.error('  ✗ FAIL: Did not reject invalid dates with 400:', dataInvalid);
    }

    // 2. Test POST /api/payments/create-order with valid dates
    const room = await queryOne('SELECT * FROM rooms WHERE status != "MAINTENANCE" LIMIT 1');
    const resCreate = await fetch(`${baseUrl}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        roomId: room.id,
        checkIn: '2026-12-15',
        checkOut: '2026-12-18',
        totalGuests: 2,
        specialRequests: 'High floor ocean view'
      })
    });
    const dataCreate = await resCreate.json();
    if (resCreate.status === 201 && dataCreate.success === true && dataCreate.data.orderId) {
      console.log(`  ✓ PASS: POST /api/payments/create-order returns 201 with orderId: ${dataCreate.data.orderId}`);
      console.log(`          Room subtotal: ₹${dataCreate.data.roomSubtotal}, GST: ₹${dataCreate.data.gstTax}, Total: ₹${dataCreate.data.amountInINR}`);
      passed++;
    } else {
      console.error('  ✗ FAIL: Order creation failed:', dataCreate);
    }

    const bookingRef = dataCreate.data?.bookingReference;
    const orderId = dataCreate.data?.orderId;

    // Check that room booking was created in HELD status
    const heldBooking = await queryOne('SELECT * FROM bookings WHERE booking_reference = ?', [bookingRef]);
    if (heldBooking && heldBooking.status === 'HELD') {
      console.log(`  ✓ PASS: Booking ${bookingRef} is in HELD status before payment`);
      passed++;
    } else {
      console.error('  ✗ FAIL: Booking not in HELD status');
    }

    // 3. Test POST /api/payments/verify with invalid signature
    const resVerifyInvalid = await fetch(`${baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingReference: bookingRef,
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_bad_test_123',
        razorpay_signature: 'invalid_forged_signature_hex'
      })
    });
    const dataVerifyInvalid = await resVerifyInvalid.json();
    if (resVerifyInvalid.status === 400 && dataVerifyInvalid.success === false) {
      console.log('  ✓ PASS: POST /api/payments/verify rejects bad signature with 400');
      passed++;
    } else {
      console.error('  ✗ FAIL: Bad signature was not rejected:', dataVerifyInvalid);
    }

    // Check that booking was cancelled on bad signature
    const failedBooking = await queryOne('SELECT status FROM bookings WHERE booking_reference = ?', [bookingRef]);
    if (failedBooking && failedBooking.status === 'CANCELLED') {
      console.log('  ✓ PASS: Booking automatically transitioned to CANCELLED upon verification failure');
      passed++;
    } else {
      console.error('  ✗ FAIL: Booking not cancelled after signature failure');
    }

    // 4. Test POST /api/payments/create-order again and verify with valid test signature
    const resCreate2 = await fetch(`${baseUrl}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        roomId: room.id,
        checkIn: '2026-12-20',
        checkOut: '2026-12-23',
        totalGuests: 2
      })
    });
    const dataCreate2 = await resCreate2.json();
    const bookingRef2 = dataCreate2.data.bookingReference;
    const orderId2 = dataCreate2.data.orderId;

    const resVerifyValid = await fetch(`${baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingReference: bookingRef2,
        razorpay_order_id: orderId2,
        razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 8)}`,
        razorpay_signature: 'simulated_test_signature'
      })
    });
    const dataVerifyValid = await resVerifyValid.json();
    if (resVerifyValid.status === 200 && dataVerifyValid.success === true && dataVerifyValid.data.verified === true) {
      console.log(`  ✓ PASS: POST /api/payments/verify succeeds with 200 & verified: true`);
      console.log(`          Confirmed Booking ID: ${dataVerifyValid.data.booking.id}, Status: ${dataVerifyValid.data.booking.status}`);
      passed++;
    } else {
      console.error('  ✗ FAIL: Valid verification failed:', dataVerifyValid);
    }

    // 5. Test GET /api/payments/history
    const resHistory = await fetch(`${baseUrl}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dataHistory = await resHistory.json();
    if (resHistory.status === 200 && Array.isArray(dataHistory.data.payments)) {
      console.log(`  ✓ PASS: GET /api/payments/history returns ${dataHistory.data.payments.length} transactions`);
      passed++;
    } else {
      console.error('  ✗ FAIL: Failed to get payment history');
    }

    // Clean up test bookings
    await query('DELETE FROM payments WHERE booking_reference IN (?, ?)', [bookingRef, bookingRef2]);
    await query('DELETE FROM bookings WHERE booking_reference IN (?, ?)', [bookingRef, bookingRef2]);

    console.log(`\nHTTP Route Tests: ${passed} passed successfully!`);
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('HTTP test error:', err);
    server.close();
    process.exit(1);
  }
}

testHttpEndpoints();
