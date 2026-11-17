const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/rbacMiddleware');
const { query, queryOne } = require('../../db/db');
const { success, error } = require('../../utils/response');

// GET /api/housekeeping/tasks
router.get('/tasks', authenticate, requireRole(['HOUSEKEEPING', 'MANAGER', 'RECEPTIONIST']), async (req, res, next) => {
  try {
    const tasks = await query(`
      SELECT ht.*, r.floor, r.status as room_status, r.dnd_enabled, rt.name as room_type_name
      FROM housekeeping_tasks ht
      JOIN rooms r ON ht.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY 
        CASE ht.priority WHEN 'HIGH' THEN 1 WHEN 'NORMAL' THEN 2 ELSE 3 END,
        ht.created_at DESC
    `);

    const roomMatrix = await query(`
      SELECT r.id, r.room_number, r.floor, r.status, r.dnd_enabled, rt.name as room_type_name
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY r.floor ASC, r.room_number ASC
    `);

    return success(res, { tasks, roomMatrix }, 'Housekeeping tasks & room matrix fetched');
  } catch (err) {
    next(err);
  }
});

// POST /api/housekeeping/tasks - Create task
router.post('/tasks', authenticate, requireRole(['HOUSEKEEPING', 'MANAGER', 'RECEPTIONIST']), async (req, res, next) => {
  try {
    const { roomNumber, taskType = 'CHECKOUT_CLEAN', priority = 'HIGH', notes = '' } = req.body;
    const room = await queryOne('SELECT id, room_number FROM rooms WHERE room_number = ?', [roomNumber]);
    if (!room) return error(res, 'Room not found', 404);

    const taskId = `hk_${uuidv4().substring(0, 8)}`;
    await query(
      `INSERT INTO housekeeping_tasks (id, room_id, room_number, task_type, priority, status, assigned_to, notes)
       VALUES (?, ?, ?, ?, ?, 'PENDING', 'Sarah Jenkins', ?)`,
      [taskId, room.id, room.room_number, taskType, priority, notes]
    );

    return success(res, { taskId, roomNumber }, 'Housekeeping task scheduled');
  } catch (err) {
    next(err);
  }
});

// PUT /api/housekeeping/tasks/:id/status - Update task status
router.put('/tasks/:id/status', authenticate, requireRole(['HOUSEKEEPING', 'MANAGER', 'RECEPTIONIST']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'INSPECTED', 'CLEAN'].includes(status)) {
      return error(res, 'Invalid status', 400);
    }

    const task = await queryOne('SELECT * FROM housekeeping_tasks WHERE id = ?', [id]);
    if (!task) return error(res, 'Task not found', 404);

    await query(
      'UPDATE housekeeping_tasks SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, notes || null, id]
    );

    // If marked CLEAN or INSPECTED, and room was DIRTY, turn room to AVAILABLE
    if (status === 'CLEAN' || status === 'INSPECTED') {
      const room = await queryOne('SELECT status FROM rooms WHERE id = ?', [task.room_id]);
      if (room && room.status === 'DIRTY') {
        await query('UPDATE rooms SET status = ? WHERE id = ?', ['AVAILABLE', task.room_id]);
      }
    }

    return success(res, { taskId: id, status }, `Task status updated to ${status}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
