-- ============================================================================
-- E-Commerce Management System - PostgreSQL Seed Data
-- 20 Categories, 20 Customers, 20 Products, 20 Orders, 30 Order Items, 20 Payments
-- ============================================================================

-- TRUNCATE ALL EXISTING DATA (CASCADE)
TRUNCATE order_items, payments, orders, products, customers, categories RESTART IDENTITY CASCADE;

-- 1. INSERT 20 CATEGORIES
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Mobiles & Accessories', 'Smartphones, cases, screen protectors, chargers, and power banks'),
(2, 'Laptops & Computers', 'Laptops, desktop PCs, keyboards, monitors, and computer peripherals'),
(3, 'Televisions', 'Smart TVs, LED screens, streaming devices, and home entertainment'),
(4, 'Home Appliances', 'Washing machines, refrigerators, microwaves, and air conditioners'),
(5, 'Kitchen Appliances', 'Mixer grinders, air fryers, toasters, and electric kettles'),
(6, 'Women''s Fashion', 'Ethnic wear, western wear, tops, kurtis, and accessories'),
(7, 'Men''s Fashion', 'Shirts, t-shirts, jeans, trousers, and ethnic clothing'),
(8, 'Footwear', 'Casual shoes, running sneakers, sandals, and formal leather footwear'),
(9, 'Groceries', 'Daily staples, pulses, grains, oils, and packaged foods'),
(10, 'Books', 'Fiction, non-fiction, biographies, academic textbooks, and literature'),
(11, 'Beauty & Personal Care', 'Skincare, hair care, cosmetics, and personal grooming products'),
(12, 'Sports & Fitness', 'Footballs, cricket gear, badminton rackets, and fitness equipment'),
(13, 'Toys & Games', 'Board games, educational puzzles, toy cars, and action figures'),
(14, 'Furniture', 'Study desks, ergonomic office chairs, wardrobes, and cabinets'),
(15, 'Health & Wellness', 'Nutritional supplements, immunity boosters, vitamins, and balms'),
(16, 'Stationery', 'Notebooks, writing pens, markers, desk organizers, and art supplies'),
(17, 'Audio & Headphones', 'Bluetooth headphones, true wireless earbuds, and speakers'),
(18, 'Cameras', 'DSLR cameras, mirrorless cameras, lenses, and photography gear'),
(19, 'Watches & Wearables', 'Analog watches, chronographs, and fitness smartwatches'),
(20, 'Bags & Luggage', 'Backpacks, travel duffel bags, suitcases, and laptop bags');

-- 2. INSERT 20 CUSTOMERS
INSERT INTO customers (customer_id, full_name, email, phone, city, state, registered_on) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@example.com', '9820012345', 'Mumbai', 'Maharashtra', '2026-01-10'),
(2, 'Ananya Patil', 'ananya.patil@example.com', '9820023456', 'Pune', 'Maharashtra', '2026-01-15'),
(3, 'Rohan Deshmukh', 'rohan.deshmukh@example.com', '9820034567', 'Nagpur', 'Maharashtra', '2026-01-20'),
(4, 'Isha Kulkarni', 'isha.kulkarni@example.com', '9820045678', 'Nashik', 'Maharashtra', '2026-02-01'),
(5, 'Advait Joshi', 'advait.joshi@example.com', '9820056789', 'Ahmedabad', 'Gujarat', '2026-02-10'),
(6, 'Neha Banerjee', 'neha.banerjee@example.com', '9820067890', 'Kolkata', 'West Bengal', '2026-02-14'),
(7, 'Vikram Singh', 'vikram.singh@example.com', '9820078901', 'Jaipur', 'Rajasthan', '2026-02-20'),
(8, 'Arjun Gupta', 'arjun.gupta@example.com', '9820089012', 'Delhi', 'Delhi', '2026-03-01'),
(9, 'Pooja Verma', 'pooja.verma@example.com', '9820090123', 'Lucknow', 'Uttar Pradesh', '2026-03-05'),
(10, 'Siddharth Rao', 'siddharth.rao@example.com', '9820101234', 'Bengaluru', 'Karnataka', '2026-03-12'),
(11, 'Rahul Pawar', 'rahul.pawar@example.com', '9820112345', 'Aurangabad', 'Maharashtra', '2026-03-18'),
(12, 'Priya Nair', 'priya.nair@example.com', '9820123456', 'Kochi', 'Kerala', '2026-03-25'),
(13, 'Rajesh Kulkarni', 'rajesh.k@example.com', '9820134567', 'Pune', 'Maharashtra', '2026-04-02'),
(14, 'Sneha Reddy', 'sneha.reddy@example.com', '9820145678', 'Hyderabad', 'Telangana', '2026-04-10'),
(15, 'Amit Trivedi', 'amit.trivedi@example.com', '9820156789', 'Surat', 'Gujarat', '2026-04-15'),
(16, 'Kavya Menon', 'kavya.menon@example.com', '9820167890', 'Thiruvananthapuram', 'Kerala', '2026-05-01'),
(17, 'Aditya Kapoor', 'aditya.kapoor@example.com', '9820178901', 'Chandigarh', 'Punjab', '2026-05-10'),
(18, 'Divya Shetty', 'divya.shetty@example.com', '9820189012', 'Mangaluru', 'Karnataka', '2026-05-20'),
(19, 'Nikhil Bhosale', 'nikhil.bhosale@example.com', '9820190123', 'Kolhapur', 'Maharashtra', '2026-06-01'),
(20, 'Tanvi Chaudhari', 'tanvi.chaudhari@example.com', '9820201234', 'Nagpur', 'Maharashtra', '2026-06-15');

