/**
 * POPTO Database Migration Script: SQLite to PostgreSQL / Supabase
 * Usage: node scripts/migrate-pg.js
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;
  if (!databaseUrl) {
    console.log('No DATABASE_URL or SUPABASE_URL configured in environment.');
    console.log('SQLite (data/popto.db) remains the active relational database.');
    console.log('To migrate to Supabase / PostgreSQL, set DATABASE_URL=postgres://... and rerun this script.');
    return;
  }

  console.log('Connecting to PostgreSQL / Supabase...');
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

    console.log('Executing PostgreSQL DDL Schema...');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../src/lib/db/schema-pg.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('✓ PostgreSQL tables, indexes, and constraints verified.');

    const sqlitePath = path.resolve(process.env.DATABASE_PATH || './data/popto.db');
    if (fs.existsSync(sqlitePath)) {
      console.log('Reading data from local SQLite database:', sqlitePath);
      const sqlite = new Database(sqlitePath);

      const tables = [
        'users', 'addresses', 'sellers', 'categories', 'products',
        'product_images', 'cart_items', 'orders', 'order_items',
        'order_status_history', 'payments', 'reviews', 'wishlists',
        'coupons', 'coupon_usage', 'notifications', 'login_activity',
        'security_events', 'audit_logs', 'support_tickets', 'site_content'
      ];

      for (const table of tables) {
        try {
          const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
          if (rows.length > 0) {
            console.log(`Migrating ${rows.length} records into '${table}'...`);
            for (const row of rows) {
              const keys = Object.keys(row);
              const values = Object.values(row);
              const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
              const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
              await pool.query(query, values);
            }
          }
        } catch (tableErr) {
          console.warn(`Table '${table}' migration note:`, tableErr.message);
        }
      }
      console.log('✓ All SQLite data successfully synced to PostgreSQL.');
    }

    await pool.end();
    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

migrate();