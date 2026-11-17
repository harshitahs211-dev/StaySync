const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'staysync_super_secret_jwt_key_2026_evaluation_1',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_DRIVER: process.env.DB_DRIVER || 'sqlite',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://staysync:staysync_pass@localhost:5432/staysync_db',
  SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || path.join(__dirname, '../../staysync_dev.db'),
  // Razorpay Test Mode Credentials
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_staysync2026',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'staysync_rzp_secret_2026',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'staysync_webhook_secret_2026'
};