-- 3. INSERT 20 PRODUCTS
-- Category 19 has 2 products; Category 20 has 0 products
INSERT INTO products (product_id, sku, product_name, brand, price, stock_qty, category_id, listed_on) VALUES
(1, 'MOB-REDMI-13', 'Redmi Note 13 5G (8GB/128GB)', 'Xiaomi', 17999.00, 50, 1, '2026-08-01'),
(2, 'LAP-HP-PAV15', 'HP Pavilion 15 Laptop (i5, 16GB)', 'HP', 62990.00, 20, 2, '2026-08-01'),
(3, 'TV-SAMS-43K', 'Samsung 43-inch Crystal 4K Smart TV', 'Samsung', 29990.00, 15, 3, '2026-08-05'),
(4, 'APP-LG-WASH7', 'LG 7 kg Front Load Washing Machine', 'LG', 34990.00, 12, 4, '2026-08-05'),
(5, 'KIT-PHIL-AF', 'Philips Air Fryer HD9200', 'Philips', 5999.00, 40, 5, '2026-08-10'),
(6, 'FAS-BIBA-KUR', 'Biba Cotton Printed Kurti', 'Biba', 1599.00, 90, 6, '2026-08-10'),
(7, 'FAS-LEVI-511', 'Levi''s Men''s Slim Fit Jeans', 'Levi''s', 2499.00, 60, 7, '2026-08-12'),
(8, 'FTW-NIKE-MN4', 'Nike Air Monarch IV Running Shoes', 'Nike', 4295.00, 45, 8, '2026-08-15'),
(9, 'GRO-TATA-DAL', 'Tata Sampann Toor Dal 1 kg', 'Tata Sampann', 185.00, 300, 9, '2026-08-15'),
(10, 'BOK-WINGS-FIRE', 'Wings of Fire (Autobiography)', 'Universities Press', 395.00, 150, 10, '2026-08-20'),
(11, 'BEA-NIV-SFT', 'Nivea Soft Light Moisturizer 200ml', 'Nivea', 299.00, 120, 11, '2026-08-20'),
(12, 'SPO-COS-BALL', 'Cosco Football Size 5', 'Cosco', 799.00, 80, 12, '2026-08-22'),
(13, 'TOY-FUN-MONO', 'Funskool Monopoly Board Game', 'Funskool', 699.00, 70, 13, '2026-08-25'),
(14, 'FUR-NIL-CAB', 'Nilkamal Freedom Plastic Storage Cabinet', 'Nilkamal', 4599.00, 25, 14, '2026-08-28'),
(15, 'HEA-DAB-CHY', 'Dabur Chyawanprash 1 kg', 'Dabur', 385.00, 140, 15, '2026-08-28'),
(16, 'STA-CLS-NB6', 'Classmate Notebook Pack of 6', 'Classmate', 360.00, 250, 16, '2026-09-01'),
(17, 'AUD-BOAT-450', 'boAt Rockerz 450 Bluetooth Headphones', 'boAt', 1499.00, 100, 17, '2026-09-01'),
(18, 'CAM-CAN-1500', 'Canon EOS 1500D DSLR Camera', 'Canon', 38995.00, 8, 18, '2026-09-05'),
(19, 'WAT-TIT-NEO', 'Titan Neo Analog Watch', 'Titan', 4995.00, 35, 19, '2026-09-05'),
(20, 'WAT-NOI-PUL', 'Noise ColorFit Pulse 3 Smartwatch', 'Noise', 1799.00, 75, 19, '2026-09-08');

