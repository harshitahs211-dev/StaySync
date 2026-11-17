const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../../db/db');
const { success, error } = require('../../utils/response');
const { acquireRoomLock, releaseRoomLock, invalidateRoomCache } = require('../../utils/redisLock');
const { publish, TOPICS } = require('../../utils/eventBroker');

async function createBooking(req, res, next) {
  try {
    const { roomId, checkIn, checkOut, totalGuests = 1, specialRequests = '', paymentMethod = 'CREDIT_CARD' } = req.body;
    const userId = req.user.id;

    if (!roomId || !checkIn || !checkOut) {
      return error(res, 'roomId, checkIn, and checkOut are required fields', 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return error(res, 'Invalid date format. Expected YYYY-MM-DD', 400);
    }

    if (checkOutDate <= checkInDate) {
      return error(res, 'checkOut date must be at least 1 day after checkIn date', 400);
    }

    // Verify room existence and rate
    const room = await queryOne(`
      SELECT r.id, r.room_number, r.status, rt.base_price_per_night, rt.max_occupancy, rt.name as room_type_name
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ? OR r.room_number = ?
    `, [roomId, roomId]);

    if (!room) {
      return error(res, 'Specified room does not exist', 404);
    }

    if (room.status === 'MAINTENANCE') {
      return error(res, 'Room is currently under maintenance and cannot be booked', 400);
    }

    if (totalGuests > room.max_occupancy) {
      return error(res, `Total guests (${totalGuests}) exceeds maximum capacity (${room.max_occupancy}) for ${room.room_type_name}`, 400);
    }

    // Step 1: Redis Concurrency Lock Check
    const lockResult = await acquireRoomLock(room.id, checkIn, checkOut, userId, 300000);
    if (!lockResult.acquired) {
      return error(res, lockResult.message || 'Room is currently locked by another guest.', 409);
    }

    // Step 2: Database Overlap Availability Check
    const overlapping = await queryOne(`
      SELECT id FROM bookings
      WHERE room_id = ?
        AND status IN ('CONFIRMED', 'HELD', 'PENDING')
        AND NOT (check_out <= ? OR check_in >= ?)
    `, [room.id, checkIn, checkOut]);

    if (overlapping) {
      await releaseRoomLock(lockResult.lockKey, userId);
      return error(res, 'Room is already booked for the selected dates.', 409);
    }

    // Calculate total price: (Nights * Base Price) + 18% GST Tax
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    const roomSubtotal = nights * parseFloat(room.base_price_per_night);
    const gstTax = Math.round(roomSubtotal * 0.18);
    const totalPrice = roomSubtotal + gstTax;

    const bookingId = `bk_${uuidv4().substring(0, 8)}`;
    const bookingRef = `STAY-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create booking row
    await query(
      `INSERT INTO bookings (id, booking_reference, user_id, room_id, check_in, check_out, total_guests, total_price, status, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, bookingRef, userId, room.id, checkIn, checkOut, totalGuests, totalPrice, 'CONFIRMED', specialRequests || null]
    );

    // Create payment transaction record with idempotency key
    const paymentId = `pay_${uuidv4().substring(0, 8)}`;
    const idempotencyKey = `idem_${uuidv4()}`;
    await query(
      `INSERT INTO payments (id, booking_reference, user_id, amount, payment_method, status, transaction_id, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, bookingRef, userId, totalPrice, paymentMethod, 'SUCCESS', `TXN_${Math.floor(100000 + Math.random() * 900000)}`, idempotencyKey]
    );

    // Release temporary room lock & invalidate cache
    await releaseRoomLock(lockResult.lockKey, userId);
    invalidateRoomCache();

    // Publish event
    publish(TOPICS.BOOKING_CREATED, {
      booking_id: bookingId,
      booking_reference: bookingRef,
      user_id: userId,
      room_id: room.id,
      total_price: totalPrice
    });

    return success(res, {
      booking: {
        id: bookingId,
        booking_reference: bookingRef,
        room_number: room.room_number,
        room_type: room.room_type_name,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        room_subtotal: roomSubtotal,
        gst_tax: gstTax,
        total_price: totalPrice,
        status: 'CONFIRMED',
        payment: {
          transaction_id: paymentId,
          amount: totalPrice,
          method: paymentMethod,
          status: 'SUCCESS'
        }
      }
    }, 'Booking confirmed and payment processed successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function createWalkInBooking(req, res, next) {
  try {
    const { guestName, guestEmail, guestPhone, roomId, checkIn, checkOut, totalGuests = 1, paymentMethod = 'ADVANCE' } = req.body;

    if (!guestName || !guestEmail || !roomId || !checkIn || !checkOut) {
      return error(res, 'Guest details and dates are required for walk-in', 400);
    }

    // Find or create guest user
    let user = await queryOne('SELECT id FROM users WHERE email = ?', [guestEmail]);
    if (!user) {
      const userId = `usr_${uuidv4().substring(0, 8)}`;
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('StaySync@2026', 10);
      await query(
        'INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, guestName, guestEmail, hash, 'GUEST', guestPhone || '+91-99999-00000']
      );
      user = { id: userId };
    }

    req.body.userId = user.id;
    req.user = { id: user.id, role: 'GUEST' };
    return createBooking(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function getBookings(req, res, next) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let sql = `
      SELECT b.id, b.booking_reference, b.check_in, b.check_out, b.total_guests, b.total_price,
             b.status, b.created_at,
             u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
             r.room_number, r.floor, rt.name as room_type_name, rt.image_url,
             h.name as hotel_name, h.city as hotel_city
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON r.hotel_id = h.id
    `;

    const params = [];

    if (userRole === 'GUEST') {
      sql += ` WHERE b.user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const bookings = await query(sql, params);
    return success(res, { bookings, total: bookings.length }, 'Bookings list retrieved');
  } catch (err) {
    next(err);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await queryOne(`
      SELECT b.id, b.booking_reference, b.check_in, b.check_out, b.total_guests, b.total_price,
             b.status, b.special_requests, b.created_at,
             u.id as user_id, u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
             r.id as room_id, r.room_number, r.floor, rt.name as room_type_name, rt.image_url,
             h.name as hotel_name, h.address as hotel_address, h.city as hotel_city
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE b.id = ? OR b.booking_reference = ?
    `, [id, id]);

    if (!booking) {
      return error(res, 'Booking not found', 404);
    }

    if (req.user.role === 'GUEST' && booking.user_id !== req.user.id) {
      return error(res, 'Access denied to this booking', 403);
    }

    const payment = await queryOne('SELECT * FROM payments WHERE booking_reference = ?', [booking.booking_reference]);
    const checkin = await queryOne('SELECT * FROM checkins WHERE booking_id = ?', [booking.id]);
    const digitalKey = await queryOne('SELECT * FROM digital_keys WHERE booking_id = ? AND is_active = 1', [booking.id]);
    const services = await query('SELECT * FROM service_requests WHERE booking_id = ? OR room_number = ? ORDER BY created_at DESC', [booking.id, booking.room_number]);

    const serviceTotal = services.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);

    booking.payment = payment;
    booking.checkin = checkin;
    booking.digital_key = digitalKey;
    booking.services = services;
    booking.running_folio = {
      room_tariff: parseFloat(booking.total_price),
      in_stay_services_total: serviceTotal,
      grand_total: parseFloat(booking.total_price) + serviceTotal
    };

    return success(res, { booking }, 'Booking details fetched');
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings/:id/checkout - Automated Checkout & Final Settlement
async function checkoutBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await queryOne(`
      SELECT b.*, r.room_number, r.id as room_id, u.name as guest_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ? OR b.booking_reference = ?
    `, [id, id]);

    if (!booking) return error(res, 'Booking not found', 404);

    // 1. Calculate in-stay service charges
    const services = await query(
      'SELECT * FROM service_requests WHERE booking_id = ? OR room_number = ?',
      [booking.id, booking.room_number]
    );

    const serviceTotal = services.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
    const roomTariff = parseFloat(booking.total_price);
    const grandTotal = roomTariff + serviceTotal;

    // 2. Mark booking completed
    await query('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['COMPLETED', booking.id]);

    // 3. Revoke digital room keys immediately
    await query(
      'UPDATE digital_keys SET is_active = 0, revoked_at = CURRENT_TIMESTAMP WHERE booking_id = ?',
      [booking.id]
    );

    // 4. Update physical room status to DIRTY
    await query('UPDATE rooms SET status = ? WHERE id = ?', ['DIRTY', booking.room_id]);

    // 5. Generate urgent Housekeeping Turnover Task
    const hkTaskId = `hk_${uuidv4().substring(0, 8)}`;
    await query(
      `INSERT INTO housekeeping_tasks (id, room_id, room_number, task_type, priority, status, assigned_to, notes)
       VALUES (?, ?, ?, 'CHECKOUT_CLEAN', 'HIGH', 'PENDING', 'Sarah Jenkins', ?)`,
      [hkTaskId, booking.room_id, booking.room_number, `Automated checkout for Guest ${booking.guest_name}. Full sanitation and turnover required.`]
    );

    // 6. Award Loyalty Points (10% of total spent)
    const pointsAwarded = Math.round(grandTotal * 0.10);
    const loyaltyAcc = await queryOne('SELECT * FROM loyalty_accounts WHERE user_id = ?', [booking.user_id]);
    if (loyaltyAcc) {
      await query('UPDATE loyalty_accounts SET points_balance = points_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [pointsAwarded, booking.user_id]);
      await query(
        `INSERT INTO loyalty_transactions (id, user_id, booking_id, points, type, description)
         VALUES (?, ?, ?, ?, 'EARNED', ?)`,
        [`lt_${uuidv4().substring(0, 8)}`, booking.user_id, booking.id, pointsAwarded, `Earned ${pointsAwarded} points on checkout for ${booking.booking_reference}`]
      );
    }

    invalidateRoomCache();

    return success(res, {
      booking_reference: booking.booking_reference,
      status: 'COMPLETED',
      room_number: booking.room_number,
      final_bill: {
        room_tariff: roomTariff,
        services_charges: serviceTotal,
        grand_total: grandTotal,
        status: 'SETTLED'
      },
      digital_key_revoked: true,
      housekeeping_turnover_triggered: true,
      loyalty_points_earned: pointsAwarded
    }, 'Checkout completed, final bill settled, digital key revoked, and housekeeping task dispatched');
  } catch (err) {
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await queryOne('SELECT * FROM bookings WHERE id = ? OR booking_reference = ?', [id, id]);

    if (!booking) return error(res, 'Booking not found', 404);

    if (req.user.role === 'GUEST' && booking.user_id !== req.user.id) {
      return error(res, 'Access denied', 403);
    }

    if (booking.status === 'CANCELLED') {
      return error(res, 'Booking is already cancelled', 400);
    }

    await query('UPDATE bookings SET status = ? WHERE id = ?', ['CANCELLED', booking.id]);
    await query('UPDATE payments SET status = ? WHERE booking_reference = ?', ['REFUNDED', booking.booking_reference]);
    await query('UPDATE digital_keys SET is_active = 0, revoked_at = CURRENT_TIMESTAMP WHERE booking_id = ?', [booking.id]);

    invalidateRoomCache();

    return success(res, { booking_id: booking.id, status: 'CANCELLED' }, 'Booking cancelled successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  createWalkInBooking,
  getBookings,
  getBookingById,
  checkoutBooking,
  cancelBooking
};
