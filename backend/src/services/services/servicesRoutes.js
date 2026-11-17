const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../../db/db');
const { authenticate } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/rbacMiddleware');
const { success, error } = require('../../utils/response');
const { publish, TOPICS } = require('../../utils/eventBroker');

// GET /api/services - Fetch in-stay services for current guest or staff
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let requests;
    if (user.role === 'GUEST') {
      requests = await query(
        'SELECT * FROM service_requests WHERE user_id = ? ORDER BY created_at DESC',
        [user.id]
      );
    } else {
      requests = await query(
        'SELECT sr.*, u.name as guest_name FROM service_requests sr JOIN users u ON sr.user_id = u.id ORDER BY sr.created_at DESC'
      );
    }
    return success(res, { requests }, 'In-stay service requests fetched');
  } catch (err) {
    next(err);
  }
});

// POST /api/services - Create new in-stay request (Room Service, Laundry, Spa, Housekeeping, Complaints)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { bookingId, roomNumber, category, description, cost = 0 } = req.body;
    const userId = req.user.id;

    if (!roomNumber || !category || !description) {
      return error(res, 'roomNumber, category, and description are required', 400);
    }

    const serviceId = `srv_${uuidv4().substring(0, 8)}`;
    let assignedTo = 'Guest Experience Team';
    if (category === 'ROOM_SERVICE' || category === 'RESTAURANT') assignedTo = 'Chef Carlos Rossi';
    else if (category === 'HOUSEKEEPING') assignedTo = 'Sarah Jenkins';
    else if (category === 'MAINTENANCE') assignedTo = 'David Miller';
    else if (category === 'SPA') assignedTo = 'Priya Mehta (Spa)';
    else if (category === 'LAUNDRY') assignedTo = 'Staff Laundry Unit';

    await query(
      `INSERT INTO service_requests (id, booking_id, room_number, user_id, category, description, status, cost, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED', ?, ?)`,
      [serviceId, bookingId || null, roomNumber, userId, category, description, parseFloat(cost) || 0, assignedTo]
    );

    // Also create ticket or task if maintenance or housekeeping
    if (category === 'MAINTENANCE') {
      const ticketId = `mnt_${uuidv4().substring(0, 8)}`;
      await query(
        `INSERT INTO maintenance_tickets (id, room_id, room_number, issue_type, priority, status, technician)
         VALUES (?, (SELECT id FROM rooms WHERE room_number = ? LIMIT 1), ?, ?, 'MEDIUM', 'OPEN', 'David Miller')`,
        [ticketId, roomNumber, roomNumber, description]
      );
    } else if (category === 'HOUSEKEEPING') {
      const taskId = `hk_${uuidv4().substring(0, 8)}`;
      await query(
        `INSERT INTO housekeeping_tasks (id, room_id, room_number, task_type, priority, status, assigned_to, notes)
         VALUES (?, (SELECT id FROM rooms WHERE room_number = ? LIMIT 1), ?, 'DAILY_TURNDOWN', 'NORMAL', 'PENDING', 'Sarah Jenkins', ?)`,
        [taskId, roomNumber, roomNumber, description]
      );
    }

    return success(res, {
      service_id: serviceId,
      room_number: roomNumber,
      category,
      status: 'REQUESTED',
      cost: parseFloat(cost) || 0,
      assigned_to: assignedTo,
      created_at: new Date().toISOString()
    }, 'In-stay service request created successfully and dispatched to staff');
  } catch (err) {
    next(err);
  }
});

// PUT /api/services/:id/status - Update service status (Staff / Manager)
router.put('/:id/status', authenticate, requireRole(['MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'MAINTENANCE', 'RESTAURANT']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    if (!['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return error(res, 'Invalid status', 400);
    }

    await query(
      'UPDATE service_requests SET status = ?, assigned_to = COALESCE(?, assigned_to), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, assignedTo || null, id]
    );

    return success(res, { serviceId: id, status }, `Service request marked as ${status}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
