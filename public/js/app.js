// ============================================================================
// E-Commerce Management System - Client Interactivity
// Student: Vedant V Chaudhari (24010011) | DBMS 24IT501T
// ============================================================================

let currentQueryId = '8.1';

document.addEventListener('DOMContentLoaded', () => {
  initNavTabs();
  // Auto-run first query on page load
  loadCaseStudyQuery('8.1');
});

// Navigation Tabs Smooth Scrolling & Active State
function initNavTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

// Format numbers to Indian currency style
function formatINR(number) {
  return Number(number || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ----------------------------------------------------------------------------
// MODAL CONTROLLERS
// ----------------------------------------------------------------------------

function openOrderModal() {
  document.getElementById('order-modal').classList.add('open');
  updateModalPrice();
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('open');
}

function orderProduct(productId, productName, price) {
  const modal = document.getElementById('order-modal');
  const select = document.getElementById('modal-product-select');
  if (select) {
    select.value = productId;
    updateModalPrice();
  }
  modal.classList.add('open');
}

function updateModalPrice() {
  const select = document.getElementById('modal-product-select');
  const qtyInput = document.getElementById('modal-quantity');
  const totalDisplay = document.getElementById('modal-total-display');

  if (!select || !qtyInput || !totalDisplay) return;

  const selectedOpt = select.options[select.selectedIndex];
  const price = selectedOpt ? parseFloat(selectedOpt.getAttribute('data-price') || 0) : 0;
  const qty = parseInt(qtyInput.value, 10) || 1;
  const total = price * qty;

  totalDisplay.innerHTML = `&#8377;${formatINR(total)}`;
}

// Order Items Modal
async function viewOrderItems(orderId, customerName, totalAmount) {
  const modal = document.getElementById('items-modal');
  const title = document.getElementById('items-modal-title');
  const subtitle = document.getElementById('items-modal-subtitle');
  const loading = document.getElementById('items-modal-loading');
  const content = document.getElementById('items-modal-content');
  const tbody = document.getElementById('items-table-body');

  title.innerText = `Order #${orderId} - ${customerName}`;
  subtitle.innerHTML = `Total Amount: <strong>&#8377;${formatINR(totalAmount)}</strong> &bull; Querying <code>order_items</code>`;

  loading.classList.remove('hidden');
  content.classList.add('hidden');
  modal.classList.add('open');

  try {
    const res = await fetch(`/api/orders/${orderId}/items`);
    const data = await res.json();

    loading.classList.add('hidden');
    content.classList.remove('hidden');
    tbody.innerHTML = '';

    if (!data.success || !data.items || data.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No line items found for this order.</td></tr>';
      return;
    }

    data.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="code-sku">${item.sku}</span></td>
        <td><strong>${item.product_name}</strong><br><small class="text-muted">${item.brand}</small></td>
        <td>${item.category_name}</td>
        <td>&#8377;${formatINR(item.unit_price)}</td>
        <td><strong>${item.quantity}</strong></td>
        <td><strong>&#8377;${formatINR(item.line_total)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    loading.innerText = `Error loading items: ${err.message}`;
  }
}

function closeItemsModal() {
  document.getElementById('items-modal').classList.remove('open');
}

// Cloud Modal
function openCloudModal() {
  document.getElementById('cloud-modal').classList.add('open');
}
function closeCloudModal() {
  document.getElementById('cloud-modal').classList.remove('open');
}

// ACID Modal
function closeAcidModal() {
  document.getElementById('acid-modal').classList.remove('open');
}

// Close modals when clicking backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
  }
});

// ----------------------------------------------------------------------------
// CASE STUDY QUERY RUNNER (SECTIONS 8.1 - 8.9)
// ----------------------------------------------------------------------------

