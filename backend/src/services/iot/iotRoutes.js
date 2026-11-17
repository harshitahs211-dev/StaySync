const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../../db/db');
const { authenticate } = require('../../middleware/authMiddleware');
const { success, error } = require('../../utils/response');

// In-memory room controls state store
const roomControlsState = new Map();

function getInitialState(roomNumber) {
  return {
    roomNumber,
    temperature: 21,
    acPower: true,
    lightsMode: 'RELAX', // RELAX, READING, AMBIENT, NIGHT
    masterLights: true,
    smartTvPower: false,
    curtainsOpen: true,
    dnd: false,
    lastUpdated: new Date().toISOString()
  };
}

// GET /api/iot/controls/:roomNumber
router.get('/controls/:roomNumber', authenticate, async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    let state = roomControlsState.get(roomNumber);
    if (!state) {
      state = getInitialState(roomNumber);
      roomControlsState.set(roomNumber, state);
    }

    // Sync with database DND status
    const room = await queryOne('SELECT dnd_enabled FROM rooms WHERE room_number = ?', [roomNumber]);
    if (room) state.dnd = Boolean(room.dnd_enabled);

    return success(res, { controls: state }, 'Smart room IoT state fetched');
  } catch (err) {
    next(err);
  }
});

// POST /api/iot/controls/:roomNumber
router.post('/controls/:roomNumber', authenticate, async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    const updates = req.body;

    let state = roomControlsState.get(roomNumber) || getInitialState(roomNumber);
    state = { ...state, ...updates, lastUpdated: new Date().toISOString() };
    roomControlsState.set(roomNumber, state);

    // If DND was changed, update rooms table for Housekeeping visibility!
    if (updates.dnd !== undefined) {
      await query('UPDATE rooms SET dnd_enabled = ? WHERE room_number = ?', [updates.dnd ? 1 : 0, roomNumber]);
    }

    return success(res, { controls: state }, 'Smart room control applied');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
