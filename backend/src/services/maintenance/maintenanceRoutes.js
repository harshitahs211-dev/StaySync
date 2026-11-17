const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/rbacMiddleware');
const { query, queryOne } = require('../../db/db');
const { success, error } = require('../../utils/response');

// GET /api/maintenance/tickets
router.get('/tickets', authenticate, requireRole(['MAINTENANCE', 'MANAGER', 'RECEPTIONIST']), async (req, res, next) => {
  try {
    const tickets = await query(`
      SELECT mt.*, r.floor, r.status as room_status, rt.name as room_type_name
      FROM maintenance_tickets mt
      LEFT JOIN rooms r ON mt.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY 
        CASE mt.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
        mt.created_at DESC
    `);
    return success(res, { tickets }, 'Maintenance tickets retrieved');
  } catch (err) {
    next(err);
  }
});

// POST /api/maintenance/tickets
router.post('/tickets', authenticate, requireRole(['MAINTENANCE', 'MANAGER', 'RECEPTIONIST', 'GUEST']), async (req, res, next) => {
  try {
    const { roomNumber, issueType, priority = 'MEDIUM', technician = 'David Miller' } = req.body;
    if (!roomNumber || !issueType) return error(res, 'roomNumber and issueType are required', 400);

    const room = await queryOne('SELECT id FROM rooms WHERE room_number = ?', [roomNumber]);
    const ticketId = `mnt_${uuidv4().substring(0, 8)}`;

    await query(
      `INSERT INTO maintenance_tickets (id, room_id, room_number, issue_type, priority, status, technician)
       VALUES (?, ?, ?, ?, ?, 'OPEN', ?)`,
      [ticketId, room ? room.id : null, roomNumber, issueType, priority, technician]
    );

    return success(res, { ticketId, roomNumber, issueType, status: 'OPEN' }, 'Maintenance ticket created');
  } catch (err) {
    next(err);
  }
});

// PUT /api/maintenance/tickets/:id - Update status / resolution notes
router.put('/tickets/:id', authenticate, requireRole(['MAINTENANCE', 'MANAGER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, technician, priority } = req.body;

    const ticket = await queryOne('SELECT * FROM maintenance_tickets WHERE id = ?', [id]);
    if (!ticket) return error(res, 'Ticket not found', 404);

    await query(
      `UPDATE maintenance_tickets 
       SET status = COALESCE(?, status),
           resolution_notes = COALESCE(?, resolution_notes),
           technician = COALESCE(?, technician),
           priority = COALESCE(?, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, resolutionNotes || null, technician || null, priority || null, id]
    );

    // If resolved and room was in MAINTENANCE, restore room to AVAILABLE
    if (status === 'RESOLVED' && ticket.room_id) {
      const room = await queryOne('SELECT status FROM rooms WHERE id = ?', [ticket.room_id]);
      if (room && room.status === 'MAINTENANCE') {
        await query('UPDATE rooms SET status = ? WHERE id = ?', ['AVAILABLE', ticket.room_id]);
      }
    }

    return success(res, { ticketId: id, status }, 'Maintenance ticket updated successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
