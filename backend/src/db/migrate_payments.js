const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../staysync_dev.db');
const db = new sqlite3.Database(dbPath);

const columnsToAdd = [
  { name: 'razorpay_order_id', def: 'VARCHAR(100)' },
  { name: 'razorpay_payment_id', def: 'VARCHAR(100)' },
  { name: 'razorpay_signature', def: 'TEXT' },
  { name: 'currency', def: "VARCHAR(10) DEFAULT 'INR'" },
  { name: 'error_code', def: 'VARCHAR(50)' },
  { name: 'error_description', def: 'TEXT' },
  { name: 'refund_id', def: 'VARCHAR(100)' },
  { name: 'refund_status', def: 'VARCHAR(50)' },
  { name: 'updated_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
];

db.all('PRAGMA table_info(payments)', (err, existingCols) => {
  if (err) {
    console.error('Error fetching table info:', err);
    process.exit(1);
  }

  const existingNames = new Set(existingCols.map(c => c.name));
  let pending = 0;

  columnsToAdd.forEach(col => {
    if (!existingNames.has(col.name)) {
      pending++;
      const sql = `ALTER TABLE payments ADD COLUMN ${col.name} ${col.def}`;
      db.run(sql, err => {
        if (err) console.error(`Error adding ${col.name}:`, err.message);
        else console.log(`Added column ${col.name} to payments table`);
        pending--;
        if (pending === 0) finish();
      });
    }
  });

  if (pending === 0) finish();
});

function finish() {
  db.all('PRAGMA table_info(payments)', (err, rows) => {
    console.log('Payments columns:', rows.map(r => r.name));
    db.close();
  });
}
