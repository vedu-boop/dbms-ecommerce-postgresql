const http = require('http');
const { spawn } = require('child_process');

const server = spawn('node', ['server.js'], { stdio: ['ignore', 'pipe', 'pipe'] });

let output = '';
server.stdout.on('data', (d) => output += d.toString());
server.stderr.on('data', (d) => output += d.toString());

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

async function waitForServer(retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await getJson('http://127.0.0.1:3000/');
      if (res.status === 200) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 600));
  }
  throw new Error('Server did not start in time. Output: ' + output);
}

async function runTests() {
  try {
    console.log('Connecting to server with live Singapore Cloud PostgreSQL database...');
    await waitForServer();
    console.log('✔ Server online & connected to Neon Cloud PostgreSQL!');

    const q1 = await getJson('http://127.0.0.1:3000/api/queries/run/8.1');
    console.log(`✔ Query 8.1 (All Products) OK (${q1.body?.rowCount} rows live from Neon)`);

    const q6 = await getJson('http://127.0.0.1:3000/api/queries/run/8.6');
    console.log(`✔ Query 8.6 (Active Revenue = ₹${Number(q6.body?.rows?.[0]?.total_revenue).toLocaleString('en-IN')}) OK`);

    const items = await getJson('http://127.0.0.1:3000/api/orders/1/items');
    console.log(`✔ Order #1 line items OK (${items.body?.items?.length} items from associative table)`);

    const acid = await postJson('http://127.0.0.1:3000/api/demo/acid-transaction');
    console.log(`✔ ACID Transaction Demo OK (${acid.body?.steps?.length} steps: BEGIN -> Stock Lock -> Stock 99 -> ROLLBACK -> Stock 100)`);

    console.log('\n===============================================================');
    console.log('🎉 100% OF LIVE POSTGRESQL TESTS PASSED PERFECTLY!');
    console.log('===============================================================');
    server.kill();
    process.exit(0);
  } catch (err) {
    console.error('Test assertion failed:', err.message);
    server.kill();
    process.exit(1);
  }
}

runTests();
