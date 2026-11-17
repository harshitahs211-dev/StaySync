const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../../db/db');
const { authenticate } = require('../../middleware/authMiddleware');
const { success, error } = require('../../utils/response');

// GET /api/reviews - Get reviews for a hotel
router.get('/', async (req, res, next) => {
  try {
    const { hotelId } = req.query;
    let reviews;
    if (hotelId) {
      reviews = await query('SELECT * FROM reviews WHERE hotel_id = ? ORDER BY created_at DESC', [hotelId]);
    } else {
      reviews = await query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 30');
    }
    return success(res, { reviews }, 'Reviews retrieved');
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews - Submit review with aspect ratings & sentiment
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { hotelId, bookingId, rating, comment, cleanlinessRating, foodRating, roomRating, staffRating, wifiRating } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    if (!hotelId || !rating || !comment) {
      return error(res, 'hotelId, rating, and comment are required', 400);
    }

    // Lightweight sentiment classification
    const textLower = comment.toLowerCase();
    let sentiment = 'POSITIVE';
    if (rating <= 2 || textLower.includes('poor') || textLower.includes('dirty') || textLower.includes('terrible') || textLower.includes('bad')) {
      sentiment = 'NEGATIVE';
    } else if (rating === 3 || textLower.includes('average') || textLower.includes('okay')) {
      sentiment = 'NEUTRAL';
    }

    const reviewId = `rev_${uuidv4().substring(0, 8)}`;

    await query(
      `INSERT INTO reviews (id, hotel_id, user_id, booking_id, user_name, rating, overall_sentiment, comment, cleanliness_rating, food_rating, room_rating, staff_rating, wifi_rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reviewId, hotelId, userId, bookingId || null, userName, rating, sentiment, comment, cleanlinessRating || rating, foodRating || rating, roomRating || rating, staffRating || rating, wifiRating || rating]
    );

    return success(res, { reviewId, sentiment }, 'Review submitted successfully with aspect sentiment tags');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
