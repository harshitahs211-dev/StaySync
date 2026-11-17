const express = require('express');
const router = express.Router();
const bookingController = require('./bookingController');
const { authenticate } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/rbacMiddleware');

router.post('/', authenticate, bookingController.createBooking);
router.post('/walkin', authenticate, requireRole(['RECEPTIONIST', 'MANAGER']), bookingController.createWalkInBooking);
router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.post('/:id/checkout', authenticate, bookingController.checkoutBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