-- 4. INSERT 20 ORDERS
-- Active Revenue: 2,20,290.00 | Cancelled: 36,790.00 (Orders 13 & 18) | Grand Total: 2,57,080.00
INSERT INTO orders (order_id, customer_id, order_date, delivery_date, order_status, shipping_city, total_amount) VALUES
(1, 1, '2026-09-15', '2026-09-19', 'Delivered', 'Mumbai', 19858.00),
(2, 2, '2026-09-16', '2026-09-20', 'Delivered', 'Pune', 62990.00),
(3, 3, '2026-09-18', '2026-09-22', 'Delivered', 'Nagpur', 6097.00),
(4, 4, '2026-09-19', '2026-09-23', 'Delivered', 'Nashik', 1617.00),
(5, 5, '2026-09-20', '2026-09-25', 'Delivered', 'Ahmedabad', 29990.00),
(6, 13, '2026-09-21', '2026-09-25', 'Delivered', 'Pune', 5999.00),
(7, 14, '2026-09-21', '2026-09-26', 'Delivered', 'Hyderabad', 2499.00),
(8, 15, '2026-09-22', '2026-09-26', 'Delivered', 'Surat', 1778.00),
(9, 7, '2026-10-01', NULL, 'Shipped', 'Jaipur', 38995.00),
(10, 15, '2026-10-02', '2026-10-07', 'Delivered', 'Surat', 4295.00),
(11, 1, '2026-09-22', '2026-09-27', 'Delivered', 'Mumbai', 1598.00),
(12, 3, '2026-10-02', NULL, 'Shipped', 'Nagpur', 998.00),
(13, 5, '2026-10-04', NULL, 'Cancelled', 'Ahmedabad', 34990.00),
(14, 8, '2026-10-08', NULL, 'Shipped', 'Delhi', 8999.00),
(15, 9, '2026-10-12', NULL, 'Placed', 'Lucknow', 2998.00),
(16, 10, '2026-10-13', NULL, 'Placed', 'Bengaluru', 17999.00),
(17, 2, '2026-10-14', NULL, 'Placed', 'Pune', 8297.00),
(18, 6, '2026-10-09', NULL, 'Cancelled', 'Kolkata', 1800.00),
(19, 11, '2026-10-10', NULL, 'Shipped', 'Aurangabad', 4898.00),
(20, 12, '2026-10-15', NULL, 'Placed', 'Kochi', 385.00);

-- 5. INSERT 30 ORDER_ITEMS
-- Resolves M:N relationship between orders and products.
-- Exactly matches section 8.7 top sellers:
-- Tata Sampann Toor Dal (Product 9): 4 units (Orders 4 [1] + 8 [3] = 4)
-- Wings of Fire (Product 10): 4 units (Orders 4 [2] + 12 [1] + 14 [1] = 4)
-- boAt Rockerz 450 (Product 17): 3 units (Orders 1 [1] + 15 [2] = 3)
-- Classmate Notebook (Product 16): 3 units (Orders 1 [1] + 4 [2] = 3)
-- Dabur Chyawanprash (Product 15): 3 units (Orders 8 [2] + 20 [1] = 3)
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES
-- Order 1: Aarav Sharma (3 items, total = 17999 + 1499 + 360 = 19,858.00)
(1, 1, 1, 1, 17999.00),
(2, 1, 17, 1, 1499.00),
(3, 1, 16, 1, 360.00),

-- Order 2: Ananya Patil (1 item, total = 62,990.00)
(4, 2, 2, 1, 62990.00),

-- Order 3: Rohan Deshmukh (2 items, total = 4599 + 1498 = 6,097.00)
(5, 3, 14, 1, 4599.00),
(6, 3, 12, 1, 1498.00),

-- Order 4: Isha Kulkarni (2 items: Wings of Fire 2 x 395 = 790, Classmate Notebook 2 x 413.50 = 827 -> total = 1,617.00)
(7, 4, 10, 2, 395.00),
(8, 4, 16, 2, 413.50),

-- Order 5: Advait Joshi (1 item, total = 29,990.00)
(9, 5, 3, 1, 29990.00),

-- Order 6: Rajesh Kulkarni (1 item, total = 5,999.00)
(10, 6, 5, 1, 5999.00),

-- Order 7: Sneha Reddy (1 item, total = 2,499.00)
(11, 7, 7, 1, 2499.00),

-- Order 8: Amit Trivedi (2 items: Toor Dal 3 x 185 = 555, Dabur Chyawanprash 2 x 611.50 = 1223 -> total = 1,778.00)
(12, 8, 9, 3, 185.00),
(13, 8, 15, 2, 611.50),

-- Order 9: Vikram Singh (1 item, total = 38,995.00)
(14, 9, 18, 1, 38995.00),

