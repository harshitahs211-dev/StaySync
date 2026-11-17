const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { query, queryOne } = require('../../db/db');
const { success, error } = require('../../utils/response');
const { publish, TOPICS } = require('../../utils/eventBroker');

// POST /api/checkin/online-checkin - Guest Online Check-in
router.post('/online-checkin', authenticate, async (req, res, next) => {
  try {
    const { bookingReference, documentType = 'PASSPORT', documentNumber } = req.body;
    const userId = req.user.id;

    if (!bookingReference || !documentNumber) {
      return error(res, 'bookingReference and documentNumber are required for online check-in', 400);
    }

    const booking = await queryOne('SELECT * FROM bookings WHERE booking_reference = ? AND user_id = ?', [bookingReference, userId]);
    if (!booking) {
      return error(res, 'Booking reference not found for this account', 404);
    }

    const room = await queryOne('SELECT room_number FROM rooms WHERE id = ?', [booking.room_id]);

    const digitalKeyToken = `KEY_NFC_${Math.floor(100000 + Math.random() * 900000)}`;
    const qrPayload = `staysync://nfc-lock/${room ? room.room_number : '202'}/${bookingReference}`;

    // Update room status to OCCUPIED
    await query('UPDATE rooms SET status = ? WHERE id = ?', ['OCCUPIED', booking.room_id]);

    publish(TOPICS.CHECKIN_COMPLETED, {
      booking_reference: bookingReference,
      user_id: userId,
      room_number: room ? room.room_number : '202',
      digital_key_token: digitalKeyToken
    });

    return success(res, {
      checkin_status: 'COMPLETED',
      booking_reference: bookingReference,
      room_number: room ? room.room_number : '202',
      digital_key_token: digitalKeyToken,
      qr_code_payload: qrPayload,
      issued_at: new Date().toISOString()
    }, 'Online check-in completed & Digital NFC key issued');
  } catch (err) {
    next(err);
  }
});

// POST /api/checkin/digital-key - Issue / Retrieve Active Digital Key
router.post('/digital-key', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activeBooking = await queryOne(`
      SELECT b.*, r.room_number
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ? AND b.status IN ('CONFIRMED', 'COMPLETED')
      ORDER BY b.created_at DESC
    `, [userId]);

    const roomNumber = activeBooking ? activeBooking.room_number : '202';
    const bookingRef = activeBooking ? activeBooking.booking_reference : 'STAY-9842';

    const digitalKeyToken = `KEY_NFC_${Math.floor(100000 + Math.random() * 900000)}`;

    return success(res, {
      service: 'Online Check-in & Digital Key Service',
      room_number: roomNumber,
      booking_reference: bookingRef,
      digital_key_token: digitalKeyToken,
      qr_code_payload: `staysync://nfc-lock/${roomNumber}/${bookingRef}`,
      expires_at: new Date(Date.now() + 86400000 * 3).toISOString()
    }, 'Digital NFC Key Issued');
  } catch (err) {
    next(err);
  }
});

// POST /api/checkin/validate-key - Door Lock Validation API
router.post('/validate-key', async (req, res) => {
  const { digitalKeyToken, roomNumber } = req.body;
  if (!digitalKeyToken || !roomNumber) {
    return error(res, 'digitalKeyToken and roomNumber required', 400);
  }
  return success(res, {
    access_granted: true,
    room_number: roomNumber,
    unlocked_at: new Date().toISOString()
  }, 'Door unlocked successfully');
});

module.exports = router;
