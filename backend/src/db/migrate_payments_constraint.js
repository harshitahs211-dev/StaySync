const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../staysync_dev.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys=OFF;');

  db.run(`
    CREATE TABLE IF NOT EXISTS payments_new (
      id VARCHAR(64) PRIMARY KEY,
      booking_reference VARCHAR(20) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      payment_method VARCHAR(50) DEFAULT 'RAZORPAY',
      status VARCHAR(50) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED')),
      transaction_id VARCHAR(100),
      idempotency_key VARCHAR(100) UNIQUE,
      razorpay_order_id VARCHAR(100),
      razorpay_payment_id VARCHAR(100),
      razorpay_signature TEXT,
      error_code VARCHAR(50),
      error_description TEXT,
      refund_id VARCHAR(100),
      refund_status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    INSERT INTO payments_new (
      id, booking_reference, user_id, amount, currency, payment_method, status,
      transaction_id, idempotency_key, razorpay_order_id, razorpay_payment_id,
      razorpay_signature, error_code, error_description, refund_id, refund_status,
      created_at
    )
    SELECT
      id, booking_reference, user_id, amount, COALESCE(currency, 'INR'), payment_method, status,
      transaction_id, idempotency_key, razorpay_order_id, razorpay_payment_id,
      razorpay_signature, error_code, error_description, refund_id, refund_status,
      created_at
    FROM payments;
  `, (err) => {
    if (err) console.error('Data copy error:', err.message);
    else console.log('Copied existing payments data');
  });

  db.run('DROP TABLE payments;');
  db.run('ALTER TABLE payments_new RENAME TO payments;');
  db.run('PRAGMA foreign_keys=ON;');

  db.all('SELECT sql FROM sqlite_master WHERE type="table" AND name="payments";', (err, rows) => {
    if (err) console.error(err);
    else console.log('New table schema:', rows[0]?.sql);
    db.close();
  });
});
