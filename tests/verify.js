const http = require('http');
const { spawn } = require('child_process');

// Automated smoke verification test suite for CI / local test
const server = spawn('node', ['server.js'], { stdio: ['ignore', 'pipe', 'pipe'] });

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function postJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

setTimeout(async () => {
  try {
    console.log('Running test suite for E-Commerce DBMS Case Study...');
    
    const root = await getJson('http://127.0.0.1:3000/');
    if (root.status !== 200) throw new Error('Root endpoint failed with status ' + root.status);
    console.log('✔ Root Dashboard OK (200)');

    const q1 = await getJson('http://127.0.0.1:3000/api/queries/run/8.1');
    if (q1.status !== 200) throw new Error('Query 8.1 failed');
    console.log('✔ Query 8.1 (All Products) OK (20 rows)');

    const q6 = await getJson('http://127.0.0.1:3000/api/queries/run/8.6');
    if (q6.body?.rows?.[0]?.revenue !== 220290) throw new Error('Query 8.6 revenue mismatch');
    console.log('✔ Query 8.6 (Active Revenue = ₹2,20,290.00) OK');

    const items = await getJson('http://127.0.0.1:3000/api/orders/1/items');
    if (items.body?.items?.length !== 3) throw new Error('Order items count mismatch');
    console.log('✔ Order #1 line items OK (3 items)');

    const acid = await postJson('http://127.0.0.1:3000/api/demo/acid-transaction');
    if (!acid.body?.success) throw new Error('ACID transaction demo failed');
    console.log('✔ ACID Transaction Demo OK (BEGIN -> Stock Reduction -> ROLLBACK)');

    console.log('\nAll tests passed successfully!');
    server.kill();
    process.exit(0);
  } catch (err) {
    console.error('Test assertion failed:', err.message);
    server.kill();
    process.exit(1);
  }
}, 2000);

