const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

let dbDriver = config.DB_DRIVER || 'sqlite';
let sqliteDb = null;
let pgPool = null;

if (dbDriver === 'postgres') {
  try {
    pgPool = new Pool({
      connectionString: config.DATABASE_URL
    });
    console.log('[StaySync DB] Connected to PostgreSQL Database');
  } catch (err) {
    console.warn('[StaySync DB] Failed to connect to PostgreSQL, falling back to SQLite:', err.message);
    dbDriver = 'sqlite';
  }
}

if (dbDriver === 'sqlite') {
  const dbPath = config.SQLITE_DB_PATH;
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[StaySync DB] SQLite connection error:', err);
    } else {
      console.log(`[StaySync DB] Connected to SQLite Database (${dbPath})`);
    }
  });
}

// Unified async query interface for all services
async function query(sql, params = []) {
  if (dbDriver === 'postgres' && pgPool) {
    // Convert positional ? to PostgreSQL $1, $2 params
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const result = await pgPool.query(pgSql, params);
    return result.rows;
  } else {
    // SQLite execution
    return new Promise((resolve, reject) => {
      const trimmedSql = sql.trim();
      if (trimmedSql.toUpperCase().startsWith('SELECT')) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes, lastID: this.lastID });
        });
      }
    });
  }
}

// Single row query helper
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Initialize tables from schema.sql
async function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (dbDriver === 'postgres' && pgPool) {
    await pgPool.query(schemaSql);
  } else {
    // For SQLite, split SQL statements and execute sequentially
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await new Promise((resolve, reject) => {
        sqliteDb.run(stmt, (err) => {
          if (err) {
            // Ignore benign sqlite index/table exists errors
            if (!err.message.includes('already exists')) {
              console.warn('[SQLite Init Statement Warning]:', err.message);
            }
          }
          resolve();
        });
      });
    }
  }
  console.log('[StaySync DB] Schema initialized successfully.');
}

module.exports = {
  query,
  queryOne,
  initSchema,
  dbDriver
};
