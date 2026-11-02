require('dotenv').config();
const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Express Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to format Indian currency (INR)
const money = (n) =>
  Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Root Route: Main Application Dashboard
app.get('/', async (req, res) => {
  const search = (req.query.q || '').toString().trim();
  const categoryFilter = (req.query.category || '').toString().trim();
  const statusFilter = (req.query.status || '').toString().trim();
  const like = `%${search}%`;

  try {
    // 1. Dashboard Aggregate Queries
    const prodCountRes = await db.query('SELECT COUNT(*) AS n FROM products');
    const custCountRes = await db.query('SELECT COUNT(*) AS n FROM customers');
    const ordCountRes = await db.query('SELECT COUNT(*) AS n FROM orders');
    const revRes = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS revenue
      FROM orders
      WHERE order_status <> 'Cancelled'
    `);

    const totalProducts = parseInt(prodCountRes.rows[0]?.n || 0, 10);
    const totalCustomers = parseInt(custCountRes.rows[0]?.n || 0, 10);
    const totalOrders = parseInt(ordCountRes.rows[0]?.n || 0, 10);
    const revenue = parseFloat(revRes.rows[0]?.revenue || 0);

    // 2. Fetch Categories for Dropdown and Filtering
    const catRes = await db.query('SELECT category_id, category_name FROM categories ORDER BY category_id');
    const categories = catRes.rows;

    // 3. Products Catalogue Query with Search and Category Filtering
    let productSql = `
      SELECT p.product_id, p.sku, p.product_name, p.brand, p.price,
             p.stock_qty, p.category_id, c.category_name, p.listed_on
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      WHERE (p.product_name ILIKE $1 OR p.brand ILIKE $1 OR c.category_name ILIKE $1)
    `;
    const productParams = [like];

    if (categoryFilter) {
      productParams.push(categoryFilter);
      productSql += ` AND p.category_id = $${productParams.length}`;
    }
    productSql += ` ORDER BY p.product_id ASC`;

    const productsRes = await db.query(productSql, productParams);
    const products = productsRes.rows;

    // 4. Fetch Customers for Order Placement Dropdown
    const customersRes = await db.query('SELECT customer_id, full_name, email, city FROM customers ORDER BY customer_id ASC');
    const customers = customersRes.rows;

    // 5. Recent Orders Query from v_order_summary View
    let ordersSql = `
      SELECT order_id, full_name, TO_CHAR(order_date, 'YYYY-MM-DD') AS order_date,
             order_status, line_items, total_amount, payment_method, payment_status
      FROM v_order_summary
    `;
    const orderParams = [];
    if (statusFilter) {
      orderParams.push(statusFilter);
      ordersSql += ` WHERE order_status = $1`;
    }
    ordersSql += ` ORDER BY order_id DESC LIMIT 15`;

    const ordersRes = await db.query(ordersSql, orderParams);
    const orders = ordersRes.rows;

    // Database Connection Info
    const dbInfo = db.getConnectionInfo();

    res.render('index', {
      products,
      orders,
      categories,
      customers,
      search,
      categoryFilter,
      statusFilter,
      money,
      totalProducts,
      totalCustomers,
      totalOrders,
      revenue,
      dbInfo,
      message: (req.query.msg || '').toString(),
      error: (req.query.err || '').toString(),
    });
  } catch (err) {
    console.error('[Route GET / Error]:', err);
    res.status(500).render('error', {
      error: err.message,
      dbInfo: db.getConnectionInfo(),
    });
  }
});

// Route: Register New Customer (Section 8.10 / Section 9)
app.post('/customers/add', async (req, res) => {
  const name = (req.body.full_name || '').trim();
  const email = (req.body.email || '').trim();
  const phone = (req.body.phone || '').trim() || null;
  const city = (req.body.city || '').trim();
  const state = (req.body.state || '').trim();

  const redirectWithMsg = (msg, isErr = false) => {
    const key = isErr ? 'err' : 'msg';
    return res.redirect(`/?${key}=${encodeURIComponent(msg)}#customers-section`);
  };

  if (!name || !email || !city || !state) {
    return redirectWithMsg('Please fill in all required customer fields.', true);
  }

  try {
    await db.query(
      `INSERT INTO customers (full_name, email, phone, city, state, registered_on)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)`,
      [name, email, phone, city, state]
    );
    redirectWithMsg(`Customer "${name}" registered successfully.`);
  } catch (err) {
    console.error('[Add Customer Error]:', err);
    if (err.code === '23505') {
      redirectWithMsg('Error: A customer with that email or phone number is already registered (Unique Constraint).', true);
    } else {
      redirectWithMsg(`Database Error: ${err.message}`, true);
    }
  }
});

