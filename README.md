# 🛍️ E-Commerce Management System (DBMS Case Study)

> **College:** St. Vincent Pallotti College of Engineering & Technology, Nagpur  
> **Department:** Department of Information Technology  
> **Course:** Database Management Systems (24IT501T) | Session 2026-27 (Semester V)  
> **Student:** **Vedant V Chaudhari** (UID: `24010011`)  
> **Faculty:** **Prof. Jayant S Rohankar**, Course Faculty  
> **Database:** **PostgreSQL** (Cloud Native &bull; ACID Compliant)  
> **Web Stack:** Node.js, Express, EJS, PostgreSQL (`pg`), CSS3  

---

## 🚀 Cloud Deployment Guide (No Local Setup Required!)

This project is built from the ground up for **100% Cloud Deployment**. You do not need to install MySQL, PostgreSQL, or any database software on your computer.

### Step 1: Create Free Cloud PostgreSQL Database (Neon.tech) — 30 Seconds

1. Go to **[Neon.tech](https://neon.tech)** and sign up for a free account (no credit card needed).
2. Click **Create Project**, name it `vedantchaudhari_ecommerce`, and select the region closest to you.
3. On the dashboard, copy your **Connection Details** string:
   ```text
   postgresql://neondb_owner:npg_xxxxxx@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **That's it!** You don't even need to run SQL files manually: when the web server boots up, it **automatically detects the database, creates all 6 tables, 4 indexes, and the `v_order_summary` view, and seeds all 20+ case study records**!

---

### Step 2: Deploy the Web Application to Cloud (Render.com) — Free

1. Push this project folder to your **GitHub** account.
2. Sign up / Log in to **[Render.com](https://render.com)** (Free Tier).
3. Click **New +** &rarr; **Web Service**.
4. Connect your GitHub repository.
5. In the configuration:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
6. Under **Environment Variables**, add:
   - **Key:** `DATABASE_URL`
   - **Value:** *(Paste your Neon.tech connection string from Step 1)*
7. Click **Deploy Web Service**.

Render will deploy your website in ~2 minutes with a live public URL:
`https://vedant-ecommerce-dbms.onrender.com`

---

## 🌟 Key DBMS Features & Case Study Highlights

| Feature | Implementation | Case Study Section |
| :--- | :--- | :--- |
| **Relational Schema** | 6 normalized tables (`categories`, `customers`, `products`, `orders`, `order_items`, `payments`) | Section 4 & 5 |
| **M:N Associative Table** | `order_items` resolves Many-to-Many relationship between `orders` and `products` with `UNIQUE(order_id, product_id)` | Section 2 & 4 |
| **Integrity Constraints** | Primary Keys, Foreign Keys, `CHECK(price > 0)`, `CHECK(stock_qty >= 0)`, `CHECK(quantity > 0)`, `CHECK(unit_price > 0)`, `CHECK(order_status IN (...))` | Section 5 & 10 |
| **Database View** | `v_order_summary` dynamically joins orders, customer full names, line items count, and payment info | Section 8.8 |
| **ACID Transactions** | Real atomic order checkout with row locking (`FOR UPDATE`), inventory deduction, and rollback safety | Section 8.10 |
| **Lab Query Runner** | Interactive real-time runner for all Case Study queries (8.1 through 8.9) with live data table rendering | Section 8.1 - 8.9 |
| **Auto-Migration** | Automatic DDL execution & 20-row case study dataset seeding on first cloud connection | Section 7 |

---

## 📐 Relational Database Schema (PostgreSQL)

```
+------------------+          1:M          +--------------------+
|    CATEGORIES    | --------------------> |      PRODUCTS      |
|------------------|                       |--------------------|
| PK category_id   |                       | PK product_id      |
| UQ category_name |                       | UQ sku             |
|    description   |                       |    product_name    |
+------------------+                       |    brand           |
                                           |    price           |
                                           |    stock_qty       |
                                           | FK category_id     |
                                           +--------------------+
                                                     |
                                                     | 1:M
                                                     v
+------------------+          1:M          +--------------------+
|    CUSTOMERS     | --------------------> |    ORDER_ITEMS     |
|------------------|                       |--------------------|
| PK customer_id   |                       | PK order_item_id   |
| UQ email, phone  |                       | FK order_id        |
|    full_name     |                       | FK product_id      |
|    city, state   |                       | UQ (order, product)|
|    registered_on |                       |    quantity        |
+------------------+                       |    unit_price      |
        |                                  +--------------------+
        | 1:M                                        ^
        v                                            |
+------------------+          1:M                    |
|      ORDERS      | --------------------------------+
|------------------|
| PK order_id      |          1:M          +--------------------+
| FK customer_id   | --------------------> |      PAYMENTS      |
|    order_date    |                       |--------------------|
|    delivery_date |                       | PK payment_id      |
|    order_status  |                       | FK order_id        |
|    shipping_city |                       |    payment_date    |
|    total_amount  |                       |    payment_method  |
+------------------+                       |    amount          |
                                           |    payment_status  |
                                           +--------------------+
```

---

## 🔬 Case Study SQL Queries (Section 8)

The web portal includes an interactive **SQL Lab** where faculty and evaluators can click to run any query live on the cloud database:

1. **8.1 Display All Products:** `SELECT product_id, product_name, brand, price, stock_qty FROM products ORDER BY product_id;`
2. **8.2 JOIN Products with Categories:** `SELECT p.product_name, p.brand, c.category_name FROM products p JOIN categories c ON c.category_id = p.category_id;`
3. **8.3 Orders Placed or Shipped:** `SELECT o.order_id, c.full_name, o.order_date, o.order_status, o.total_amount FROM orders o JOIN customers c USING (customer_id) WHERE o.order_status IN ('Placed', 'Shipped');`
4. **8.4 Category Product Count (LEFT JOIN):** Shows `Bags & Luggage = 0` demonstrating `LEFT JOIN` preservation.
5. **8.5 Customers with Cancelled Orders (Subquery):** Subquery filtering customers with `order_status = 'Cancelled'`.
6. **8.6 Total Active Revenue:** Sum of `total_amount` excluding cancelled orders = **₹2,20,290.00** (Total with cancelled: **₹2,57,080.00**).
7. **8.7 Top 5 Selling Products:** Aggregates `quantity` sold across non-cancelled orders using `JOIN`, `GROUP BY`, and `LIMIT 5`.
8. **8.8 Order Summary View:** Queries relational view `v_order_summary`.
9. **8.9 Customers with No Orders:** Subquery with `NOT IN` showing IDs 16 to 20.
10. **8.10 ACID Transaction Demo:** Steps through `BEGIN` &rarr; Insert Order & Item &rarr; Stock reduced to 99 &rarr; `ROLLBACK` &rarr; Stock restored to 100.

---

## 💻 Optional: Running Locally (For Local Testing)

If you wish to run the app on your computer:

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set your Cloud PostgreSQL URL in .env or run directly in demo mode
# DATABASE_URL=postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require

# 3. Start web server
npm start
```
Then visit `http://localhost:3000` in your browser.

---

## 📁 Project File Structure

```text
dbms-website/
├── db/
│   ├── schema.sql           # PostgreSQL DDL (6 tables, 4 indexes, v_order_summary view)
│   ├── seed.sql             # PostgreSQL DML (20 categories, 20 customers, 20 products, 20 orders, 30 items, 20 payments)
│   └── index.js             # Connection pool, auto-migrator, and transaction runner
├── public/
│   ├── css/
│   │   └── style.css        # Academic & modern responsive styling
│   └── js/
│       └── app.js           # Client-side modals, query runner, live calculations
├── views/
│   ├── index.ejs            # Complete portal (Dashboard, Catalogue, Orders, Customers, SQL Lab, ER Model, Cloud Deploy)
│   ├── error.ejs            # Friendly diagnostic error template
│   └── partials/
│       ├── header.ejs       # Academic banner, navigation tabs, cloud status pill
│       └── footer.ejs       # Student & faculty attribution, academic metadata
├── tests/
│   └── verify.js            # Automated verification test suite
├── render.yaml              # Render Blueprint for 1-click cloud deployment
├── Dockerfile               # Container build configuration for cloud platforms
├── vercel.json              # Vercel deployment configuration
├── Procfile                 # Process file for Heroku / Railway / Render
├── .env.example             # Example environment variables
├── package.json             # NPM dependencies & start scripts
└── README.md                # Comprehensive documentation
```

---
**Submitted by:** Vedant V Chaudhari (UID: `24010011`)  
**Submitted to:** Prof. Jayant S Rohankar, Department of Information Technology  
**College:** St. Vincent Pallotti College of Engineering & Technology, Nagpur

