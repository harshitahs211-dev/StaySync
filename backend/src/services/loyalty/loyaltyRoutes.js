const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../../db/db');
const { authenticate } = require('../../middleware/authMiddleware');
const { success, error } = require('../../utils/response');

// GET /api/loyalty - Get current user's loyalty account & history
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let account = await queryOne('SELECT * FROM loyalty_accounts WHERE user_id = ?', [userId]);
    if (!account) {
      account = { user_id: userId, points_balance: 500, tier: 'SILVER' };
      await query('INSERT INTO loyalty_accounts (user_id, points_balance, tier) VALUES (?, 500, ?)', [userId, 'SILVER']);
    }

    const history = await query('SELECT * FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    return success(res, { account, history }, 'Loyalty account retrieved');
  } catch (err) {
    next(err);
  }
});

// POST /api/loyalty/redeem - Redeem points for stay discount
router.post('/redeem', authenticate, async (req, res, next) => {
  try {
    const { pointsToRedeem, bookingId } = req.body;
    const userId = req.user.id;

    const account = await queryOne('SELECT * FROM loyalty_accounts WHERE user_id = ?', [userId]);
    if (!account || account.points_balance < pointsToRedeem) {
      return error(res, 'Insufficient loyalty reward points', 400);
    }

    // 100 points = ₹100 discount
    const discountAmount = pointsToRedeem;
    const newBalance = account.points_balance - pointsToRedeem;

    await query('UPDATE loyalty_accounts SET points_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [newBalance, userId]);
    await query(
      `INSERT INTO loyalty_transactions (id, user_id, booking_id, points, type, description)
       VALUES (?, ?, ?, ?, 'REDEEMED', ?)`,
      [`lt_${uuidv4().substring(0, 8)}`, userId, bookingId || null, pointsToRedeem, `Redeemed ${pointsToRedeem} points for ₹${discountAmount} discount`]
    );

    return success(res, { pointsRedeemed: pointsToRedeem, discountAmount, remainingBalance: newBalance }, 'Points redeemed');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