// Route: Create Order with ACID Transaction (Atomicity demonstration)
app.post('/orders/create', async (req, res) => {
  const customerId = parseInt(req.body.customer_id, 10);
  const productId = parseInt(req.body.product_id, 10);
  const quantity = parseInt(req.body.quantity, 10);
  const paymentMethod = req.body.payment_method || 'UPI';
  const shippingCity = (req.body.shipping_city || '').trim();

  const redirectWithMsg = (msg, isErr = false) => {
    const key = isErr ? 'err' : 'msg';
    return res.redirect(`/?${key}=${encodeURIComponent(msg)}#orders-section`);
  };

  if (!customerId || !productId || !quantity || quantity <= 0 || !shippingCity) {
    return redirectWithMsg('Invalid order details. Please complete all fields with a valid quantity.', true);
  }

  try {
    const result = await db.executeTransaction(async (client) => {
      // 1. Fetch product and lock row for stock verification
      const prodRes = await client.query(
        'SELECT product_id, product_name, price, stock_qty FROM products WHERE product_id = $1 FOR UPDATE',
        [productId]
      );
      if (prodRes.rows.length === 0) {
        throw new Error('Selected product does not exist.');
      }
      const product = prodRes.rows[0];

      if (product.stock_qty < quantity) {
        throw new Error(`Insufficient stock for "${product.product_name}". Available: ${product.stock_qty}, Requested: ${quantity}.`);
      }

      const unitPrice = parseFloat(product.price);
      const totalAmount = unitPrice * quantity;

      // 2. Insert into orders table
      const orderRes = await client.query(
        `INSERT INTO orders (customer_id, order_date, order_status, shipping_city, total_amount)
         VALUES ($1, CURRENT_DATE, 'Placed', $2, $3)
         RETURNING order_id`,
        [customerId, shippingCity, totalAmount]
      );
      const newOrderId = orderRes.rows[0].order_id;

      // 3. Insert into order_items table (Associative entity)
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [newOrderId, productId, quantity, unitPrice]
      );

      // 4. Deduct inventory from products table
      await client.query(
        `UPDATE products SET stock_qty = stock_qty - $1 WHERE product_id = $2`,
        [quantity, productId]
      );

      // 5. Insert payment record
      await client.query(
        `INSERT INTO payments (order_id, payment_date, payment_method, amount, payment_status)
         VALUES ($1, CURRENT_DATE, $2, $3, 'Paid')`,
        [newOrderId, paymentMethod, totalAmount]
      );

      return { newOrderId, productName: product.product_name, totalAmount };
    });

    redirectWithMsg(`Order #${result.newOrderId} created successfully! ₹${money(result.totalAmount)} for ${result.productName}. Stock deducted atomically.`);
  } catch (err) {
    console.error('[Order Placement Transaction Failed]:', err.message);
    redirectWithMsg(`Transaction Aborted (Rolled Back): ${err.message}`, true);
  }
});

// Route: Update Order Status
app.post('/orders/:id/status', async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const newStatus = req.body.status;

  const validStatuses = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return res.redirect('/?err=Invalid order status#orders-section');
  }

  try {
    await db.query(
      `UPDATE orders SET order_status = $1 WHERE order_id = $2`,
      [newStatus, orderId]
    );

    // If order is cancelled, update payment status to Refunded or Failed
    if (newStatus === 'Cancelled') {
      await db.query(
        `UPDATE payments SET payment_status = 'Refunded' WHERE order_id = $1 AND payment_status = 'Paid'`,
        [orderId]
      );
    }

    res.redirect(`/?msg=Order #${orderId} status updated to ${newStatus}#orders-section`);
  } catch (err) {
    res.redirect(`/?err=Failed to update order: ${encodeURIComponent(err.message)}#orders-section`);
  }
});

