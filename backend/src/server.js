const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { initSchema, queryOne } = require('./db/db');
const seed = require('./db/seed');
const errorHandler = require('./middleware/errorHandler');

// Microservice Route Modules
const authRoutes = require('./services/auth/authRoutes');
const roomRoutes = require('./services/room/roomRoutes');
const bookingRoutes = require('./services/booking/bookingRoutes');
const paymentRoutes = require('./services/payment/paymentRoutes');
const checkinRoutes = require('./services/checkin/checkinRoutes');
const housekeepingRoutes = require('./services/housekeeping/housekeepingRoutes');
const maintenanceRoutes = require('./services/maintenance/maintenanceRoutes');
const restaurantRoutes = require('./services/restaurant/restaurantRoutes');
const notificationRoutes = require('./services/notification/notificationRoutes');
const recommendationRoutes = require('./services/recommendation/recommendationRoutes');
const analyticsRoutes = require('./services/analytics/analyticsRoutes');
const servicesRoutes = require('./services/services/servicesRoutes');
const reviewsRoutes = require('./services/reviews/reviewsRoutes');
const loyaltyRoutes = require('./services/loyalty/loyaltyRoutes');
const iotRoutes = require('./services/iot/iotRoutes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[API Gateway] ${req.method} ${req.url}`);
  next();
});

// Health & System Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'StaySync Intelligent & Scalable Hotel Management System',
    architecture: 'Modular Microservices with API Gateway, Concurrency Locks & Event Broker',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'ACTIVE_RBAC',
      rooms: 'ACTIVE_MULTI_PROPERTY',
      concurrency_locks: 'ACTIVE_REDLOCK_TTL',
      booking_engine: 'ACTIVE_CONCURRENCY_SAFE',
      payments: 'ACTIVE_IDEMPOTENT',
      checkin: 'ACTIVE_KYC_VERIFICATION',
      digital_keys: 'ACTIVE_QR_NFC',
      in_stay_services: 'ACTIVE_FOLIO_SYNC',
      housekeeping: 'ACTIVE_TURNOVER_MATRIX',
      maintenance: 'ACTIVE_TICKET_WORKFLOW',
      restaurant_fnb: 'ACTIVE_ORDER_PIPELINE',
      ai_recommendation: 'ACTIVE_WEIGHTED_MODEL',
      dynamic_pricing: 'ACTIVE_SURGE_ENGINE',
      analytics: 'ACTIVE_EXECUTIVE_DASHBOARD',
      smart_iot_controls: 'ACTIVE_SIMULATED',
      loyalty: 'ACTIVE_TIERED_POINTS'
    }
  });
});

// Mount Microservice REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

// Database Auto-Initialization & Start Server
async function startServer() {
  try {
    await initSchema();

    // Check if database needs seeding
    const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
    const count = userCount ? parseInt(userCount.count) : 0;
    if (count === 0) {
      console.log('[StaySync Server] Empty database detected. Running seed script...');
      await seed();
    }

    app.listen(config.PORT, () => {
      console.log(`=======================================================`);
      console.log(`  StaySync API Gateway Server Running on Port ${config.PORT} `);
      console.log(`  Health Check: http://localhost:${config.PORT}/api/health `);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[StaySync Server Launch Failed]:', err);
  }
}

startServer();
