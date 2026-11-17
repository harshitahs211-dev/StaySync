const { query, queryOne } = require('../../db/db');
const { success, error } = require('../../utils/response');
const { getCachedRooms, setCachedRooms, getRoomLockStatus } = require('../../utils/redisLock');

async function getHotels(req, res, next) {
  try {
    const hotels = await query('SELECT * FROM hotels ORDER BY rating DESC');
    return success(res, { hotels }, 'Hotels retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function getAllRooms(req, res, next) {
  try {
    const { hotelId, city } = req.query;
    let sql = `
      SELECT r.id, r.room_number, r.floor, r.status, r.dnd_enabled, r.created_at,
             rt.id as room_type_id, rt.name as room_type_name, rt.base_price_per_night,
             rt.max_occupancy, rt.bed_type, rt.room_size_sqm, rt.image_url, rt.description,
             h.id as hotel_id, h.name as hotel_name, h.city as hotel_city, h.rating as hotel_rating
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON r.hotel_id = h.id
    `;
    const params = [];
    if (hotelId) {
      sql += ' WHERE h.id = ?';
      params.push(hotelId);
    } else if (city) {
      sql += ' WHERE LOWER(h.city) LIKE LOWER(?)';
      params.push(`%${city}%`);
    }
    sql += ' ORDER BY r.room_number ASC';

    const rooms = await query(sql, params);
    return success(res, { rooms }, 'Rooms fetched successfully');
  } catch (err) {
    next(err);
  }
}

async function getAvailableRooms(req, res, next) {
  try {
    const { checkIn, checkOut, guests, roomTypeId, minPrice, maxPrice, hotelId, city } = req.query;

    if (!checkIn || !checkOut) {
      return error(res, 'checkIn and checkOut date parameters are required (YYYY-MM-DD)', 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return error(res, 'Invalid date format. Use YYYY-MM-DD', 400);
    }

    if (checkOutDate <= checkInDate) {
      return error(res, 'checkOut date must be after checkIn date', 400);
    }

    const guestCount = parseInt(guests) || 1;
    const { amenities } = req.query;
    const cacheKey = `rooms_available:${checkIn}:${checkOut}:${guestCount}:${city || 'all'}:${roomTypeId || 'all'}:${hotelId || 'all'}:${minPrice || 'all'}:${maxPrice || 'all'}:${amenities || 'all'}`;

    const cached = getCachedRooms(cacheKey);
    if (cached) {
      return success(res, cached, 'Available rooms retrieved (Redis Cache HIT)');
    }

    let sql = `
      SELECT r.id, r.room_number, r.floor, r.status, r.dnd_enabled,
             rt.id as room_type_id, rt.name as room_type_name, rt.description,
             rt.base_price_per_night, rt.max_occupancy, rt.bed_type, rt.room_size_sqm, rt.image_url,
             h.id as hotel_id, h.name as hotel_name, h.city as hotel_city, h.rating as hotel_rating
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.status != 'MAINTENANCE'
        AND rt.max_occupancy >= ?
        AND r.id NOT IN (
          SELECT b.room_id
          FROM bookings b
          WHERE b.status IN ('CONFIRMED', 'HELD', 'PENDING')
            AND NOT (b.check_out <= ? OR b.check_in >= ?)
        )
    `;

    const params = [guestCount, checkIn, checkOut];

    if (hotelId) {
      sql += ` AND h.id = ?`;
      params.push(hotelId);
    }

    if (city) {
      sql += ` AND LOWER(h.city) LIKE LOWER(?)`;
      params.push(`%${city}%`);
    }

    if (roomTypeId) {
      sql += ` AND rt.id = ?`;
      params.push(roomTypeId);
    }

    if (minPrice) {
      sql += ` AND rt.base_price_per_night >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ` AND rt.base_price_per_night <= ?`;
      params.push(parseFloat(maxPrice));
    }

    sql += ` ORDER BY rt.base_price_per_night ASC`;

    const rooms = await query(sql, params);

    for (const r of rooms) {
      const amenities = await query(`
        SELECT a.id, a.name, a.category, a.icon
        FROM amenities a
        JOIN room_amenities ra ON a.id = ra.amenity_id
        WHERE ra.room_type_id = ?
      `, [r.room_type_id]);
      r.amenities = amenities;

      const lockStatus = getRoomLockStatus(r.id, checkIn, checkOut);
      r.is_locked = lockStatus.isLocked;
    }

    let finalRooms = rooms;
    if (amenities) {
      const required = amenities.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (required.length > 0) {
        finalRooms = rooms.filter(r => {
          const roomAmenityNames = (r.amenities || []).map(a => a.name.toLowerCase());
          return required.every(reqName => roomAmenityNames.some(name => name.includes(reqName) || reqName.includes(name)));
        });
      }
    }

    const responsePayload = {
      available_rooms: finalRooms,
      search_criteria: { checkIn, checkOut, guests: guestCount, total_found: finalRooms.length }
    };

    setCachedRooms(cacheKey, responsePayload, 60);

    return success(res, responsePayload, 'Available rooms retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function getRoomById(req, res, next) {
  try {
    const { id } = req.params;
    const room = await queryOne(`
      SELECT r.id, r.room_number, r.floor, r.status, r.dnd_enabled,
             rt.id as room_type_id, rt.name as room_type_name, rt.description,
             rt.base_price_per_night, rt.max_occupancy, rt.bed_type, rt.room_size_sqm, rt.image_url,
             h.id as hotel_id, h.name as hotel_name, h.address as hotel_address, h.city as hotel_city, h.rating as hotel_rating
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.id = ? OR r.room_number = ?
    `, [id, id]);

    if (!room) {
      return error(res, 'Room not found', 404);
    }

    const amenities = await query(`
      SELECT a.id, a.name, a.category, a.icon, a.description
      FROM amenities a
      JOIN room_amenities ra ON a.id = ra.amenity_id
      WHERE ra.room_type_id = ?
    `, [room.room_type_id]);

    room.amenities = amenities;

    return success(res, { room }, 'Room details retrieved');
  } catch (err) {
    next(err);
  }
}

async function getRoomTypes(req, res, next) {
  try {
    const roomTypes = await query(`
      SELECT rt.*, h.name as hotel_name, h.city as hotel_city
      FROM room_types rt
      JOIN hotels h ON rt.hotel_id = h.id
      ORDER BY rt.base_price_per_night ASC
    `);
    for (const rt of roomTypes) {
      const amenities = await query(`
        SELECT a.id, a.name, a.category, a.icon
        FROM amenities a
        JOIN room_amenities ra ON a.id = ra.amenity_id
        WHERE ra.room_type_id = ?
      `, [rt.id]);
      rt.amenities = amenities;
    }
    return success(res, { room_types: roomTypes }, 'Room types retrieved');
  } catch (err) {
    next(err);
  }
}

async function getAmenities(req, res, next) {
  try {
    const amenities = await query(`SELECT * FROM amenities ORDER BY name ASC`);
    return success(res, { amenities }, 'Amenities list fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHotels,
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  getRoomTypes,
  getAmenities
};