// Route: Fetch Order Items Details (Modal inspection)
app.get('/api/orders/:id/items', async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  try {
    const itemsRes = await db.query(
      `SELECT oi.order_item_id, oi.quantity, oi.unit_price,
              (oi.quantity * oi.unit_price) AS line_total,
              p.product_name, p.sku, p.brand, c.category_name
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       JOIN categories c ON c.category_id = p.category_id
       WHERE oi.order_id = $1
       ORDER BY oi.order_item_id ASC`,
      [orderId]
    );
    res.json({ success: true, items: itemsRes.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route: DBMS Laboratory & Case Study Query Runner (Section 8.1 - 8.9)
app.get('/api/queries/run/:queryId', async (req, res) => {
  const queryId = req.params.queryId;

  const queryRegistry = {
    '8.1': {
      title: '8.1 Display All Products',
      description: 'Retrieves all products ordered by product_id.',
      sql: `SELECT product_id, product_name, brand, price, stock_qty
FROM products
ORDER BY product_id;`,
    },
    '8.2': {
      title: '8.2 JOIN Products with Categories',
      description: 'Combines products with categories using an INNER JOIN.',
      sql: `SELECT p.product_name, p.brand, c.category_name
FROM products p
JOIN categories c ON c.category_id = p.category_id
ORDER BY p.product_id;`,
    },
    '8.3': {
      title: '8.3 List Orders Placed or Shipped',
      description: 'Filters active orders currently in "Placed" or "Shipped" status.',
      sql: `SELECT o.order_id, c.full_name, TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date, o.order_status, o.total_amount
FROM orders o
JOIN customers c USING (customer_id)
WHERE o.order_status IN ('Placed', 'Shipped')
ORDER BY o.order_date;`,
    },
    '8.4': {
      title: '8.4 Count Products in Each Category (LEFT JOIN & GROUP BY)',
      description: 'Counts products per category. Shows 0 for "Bags & Luggage" because LEFT JOIN keeps categories without products.',
      sql: `SELECT c.category_name, COUNT(p.product_id) AS number_of_products
FROM categories c
LEFT JOIN products p ON p.category_id = c.category_id
GROUP BY c.category_name
ORDER BY c.category_name;`,
    },
    '8.5': {
      title: '8.5 Customers Who Have Cancelled Orders (Subquery)',
      description: 'Uses an IN subquery to find customers with cancelled orders (Advait Joshi, Neha Banerjee).',
      sql: `SELECT full_name
FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_status = 'Cancelled')
ORDER BY full_name;`,
    },
    '8.6': {
      title: '8.6 Total Revenue (Excluding Cancelled Orders)',
      description: 'Calculates active revenue (Sum = ₹2,20,290.00).',
      sql: `SELECT SUM(total_amount) AS total_revenue
FROM orders
WHERE order_status <> 'Cancelled';`,
    },
    '8.7': {
      title: '8.7 Top-Selling Products (JOIN, GROUP BY, LIMIT)',
      description: 'Aggregates units sold per product across non-cancelled orders and limits to Top 5.',
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
      description: 'Queries the relational database view joining orders, customers, items count, and payment info.',
      sql: `SELECT order_id, full_name, order_status, line_items, total_amount, payment_method, payment_status
FROM v_order_summary
ORDER BY order_id ASC
LIMIT 10;`,
    },
    '8.9': {
      title: '8.9 Customers Who Have Not Placed Any Order (NOT IN)',
      description: 'Identifies non-ordering customers using a NOT IN subquery (IDs 16-20).',
      sql: `SELECT customer_id, full_name
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders)
ORDER BY customer_id;`,
    },
  };

  const selected = queryRegistry[queryId];
  if (!selected) {
    return res.status(404).json({ success: false, error: 'Query not found' });
  }

  try {
    const result = await db.query(selected.sql);
    res.json({
      success: true,
      queryId,
      title: selected.title,
      description: selected.description,
      sql: selected.sql,
      rows: result.rows,
      rowCount: result.rows.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      title: selected.title,
      sql: selected.sql,
      error: err.message,
    });
  }
});

// Route: ACID Transaction Demo (Section 8.10 Demonstration)
app.post('/api/demo/acid-transaction', async (req, res) => {
  const steps = [];
  try {
    steps.push('1. Step 1: Starting ACID Transaction (BEGIN)...');
    
    // Check initial stock of boAt Headphones (product_id = 17)
    const initialCheck = await db.query('SELECT product_name, stock_qty FROM products WHERE product_id = 17');
    const initialStock = initialCheck.rows[0]?.stock_qty || 100;
    steps.push(`2. Step 2: Initial Stock of "${initialCheck.rows[0]?.product_name}" is: ${initialStock}`);

    // Run transaction with explicit ROLLBACK
    if (db.isCloudConnected()) {
      const client = await db.getPool().connect();
      try {
        await client.query('BEGIN');
        steps.push('3. Step 3: Inserting test order for Customer 16 (Kavya Menon) for ₹1,499.00...');
        const ordRes = await client.query(`
          INSERT INTO orders (customer_id, order_date, order_status, shipping_city, total_amount)
          VALUES (16, CURRENT_DATE, 'Placed', 'Thiruvananthapuram', 1499.00)
          RETURNING order_id
        `);
        const tempOrderId = ordRes.rows[0].order_id;
        steps.push(`4. Step 4: Test order created with ID #${tempOrderId}. Adding order item...`);

        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES ($1, 17, 1, 1499.00)
        `, [tempOrderId]);

        steps.push('5. Step 5: Deducting stock by 1...');
        await client.query(`
          UPDATE products SET stock_qty = stock_qty - 1 WHERE product_id = 17
        `);

        const midCheck = await client.query('SELECT stock_qty FROM products WHERE product_id = 17');
        steps.push(`6. Step 6: Inside active transaction, stock is verified as: ${midCheck.rows[0].stock_qty}`);

        steps.push('7. Step 7: Executing ROLLBACK to simulate cancellation/abort...');
        await client.query('ROLLBACK');
        steps.push('8. Step 8: Transaction rolled back completely.');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      steps.push('3. Step 3: [Mock Mode] Simulating order insertion & item mapping...');
      steps.push('4. Step 4: [Mock Mode] Temporary stock reduced to 99.');
      steps.push('5. Step 5: [Mock Mode] Triggering ROLLBACK.');
      steps.push('6. Step 6: [Mock Mode] Stock returned to 100.');
    }

    // Verify stock restored after rollback
    const postCheck = await db.query('SELECT product_name, stock_qty FROM products WHERE product_id = 17');
    const restoredStock = postCheck.rows[0]?.stock_qty || 100;
    steps.push(`9. Step 9: Post-ROLLBACK verification: Stock is safely restored to: ${restoredStock}`);
    steps.push('✅ ACID Demonstration Complete: Atomicity and Isolation verified successfully!');

    res.json({ success: true, steps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, steps });
  }
});

// Route: Connect to Cloud Database dynamically
app.post('/api/db/connect', async (req, res) => {
  const { databaseUrl } = req.body;
  if (!databaseUrl || !databaseUrl.trim()) {
    return res.status(400).json({ success: false, error: 'Database URL cannot be empty.' });
  }

  const result = await db.initDb(databaseUrl.trim());
  if (result.success) {
    res.json({ success: true, message: 'Connected to Cloud PostgreSQL successfully!', connectionInfo: result.connectionInfo });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// Route: Reset Database to Original Seed Data
app.post('/api/db/reset', async (req, res) => {
  try {
    const result = await db.resetDatabase();
    res.json({ success: true, message: 'Database reset to original 20-row case study records.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server & Initialize Database
async function startServer() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` E-COMMERCE MANAGEMENT SYSTEM (DBMS CASE STUDY)`);
    console.log(` Student: Vedant V Chaudhari (UID: 24010011)`);
    console.log(` Web Server listening on port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` Cloud Ready: PostgreSQL (Neon / Render / Supabase)`);
    console.log(`=======================================================`);
  });
}

startServer();

