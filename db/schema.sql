-- ============================================================================
-- E-Commerce Management System - PostgreSQL Relational Database Schema
-- Student: Vedant V Chaudhari (UID: 24010011)
-- College: St. Vincent Pallotti College of Engineering & Technology
-- Department of Information Technology | Subject: DBMS (24IT501T)
-- Faculty: Prof. Jayant S Rohankar
-- Database: vedantchaudhari_ecommerce
-- ============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    description   VARCHAR(250)
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    customer_id   SERIAL PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(15)  UNIQUE,
    city          VARCHAR(60)  NOT NULL,
    state         VARCHAR(60)  NOT NULL,
    registered_on DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    product_id   SERIAL PRIMARY KEY,
    sku          VARCHAR(20)  NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    brand        VARCHAR(80),
    price        DECIMAL(10,2) NOT NULL,
    stock_qty    INT NOT NULL,
    category_id  INT NOT NULL,
    listed_on    DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT chk_products_price CHECK (price > 0),
    CONSTRAINT chk_products_stock CHECK (stock_qty >= 0),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    order_id      SERIAL PRIMARY KEY,
    customer_id   INT NOT NULL,
    order_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    order_status  VARCHAR(12) NOT NULL,
    shipping_city VARCHAR(60) NOT NULL,
    total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT chk_orders_status
        CHECK (order_status IN ('Placed','Shipped','Delivered','Cancelled')),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0),
    CONSTRAINT chk_orders_dates
        CHECK (delivery_date IS NULL OR delivery_date >= order_date),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

-- 5. ORDER_ITEMS TABLE (Associative entity resolving M:N between orders & products)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id      INT NOT NULL,
    product_id    INT NOT NULL,
    quantity      INT NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    CONSTRAINT uq_order_product UNIQUE (order_id, product_id),
    CONSTRAINT chk_items_qty   CHECK (quantity > 0),
    CONSTRAINT chk_items_price CHECK (unit_price > 0),
    CONSTRAINT fk_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    payment_id     SERIAL PRIMARY KEY,
    order_id       INT NOT NULL,
    payment_date   DATE,
    payment_method VARCHAR(20) NOT NULL,
    amount         DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(10) NOT NULL,
    CONSTRAINT chk_pay_method CHECK (payment_method IN
        ('UPI','Credit Card','Debit Card','Net Banking','Cash on Delivery')),
    CONSTRAINT chk_pay_amount CHECK (amount > 0),
    CONSTRAINT chk_pay_status CHECK (payment_status IN
        ('Paid','Pending','Failed','Refunded')),
    CONSTRAINT fk_pay_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- 7. ORDER SUMMARY VIEW
CREATE OR REPLACE VIEW v_order_summary AS
SELECT o.order_id, c.full_name, o.order_date, o.order_status,
       COUNT(oi.order_item_id) AS line_items,
       o.total_amount, p.payment_method, p.payment_status
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.order_id
LEFT JOIN payments p ON p.order_id = o.order_id
GROUP BY o.order_id, c.full_name, o.order_date, o.order_status,
         o.total_amount, p.payment_method, p.payment_status;