-- Order 10: Amit Trivedi (1 item, total = 4,295.00)
(15, 10, 8, 1, 4295.00),

-- Order 11: Aarav Sharma (1 item: Cosco Football 2 x 799 = 1,598.00)
(16, 11, 12, 2, 799.00),

-- Order 12: Rohan Deshmukh (2 items: Nivea Moisturizer 2 x 299 = 598, Wings of Fire 1 x 400 = 400 -> total = 998.00)
(17, 12, 11, 2, 299.00),
(18, 12, 10, 1, 400.00),

-- Order 13: Advait Joshi (1 item, total = 34,990.00, CANCELLED)
(19, 13, 4, 1, 34990.00),

-- Order 14: Arjun Gupta (2 items: Wings of Fire 1 x 395 = 395, Titan Neo Watch 1 x 8604 = 8604 -> total = 8,999.00)
(20, 14, 10, 1, 395.00),
(21, 14, 19, 1, 8604.00),

-- Order 15: Pooja Verma (1 item: boAt Rockerz 2 x 1499 = 2,998.00)
(22, 15, 17, 2, 1499.00),

-- Order 16: Siddharth Rao (1 item, total = 17,999.00)
(23, 16, 1, 1, 17999.00),

-- Order 17: Ananya Patil (2 items: Titan Neo Watch 1 x 4995 = 4995, Biba Kurti 2 x 1651 = 3302 -> total = 8,297.00)
(24, 17, 19, 1, 4995.00),
(25, 17, 6, 2, 1651.00),

-- Order 18: Neha Banerjee (1 item: Classmate Notebook 5 x 360 = 1,800.00, CANCELLED)
(26, 18, 16, 5, 360.00),

-- Order 19: Rahul Pawar (2 items: Biba Kurti 2 x 1599 = 3198, Noise ColorFit 1 x 1700 = 1700 -> total = 4,898.00)
(27, 19, 6, 2, 1599.00),
(28, 19, 20, 1, 1700.00),

-- Order 20: Priya Nair (2 items: Dabur Chyawanprash 1 x 200 = 200, Toor Dal 1 x 185 = 185 -> total = 385.00)
(29, 20, 15, 1, 200.00),
(30, 20, 9, 1, 185.00);

-- 6. INSERT 20 PAYMENTS
INSERT INTO payments (payment_id, order_id, payment_date, payment_method, amount, payment_status) VALUES
(1, 1, '2026-09-15', 'UPI', 19858.00, 'Paid'),
(2, 2, '2026-09-16', 'Credit Card', 62990.00, 'Paid'),
(3, 3, '2026-09-18', 'Debit Card', 6097.00, 'Paid'),
(4, 4, '2026-09-19', 'Cash on Delivery', 1617.00, 'Paid'),
(5, 5, '2026-09-20', 'Net Banking', 29990.00, 'Paid'),
(6, 6, '2026-09-21', 'Credit Card', 5999.00, 'Paid'),
(7, 7, '2026-09-21', 'UPI', 2499.00, 'Paid'),
(8, 8, '2026-09-22', 'Debit Card', 1778.00, 'Paid'),
(9, 9, '2026-10-01', 'Net Banking', 38995.00, 'Paid'),
(10, 10, '2026-10-02', 'UPI', 4295.00, 'Paid'),
(11, 11, '2026-09-22', 'UPI', 1598.00, 'Paid'),
(12, 12, '2026-10-02', 'Debit Card', 998.00, 'Pending'),
(13, 13, '2026-10-04', 'Net Banking', 34990.00, 'Refunded'),
(14, 14, '2026-10-08', 'Credit Card', 8999.00, 'Paid'),
(15, 15, '2026-10-12', 'UPI', 2998.00, 'Pending'),
(16, 16, '2026-10-13', 'Credit Card', 17999.00, 'Pending'),
(17, 17, '2026-10-14', 'Net Banking', 8297.00, 'Pending'),
(18, 18, '2026-10-09', 'UPI', 1800.00, 'Failed'),
(19, 19, '2026-10-10', 'Debit Card', 4898.00, 'Paid'),
(20, 20, '2026-10-15', 'Cash on Delivery', 385.00, 'Pending');

-- SYNCHRONIZE PRIMARY KEY SEQUENCES WITH EXISTING MAX IDS
SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));
SELECT setval('customers_customer_id_seq', (SELECT MAX(customer_id) FROM customers));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));
SELECT setval('order_items_order_item_id_seq', (SELECT MAX(order_item_id) FROM order_items));
SELECT setval('payments_payment_id_seq', (SELECT MAX(payment_id) FROM payments));