const queryDefinitions = {
  '8.1': {
    title: '8.1 Display All Products',
    desc: 'Retrieves all products with brand, price, and stock quantity ordered by product_id.',
    sql: `SELECT product_id, product_name, brand, price, stock_qty
FROM products
ORDER BY product_id;`,
  },
  '8.2': {
    title: '8.2 JOIN Products with Categories',
    desc: 'Combines products with categories using an INNER JOIN on category_id.',
    sql: `SELECT p.product_name, p.brand, c.category_name
FROM products p
JOIN categories c ON c.category_id = p.category_id
ORDER BY p.product_id;`,
  },
  '8.3': {
    title: '8.3 List Orders Placed or Shipped',
    desc: 'Filters active orders currently in "Placed" or "Shipped" status using JOIN with customers.',
    sql: `SELECT o.order_id, c.full_name, TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date, o.order_status, o.total_amount
FROM orders o
JOIN customers c USING (customer_id)
WHERE o.order_status IN ('Placed', 'Shipped')
ORDER BY o.order_date;`,
  },
  '8.4': {
    title: '8.4 Count Products in Each Category (LEFT JOIN & GROUP BY)',
    desc: 'Counts products per category. Demonstrates LEFT JOIN because "Bags & Luggage" shows 0 products instead of being excluded.',
    sql: `SELECT c.category_name, COUNT(p.product_id) AS number_of_products
FROM categories c
LEFT JOIN products p ON p.category_id = c.category_id
GROUP BY c.category_name
ORDER BY c.category_name;`,
  },
  '8.5': {
    title: '8.5 Customers Who Have Cancelled Orders (Subquery)',
    desc: 'Subquery identifying customers who placed orders that were cancelled (Advait Joshi, Neha Banerjee).',
    sql: `SELECT full_name
FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_status = 'Cancelled')
ORDER BY full_name;`,
  },
  '8.6': {
    title: '8.6 Total Revenue (Excluding Cancelled Orders)',
    desc: 'Calculates active revenue (Sum = ₹2,20,290.00). Total including cancelled is ₹2,57,080.00.',
    sql: `SELECT SUM(total_amount) AS total_revenue
FROM orders
WHERE order_status <> 'Cancelled';`,
  },
  '8.7': {
    title: '8.7 Top-Selling Products (JOIN, GROUP BY, LIMIT)',
    desc: 'Finds top 5 best selling products by units sold across non-cancelled orders.',
    sql: `SELECT p.product_name, SUM(oi.quantity) AS units_sold
FROM order_items oi
JOIN products p USING (product_id)
JOIN orders o USING (order_id)
WHERE o.order_status <> 'Cancelled'
GROUP BY p.product_name
ORDER BY units_sold DESC, p.product_name
LIMIT 5;`,
  },
  '8.8': {
    title: '8.8 View: Order Summary (v_order_summary)',
    desc: 'Queries the relational database view joining orders, customers, items count, and payments.',
    sql: `SELECT order_id, full_name, order_status, line_items, total_amount, payment_method, payment_status
FROM v_order_summary
ORDER BY order_id ASC
LIMIT 10;`,
  },
  '8.9': {
    title: '8.9 Customers Who Have Not Placed Any Order (NOT IN)',
    desc: 'Identifies registered customers who have never placed an order (IDs 16-20).',
    sql: `SELECT customer_id, full_name
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders)
ORDER BY customer_id;`,
  },
};

function loadCaseStudyQuery(queryId) {
  currentQueryId = queryId;

  // Highlight active button
  document.querySelectorAll('.query-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.querySelector('.q-num')?.innerText === queryId) {
      btn.classList.add('active');
    }
  });

  const def = queryDefinitions[queryId];
  if (!def) return;

  document.getElementById('query-active-title').innerText = def.title;
  document.getElementById('query-active-desc').innerText = def.desc;
  document.getElementById('query-active-sql').innerText = def.sql;

  executeCurrentQuery();
}

