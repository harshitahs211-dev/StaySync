const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/rbacMiddleware');
const { query, queryOne } = require('../../db/db');
const { success, error } = require('../../utils/response');

// Luxury Dining & Spa Menu Catalog
const MENU = [
  // In-Room Dining
  { id: 'm1', name: 'Artisan Burrata & Heirloom Tomato Tartine', category: 'DINING', price: 1150, prep_time: '20 min', image: 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?auto=format&fit=crop&w=400&q=80' },
  { id: 'm2', name: 'Black Truffle Tagliatelle with Aged Parmesan', category: 'DINING', price: 1850, prep_time: '25 min', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=400&q=80' },
  { id: 'm3', name: 'Malabar Coast Spiced Lobster Thermidor', category: 'DINING', price: 2950, prep_time: '35 min', image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=400&q=80' },
  { id: 'm4', name: 'Royal Rajputana Dum Biryani (Avadhi Style)', category: 'DINING', price: 1450, prep_time: '30 min', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80' },
  { id: 'm5', name: 'San Pellegrino Sparkling Mineral Water (750ml)', category: 'BEVERAGE', price: 450, prep_time: '5 min', image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=400&q=80' },
  { id: 'm6', name: 'Champagne Laurent-Perrier Brut Millésimé', category: 'BEVERAGE', price: 8500, prep_time: '10 min', image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=400&q=80' },
  
  // Spa Packages
  { id: 's1', name: '90-Min Ayurvedic Herbal Abhyanga Massage', category: 'SPA', price: 4800, prep_time: '90 min', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' },
  { id: 's2', name: '60-Min Himalayan Salt & Botanical Body Scrub', category: 'SPA', price: 3600, prep_time: '60 min', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=400&q=80' },

  // Laundry
  { id: 'l1', name: 'Express Dry Cleaning & Steaming (Suit / Gown)', category: 'LAUNDRY', price: 850, prep_time: 'Same Day', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=400&q=80' },
  { id: 'l2', name: 'Delicate Wash & Crisp Press (Casual Wear)', category: 'LAUNDRY', price: 450, prep_time: 'Same Day', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80' }
];

// GET /api/restaurant/menu
router.get('/menu', (req, res) => {
  return success(res, { menu: MENU }, 'Catalog fetched');
});

// GET /api/restaurant/orders - Fetch orders (Restaurant & Manager)
router.get('/orders', authenticate, requireRole(['RESTAURANT', 'MANAGER', 'RECEPTIONIST']), async (req, res, next) => {
  try {
    const orders = await query('SELECT * FROM restaurant_orders ORDER BY created_at DESC');
    return success(res, { orders }, 'Orders fetched');
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurant/order - Place new order (Posts charges to guest room folio!)
router.post('/order', authenticate, async (req, res, next) => {
  try {
    const { roomNumber, items, bookingId } = req.body;
    const guestId = req.user.id;

    if (!roomNumber || !items || !items.length) {
      return error(res, 'roomNumber and items are required', 400);
    }

    const total = items.reduce((sum, it) => sum + (it.price * (it.qty || 1)), 0);
    const orderId = `ord_${uuidv4().substring(0, 8)}`;

    await query(
      `INSERT INTO restaurant_orders (id, room_number, guest_id, items_json, total_amount, status, billed_to_room)
       VALUES (?, ?, ?, ?, ?, 'RECEIVED', 1)`,
      [orderId, roomNumber, guestId, JSON.stringify(items), total]
    );

    // Also add to service_requests for complete running folio aggregation!
    const summaryText = items.map(i => `${i.qty || 1}x ${i.name}`).join(', ');
    await query(
      `INSERT INTO service_requests (id, booking_id, room_number, user_id, category, description, status, cost, assigned_to)
       VALUES (?, ?, ?, ?, 'ROOM_SERVICE', ?, 'REQUESTED', ?, 'Chef Carlos Rossi')`,
      [`srv_${uuidv4().substring(0, 8)}`, bookingId || null, roomNumber, guestId, summaryText, total]
    );

    return success(res, {
      orderId,
      roomNumber,
      total,
      status: 'RECEIVED',
      estimated_delivery: '25-35 minutes'
    }, 'Order placed successfully and posted to guest room folio');
  } catch (err) {
    next(err);
  }
});

// PUT /api/restaurant/orders/:id/status
router.put('/orders/:id/status', authenticate, requireRole(['RESTAURANT', 'MANAGER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['RECEIVED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'].includes(status)) {
      return error(res, 'Invalid status', 400);
    }

    await query('UPDATE restaurant_orders SET status = ? WHERE id = ?', [status, id]);
    return success(res, { orderId: id, status }, `Order status updated to ${status}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
