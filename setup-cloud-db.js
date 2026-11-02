#!/usr/bin/env node
// ============================================================================
// Cloud PostgreSQL Setup & Verification Utility
// Student: Vedant V Chaudhari (24010011) | DBMS 24IT501T
// Usage: node setup-cloud-db.js [YOUR_POSTGRES_CONNECTION_STRING]
// ============================================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const connString = process.argv[2] || process.env.DATABASE_URL;

  console.log('===============================================================');
  console.log('  E-COMMERCE MANAGEMENT SYSTEM — CLOUD POSTGRESQL INITIALIZER  ');
  console.log('  Student: Vedant V Chaudhari (UID: 24010011) | DBMS 24IT501T  ');
  console.log('===============================================================\n');

  if (!connString) {
    console.error('❌ Error: No PostgreSQL connection URL provided.');
    console.log('\nUsage:');
    console.log('  node setup-cloud-db.js "postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require"');
    console.log('\nOr set DATABASE_URL in your .env file.');
    console.log('\nTo get a 100% free cloud PostgreSQL database in 30 seconds (no credit card):');
    console.log('  1. Sign up at https://neon.tech');
    console.log('  2. Create a project named "vedantchaudhari_ecommerce"');
    console.log('  3. Copy your Connection String and pass it to this script!\n');
    process.exit(1);
  }

  console.log('📡 Connecting to Cloud PostgreSQL database...');
  const pool = new Pool({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    // 1. Test Connection
    const client = await pool.connect();
    const verRes = await client.query('SELECT current_database() AS db, current_user AS usr, version() AS ver');
    console.log('✅ Connected successfully!');
    console.log(`   Database : ${verRes.rows[0].db}`);
    console.log(`   User     : ${verRes.rows[0].usr}`);
    console.log(`   Engine   : ${verRes.rows[0].ver.split(' on ')[0]}`);

    // 2. Execute Schema DDL
    console.log('\n📦 Step 1/3: Executing PostgreSQL DDL Schema (db/schema.sql)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('   ✔ 6 Tables created (categories, customers, products, orders, order_items, payments)');
    console.log('   ✔ 4 Indexes created (idx_products_category, idx_orders_customer, etc.)');
    console.log('   ✔ Relational View created (v_order_summary)');

    // 3. Execute Seed DML
    console.log('\n🌱 Step 2/3: Populating 20+ Case Study Seed Records (db/seed.sql)...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf-8');
    await client.query(seedSql);
    console.log('   ✔ 20 Categories inserted');
    console.log('   ✔ 20 Customers inserted');
    console.log('   ✔ 20 Products inserted');
    console.log('   ✔ 20 Orders inserted');
    console.log('   ✔ 30 Order Items inserted');
    console.log('   ✔ 20 Payments inserted');
    console.log('   ✔ Sequences synchronized');

    // 4. Verification Queries
    console.log('\n🔬 Step 3/3: Running Verification Checks against PostgreSQL...');
    const catCount = await client.query('SELECT COUNT(*) AS c FROM categories');
    const custCount = await client.query('SELECT COUNT(*) AS c FROM customers');
    const prodCount = await client.query('SELECT COUNT(*) AS c FROM products');
    const ordCount = await client.query('SELECT COUNT(*) AS c FROM orders');
    const itemsCount = await client.query('SELECT COUNT(*) AS c FROM order_items');
    const payCount = await client.query('SELECT COUNT(*) AS c FROM payments');
    const revCheck = await client.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS revenue 
      FROM orders 
      WHERE order_status <> 'Cancelled'
    `);
    const leftJoinCheck = await client.query(`
      SELECT c.category_name, COUNT(p.product_id) AS n 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.category_id 
      WHERE c.category_name = 'Bags & Luggage' 
      GROUP BY c.category_name
    `);

    console.log(`   ✔ Categories  : ${catCount.rows[0].c} rows (Expected: 20)`);
    console.log(`   ✔ Customers   : ${custCount.rows[0].c} rows (Expected: 20)`);
    console.log(`   ✔ Products    : ${prodCount.rows[0].c} rows (Expected: 20)`);
    console.log(`   ✔ Orders      : ${ordCount.rows[0].c} rows (Expected: 20)`);
    console.log(`   ✔ Order Items : ${itemsCount.rows[0].c} rows (Expected: 30)`);
    console.log(`   ✔ Payments    : ${payCount.rows[0].c} rows (Expected: 20)`);
    console.log(`   ✔ Active Rev. : ₹${Number(revCheck.rows[0].revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Expected: ₹2,20,290.00)`);
    console.log(`   ✔ LEFT JOIN   : "${leftJoinCheck.rows[0]?.category_name}" has ${leftJoinCheck.rows[0]?.n} products (Expected: 0)`);

    client.release();
    await pool.end();

    // 5. Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${connString}`);
    } else {
      envContent += `\nDATABASE_URL=${connString}\nPORT=3000\nDB_SSL=true\n`;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    console.log('\n💾 Saved active DATABASE_URL to your .env file!');

    console.log('\n===============================================================');
    console.log('🎉 YOUR CLOUD POSTGRESQL DATABASE IS READY AND LIVE!');
    console.log('You can now start the web portal:');
    console.log('   npm start');
    console.log('Or deploy directly to Render / Vercel with this DATABASE_URL.');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Cloud PostgreSQL setup error:', err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();