async function executeCurrentQuery() {
  const btn = document.getElementById('btn-run-query');
  const countBadge = document.getElementById('result-row-count');
  const tableContainer = document.getElementById('query-result-table');

  btn.disabled = true;
  btn.innerHTML = 'Executing...';
  countBadge.innerText = 'Running...';
  tableContainer.innerHTML = '<p class="text-muted p-4">Executing query on PostgreSQL database...</p>';

  try {
    const res = await fetch(`/api/queries/run/${currentQueryId}`);
    const data = await res.json();

    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Execute SQL`;

    if (!data.success) {
      countBadge.innerText = 'Error';
      tableContainer.innerHTML = `<div class="p-4" style="color: #f87171;">Query Failed: ${data.error}</div>`;
      return;
    }

    countBadge.innerText = `${data.rowCount} rows returned`;

    if (!data.rows || data.rows.length === 0) {
      tableContainer.innerHTML = '<p class="text-muted p-4">Query executed successfully. 0 rows returned.</p>';
      return;
    }

    const columns = Object.keys(data.rows[0]);
    let html = '<table class="data-table"><thead><tr>';
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.rows.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        let val = row[col];
        if (col.includes('price') || col.includes('amount') || col.includes('revenue') || col.includes('total')) {
          val = `&#8377;${formatINR(val)}`;
        }
        html += `<td>${val !== null && val !== undefined ? val : '<span class="text-muted">NULL</span>'}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    tableContainer.innerHTML = html;
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = 'Execute SQL';
    countBadge.innerText = 'Failed';
    tableContainer.innerHTML = `<div class="p-4" style="color: #f87171;">Network Error: ${err.message}</div>`;
  }
}

// ----------------------------------------------------------------------------
// SECTION 8.10 ACID TRANSACTION DEMONSTRATION
// ----------------------------------------------------------------------------

async function runAcidDemo() {
  const modal = document.getElementById('acid-modal');
  const traceBox = document.getElementById('acid-trace-container');

  traceBox.innerHTML = 'Executing PostgreSQL ACID Transaction with ROLLBACK...\n';
  modal.classList.add('open');

  try {
    const res = await fetch('/api/demo/acid-transaction', { method: 'POST' });
    const data = await res.json();

    if (data.success) {
      traceBox.innerHTML = data.steps.join('\n\n');
    } else {
      traceBox.innerHTML = `Error during transaction demo:\n${data.error}\n\n` + (data.steps ? data.steps.join('\n') : '');
    }
  } catch (err) {
    traceBox.innerHTML = `Failed to contact server: ${err.message}`;
  }
}

// ----------------------------------------------------------------------------
// CLOUD DATABASE CONNECTOR
// ----------------------------------------------------------------------------

async function connectCloudDb() {
  const input = document.getElementById('input-cloud-url');
  const msg = document.getElementById('cloud-connect-msg');
  const url = input.value.trim();

  if (!url) {
    msg.innerHTML = '<span style="color: #ef4444;">Please paste a PostgreSQL connection URL.</span>';
    return;
  }

  msg.innerHTML = '<span style="color: #2563eb;">Testing connection, creating schema &amp; seeding data...</span>';

  try {
    const res = await fetch('/api/db/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ databaseUrl: url }),
    });
    const data = await res.json();

    if (data.success) {
      msg.innerHTML = `<span style="color: #10b981;">${data.message} Reloading...</span>`;
      setTimeout(() => window.location.reload(), 1500);
    } else {
      msg.innerHTML = `<span style="color: #ef4444;">Connection failed: ${data.error}</span>`;
    }
  } catch (err) {
    msg.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
  }
}

async function connectCloudDbFromModal() {
  const input = document.getElementById('modal-cloud-url');
  const msg = document.getElementById('modal-cloud-msg');
  const url = input.value.trim();

  if (!url) {
    msg.innerHTML = '<span style="color: #ef4444;">Please paste a PostgreSQL connection URL.</span>';
    return;
  }

  msg.innerHTML = '<span style="color: #2563eb;">Connecting to Cloud PostgreSQL...</span>';

  try {
    const res = await fetch('/api/db/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ databaseUrl: url }),
    });
    const data = await res.json();

    if (data.success) {
      msg.innerHTML = `<span style="color: #10b981;">Connected successfully! Reloading...</span>`;
      setTimeout(() => window.location.reload(), 1200);
    } else {
      msg.innerHTML = `<span style="color: #ef4444;">Failed: ${data.error}</span>`;
    }
  } catch (err) {
    msg.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
  }
}

// Reset Database to Seed State
async function resetDatabase() {
  if (!confirm('Are you sure you want to reset the database to the original 20-row case study records?')) return;

  try {
    const res = await fetch('/api/db/reset', { method: 'POST' });
    const data = await res.json();
    alert(data.message || 'Database reset successfully.');
    window.location.reload();
  } catch (err) {
    alert(`Failed to reset: ${err.message}`);
  }
}

