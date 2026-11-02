4const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let pool = null;
let isConnected = false;
let connectionInfo = {
  type: 'none',
  host: null,
  database: null,
  user: null,
  ssl: false,
  error: null,
};

// In-memory mock storage fallback when no PostgreSQL instance is configured yet
let mockData = null;

function loadMockData() {
  const schemaFile = path.join(__dirname, 'seed.sql');
  // Initialize mock dataset with case study values
  mockData = {
    categories: [
      { category_id: 1, category_name: 'Mobiles & Accessories', description: 'Smartphones, cases, screen protectors, chargers, and power banks' },
      { category_id: 2, category_name: 'Laptops & Computers', description: 'Laptops, desktop PCs, keyboards, monitors, and computer peripherals' },
      { category_id: 3, category_name: 'Televisions', description: 'Smart TVs, LED screens, streaming devices, and home entertainment' },
      { category_id: 4, category_name: 'Home Appliances', description: 'Washing machines, refrigerators, microwaves, and air conditioners' },
      { category_id: 5, category_name: 'Kitchen Appliances', description: 'Mixer grinders, air fryers, toasters, and electric kettles' },
      { category_id: 6, category_name: 'Women\'s Fashion', description: 'Ethnic wear, western wear, tops, kurtis, and accessories' },
      { category_id: 7, category_name: 'Men\'s Fashion', description: 'Shirts, t-shirts, jeans, trousers, and ethnic clothing' },
      { category_id: 8, category_name: 'Footwear', description: 'Casual shoes, running sneakers, sandals, and formal leather footwear' },
      { category_id: 9, category_name: 'Groceries', description: 'Daily staples, pulses, grains, oils, and packaged foods' },
      { category_id: 10, category_name: 'Books', description: 'Fiction, non-fiction, biographies, academic textbooks, and literature' },
      { category_id: 11, category_name: 'Beauty & Personal Care', description: 'Skincare, hair care, cosmetics, and personal grooming products' },
      { category_id: 12, category_name: 'Sports & Fitness', description: 'Footballs, cricket gear, badminton rackets, and fitness equipment' },
      { category_id: 13, category_name: 'Toys & Games', description: 'Board games, educational puzzles, toy cars, and action figures' },
      { category_id: 14, category_name: 'Furniture', description: 'Study desks, ergonomic office chairs, wardrobes, and cabinets' },
      { category_id: 15, category_name: 'Health & Wellness', description: 'Nutritional supplements, immunity boosters, vitamins, and balms' },
      { category_id: 16, category_name: 'Stationery', description: 'Notebooks, writing pens, markers, desk organizers, and art supplies' },
      { category_id: 17, category_name: 'Audio & Headphones', description: 'Bluetooth headphones, true wireless earbuds, and speakers' },
      { category_id: 18, category_name: 'Cameras', description: 'DSLR cameras, mirrorless cameras, lenses, and photography gear' },
      { category_id: 19, category_name: 'Watches & Wearables', description: 'Analog watches, chronographs, and fitness smartwatches' },
      { category_id: 20, category_name: 'Bags & Luggage', description: 'Backpacks, travel duffel bags, suitcases, and laptop bags' }
    ],
    customers: [
      { customer_id: 1, full_name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '9820012345', city: 'Mumbai', state: 'Maharashtra', registered_on: '2026-01-10' },
      { customer_id: 2, full_name: 'Ananya Patil', email: 'ananya.patil@example.com', phone: '9820023456', city: 'Pune', state: 'Maharashtra', registered_on: '2026-01-15' },
      { customer_id: 3, full_name: 'Rohan Deshmukh', email: 'rohan.deshmukh@example.com', phone: '9820034567', city: 'Nagpur', state: 'Maharashtra', registered_on: '2026-01-20' },
      { customer_id: 4, full_name: 'Isha Kulkarni', email: 'isha.kulkarni@example.com', phone: '9820045678', city: 'Nashik', state: 'Maharashtra', registered_on: '2026-02-01' },
      { customer_id: 5, full_name: 'Advait Joshi', email: 'advait.joshi@example.com', phone: '9820056789', city: 'Ahmedabad', state: 'Gujarat', registered_on: '2026-02-10' },
      { customer_id: 6, full_name: 'Neha Banerjee', email: 'neha.banerjee@example.com', phone: '9820067890', city: 'Kolkata', state: 'West Bengal', registered_on: '2026-02-14' },
      { customer_id: 7, full_name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '9820078901', city: 'Jaipur', state: 'Rajasthan', registered_on: '2026-02-20' },
      { customer_id: 8, full_name: 'Arjun Gupta', email: 'arjun.gupta@example.com', phone: '9820089012', city: 'Delhi', state: 'Delhi', registered_on: '2026-03-01' },
      { customer_id: 9, full_name: 'Pooja Verma', email: 'pooja.verma@example.com', phone: '9820090123', city: 'Lucknow', state: 'Uttar Pradesh', registered_on: '2026-03-05' },
      { customer_id: 10, full_name: 'Siddharth Rao', email: 'siddharth.rao@example.com', phone: '9820101234', city: 'Bengaluru', state: 'Karnataka', registered_on: '2026-03-12' },
      { customer_id: 11, full_name: 'Rahul Pawar', email: 'rahul.pawar@example.com', phone: '9820112345', city: 'Aurangabad', state: 'Maharashtra', registered_on: '2026-03-18' },
      { customer_id: 12, full_name: 'Priya Nair', email: 'priya.nair@example.com', phone: '9820123456', city: 'Kochi', state: 'Kerala', registered_on: '2026-03-25' },
      { customer_id: 13, full_name: 'Rajesh Kulkarni', email: 'rajesh.k@example.com', phone: '9820134567', city: 'Pune', state: 'Maharashtra', registered_on: '2026-04-02' },
      { customer_id: 14, full_name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '9820145678', city: 'Hyderabad', state: 'Telangana', registered_on: '2026-04-10' },
      { customer_id: 15, full_name: 'Amit Trivedi', email: 'amit.trivedi@example.com', phone: '9820156789', city: 'Surat', state: 'Gujarat', registered_on: '2026-04-15' },
      { customer_id: 16, full_name: 'Kavya Menon', email: 'kavya.menon@example.com', phone: '9820167890', city: 'Thiruvananthapuram', state: 'Kerala', registered_on: '2026-05-01' },
      { customer_id: 17, full_name: 'Aditya Kapoor', email: 'aditya.kapoor@example.com', phone: '9820178901', city: 'Chandigarh', state: 'Punjab', registered_on: '2026-05-10' },
      { customer_id: 18, full_name: 'Divya Shetty', email: 'divya.shetty@example.com', phone: '9820189012', city: 'Mangaluru', state: 'Karnataka', registered_on: '2026-05-20' },
      { customer_id: 19, full_name: 'Nikhil Bhosale', email: 'nikhil.bhosale@example.com', phone: '9820190123', city: 'Kolhapur', state: 'Maharashtra', registered_on: '2026-06-01' },
      { customer_id: 20, full_name: 'Tanvi Chaudhari', email: 'tanvi.chaudhari@example.com', phone: '9820201234', city: 'Nagpur', state: 'Maharashtra', registered_on: '2026-06-15' }
    ],
    products: [
      { product_id: 1, sku: 'MOB-REDMI-13', product_name: 'Redmi Note 13 5G (8GB/128GB)', brand: 'Xiaomi', price: 17999.00, stock_qty: 50, category_id: 1, category_name: 'Mobiles & Accessories', listed_on: '2026-08-01' },
      { product_id: 2, sku: 'LAP-HP-PAV15', product_name: 'HP Pavilion 15 Laptop (i5, 16GB)', brand: 'HP', price: 62990.00, stock_qty: 20, category_id: 2, category_name: 'Laptops & Computers', listed_on: '2026-08-01' },
      { product_id: 3, sku: 'TV-SAMS-43K', product_name: 'Samsung 43-inch Crystal 4K Smart TV', brand: 'Samsung', price: 29990.00, stock_qty: 15, category_id: 3, category_name: 'Televisions', listed_on: '2026-08-05' },
      { product_id: 4, sku: 'APP-LG-WASH7', product_name: 'LG 7 kg Front Load Washing Machine', brand: 'LG', price: 34990.00, stock_qty: 12, category_id: 4, category_name: 'Home Appliances', listed_on: '2026-08-05' },
      { product_id: 5, sku: 'KIT-PHIL-AF', product_name: 'Philips Air Fryer HD9200', brand: 'Philips', price: 5999.00, stock_qty: 40, category_id: 5, category_name: 'Kitchen Appliances', listed_on: '2026-08-10' },
      { product_id: 6, sku: 'FAS-BIBA-KUR', product_name: 'Biba Cotton Printed Kurti', brand: 'Biba', price: 1599.00, stock_qty: 90, category_id: 6, category_name: 'Women\'s Fashion', listed_on: '2026-08-10' },
      { product_id: 7, sku: 'FAS-LEVI-511', product_name: 'Levi\'s Men\'s Slim Fit Jeans', brand: 'Levi\'s', price: 2499.00, stock_qty: 60, category_id: 7, category_name: 'Men\'s Fashion', listed_on: '2026-08-12' },
      { product_id: 8, sku: 'FTW-NIKE-MN4', product_name: 'Nike Air Monarch IV Running Shoes', brand: 'Nike', price: 4295.00, stock_qty: 45, category_id: 8, category_name: 'Footwear', listed_on: '2026-08-15' },
      { product_id: 9, sku: 'GRO-TATA-DAL', product_name: 'Tata Sampann Toor Dal 1 kg', brand: 'Tata Sampann', price: 185.00, stock_qty: 300, category_id: 9, category_name: 'Groceries', listed_on: '2026-08-15' },
      { product_id: 10, sku: 'BOK-WINGS-FIRE', product_name: 'Wings of Fire (Autobiography)', brand: 'Universities Press', price: 395.00, stock_qty: 150, category_id: 10, category_name: 'Books', listed_on: '2026-08-20' },
      { product_id: 11, sku: 'BEA-NIV-SFT', product_name: 'Nivea Soft Light Moisturizer 200ml', brand: 'Nivea', price: 299.00, stock_qty: 120, category_id: 11, category_name: 'Beauty & Personal Care', listed_on: '2026-08-20' },
      { product_id: 12, sku: 'SPO-COS-BALL', product_name: 'Cosco Football Size 5', brand: 'Cosco', price: 799.00, stock_qty: 80, category_id: 12, category_name: 'Sports & Fitness', listed_on: '2026-08-22' },
      { product_id: 13, sku: 'TOY-FUN-MONO', product_name: 'Funskool Monopoly Board Game', brand: 'Funskool', price: 699.00, stock_qty: 70, category_id: 13, category_name: 'Toys & Games', listed_on: '2026-08-25' },
      { product_id: 14, sku: 'FUR-NIL-CAB', product_name: 'Nilkamal Freedom Plastic Storage Cabinet', brand: 'Nilkamal', price: 4599.00, stock_qty: 25, category_id: 14, category_name: 'Furniture', listed_on: '2026-08-28' },
      { product_id: 15, sku: 'HEA-DAB-CHY', product_name: 'Dabur Chyawanprash 1 kg', brand: 'Dabur', price: 385.00, stock_qty: 140, category_id: 15, category_name: 'Health & Wellness', listed_on: '2026-08-28' },
      { product_id: 16, sku: 'STA-CLS-NB6', product_name: 'Classmate Notebook Pack of 6', brand: 'Classmate', price: 360.00, stock_qty: 250, category_id: 16, category_name: 'Stationery', listed_on: '2026-09-01' },
      { product_id: 17, sku: 'AUD-BOAT-450', product_name: 'boAt Rockerz 450 Bluetooth Headphones', brand: 'boAt', price: 1499.00, stock_qty: 100, category_id: 17, category_name: 'Audio & Headphones', listed_on: '2026-09-01' },
      { product_id: 18, sku: 'CAM-CAN-1500', product_name: 'Canon EOS 1500D DSLR Camera', brand: 'Canon', price: 38995.00, stock_qty: 8, category_id: 18, category_name: 'Cameras', listed_on: '2026-09-05' },
      { product_id: 19, sku: 'WAT-TIT-NEO', product_name: 'Titan Neo Analog Watch', brand: 'Titan', price: 4995.00, stock_qty: 35, category_id: 19, category_name: 'Watches & Wearables', listed_on: '2026-09-05' },
      { product_id: 20, sku: 'WAT-NOI-PUL', product_name: 'Noise ColorFit Pulse 3 Smartwatch', brand: 'Noise', price: 1799.00, stock_qty: 75, category_id: 19, category_name: 'Watches & Wearables', listed_on: '2026-09-08' }
    ],
    orders: [
      { order_id: 1, customer_id: 1, full_name: 'Aarav Sharma', order_date: '2026-09-15', delivery_date: '2026-09-19', order_status: 'Delivered', shipping_city: 'Mumbai', total_amount: 19858.00, line_items: 3, payment_method: 'UPI', payment_status: 'Paid' },
      { order_id: 2, customer_id: 2, full_name: 'Ananya Patil', order_date: '2026-09-16', delivery_date: '2026-09-20', order_status: 'Delivered', shipping_city: 'Pune', total_amount: 62990.00, line_items: 1, payment_method: 'Credit Card', payment_status: 'Paid' },
      { order_id: 3, customer_id: 3, full_name: 'Rohan Deshmukh', order_date: '2026-09-18', delivery_date: '2026-09-22', order_status: 'Delivered', shipping_city: 'Nagpur', total_amount: 6097.00, line_items: 2, payment_method: 'Debit Card', payment_status: 'Paid' },
      { order_id: 4, customer_id: 4, full_name: 'Isha Kulkarni', order_date: '2026-09-19', delivery_date: '2026-09-23', order_status: 'Delivered', shipping_city: 'Nashik', total_amount: 1617.00, line_items: 2, payment_method: 'Cash on Delivery', payment_status: 'Paid' },
      { order_id: 5, customer_id: 5, full_name: 'Advait Joshi', order_date: '2026-09-20', delivery_date: '2026-09-25', order_status: 'Delivered', shipping_city: 'Ahmedabad', total_amount: 29990.00, line_items: 1, payment_method: 'Net Banking', payment_status: 'Paid' },
      { order_id: 6, customer_id: 13, full_name: 'Rajesh Kulkarni', order_date: '2026-09-21', delivery_date: '2026-09-25', order_status: 'Delivered', shipping_city: 'Pune', total_amount: 5999.00, line_items: 1, payment_method: 'Credit Card', payment_status: 'Paid' },
      { order_id: 7, customer_id: 14, full_name: 'Sneha Reddy', order_date: '2026-09-21', delivery_date: '2026-09-26', order_status: 'Delivered', shipping_city: 'Hyderabad', total_amount: 2499.00, line_items: 1, payment_method: 'UPI', payment_status: 'Paid' },
      { order_id: 8, customer_id: 15, full_name: 'Amit Trivedi', order_date: '2026-09-22', delivery_date: '2026-09-26', order_status: 'Delivered', shipping_city: 'Surat', total_amount: 1778.00, line_items: 2, payment_method: 'Debit Card', payment_status: 'Paid' },
      { order_id: 9, customer_id: 7, full_name: 'Vikram Singh', order_date: '2026-10-01', delivery_date: null, order_status: 'Shipped', shipping_city: 'Jaipur', total_amount: 38995.00, line_items: 1, payment_method: 'Net Banking', payment_status: 'Paid' },
      { order_id: 10, customer_id: 15, full_name: 'Amit Trivedi', order_date: '2026-10-02', delivery_date: '2026-10-07', order_status: 'Delivered', shipping_city: 'Surat', total_amount: 4295.00, line_items: 1, payment_method: 'UPI', payment_status: 'Paid' },
      { order_id: 11, customer_id: 1, full_name: 'Aarav Sharma', order_date: '2026-09-22', delivery_date: '2026-09-27', order_status: 'Delivered', shipping_city: 'Mumbai', total_amount: 1598.00, line_items: 1, payment_method: 'UPI', payment_status: 'Paid' },
      { order_id: 12, customer_id: 3, full_name: 'Rohan Deshmukh', order_date: '2026-10-02', delivery_date: null, order_status: 'Shipped', shipping_city: 'Nagpur', total_amount: 998.00, line_items: 2, payment_method: 'Debit Card', payment_status: 'Pending' },
      { order_id: 13, customer_id: 5, full_name: 'Advait Joshi', order_date: '2026-10-04', delivery_date: null, order_status: 'Cancelled', shipping_city: 'Ahmedabad', total_amount: 34990.00, line_items: 1, payment_method: 'Net Banking', payment_status: 'Refunded' },
      { order_id: 14, customer_id: 8, full_name: 'Arjun Gupta', order_date: '2026-10-08', delivery_date: null, order_status: 'Shipped', shipping_city: 'Delhi', total_amount: 8999.00, line_items: 2, payment_method: 'Credit Card', payment_status: 'Paid' },
      { order_id: 15, customer_id: 9, full_name: 'Pooja Verma', order_date: '2026-10-12', delivery_date: null, order_status: 'Placed', shipping_city: 'Lucknow', total_amount: 2998.00, line_items: 1, payment_method: 'UPI', payment_status: 'Pending' },
      { order_id: 16, customer_id: 10, full_name: 'Siddharth Rao', order_date: '2026-10-13', delivery_date: null, order_status: 'Placed', shipping_city: 'Bengaluru', total_amount: 17999.00, line_items: 1, payment_method: 'Credit Card', payment_status: 'Pending' },
      { order_id: 17, customer_id: 2, full_name: 'Ananya Patil', order_date: '2026-10-14', delivery_date: null, order_status: 'Placed', shipping_city: 'Pune', total_amount: 8297.00, line_items: 2, payment_method: 'Net Banking', payment_status: 'Pending' },
      { order_id: 18, customer_id: 6, full_name: 'Neha Banerjee', order_date: '2026-10-09', delivery_date: null, order_status: 'Cancelled', shipping_city: 'Kolkata', total_amount: 1800.00, line_items: 1, payment_method: 'UPI', payment_status: 'Failed' },
      { order_id: 19, customer_id: 11, full_name: 'Rahul Pawar', order_date: '2026-10-10', delivery_date: null, order_status: 'Shipped', shipping_city: 'Aurangabad', total_amount: 4898.00, line_items: 2, payment_method: 'Debit Card', payment_status: 'Paid' },
      { order_id: 20, customer_id: 12, full_name: 'Priya Nair', order_date: '2026-10-15', delivery_date: null, order_status: 'Placed', shipping_city: 'Kochi', total_amount: 385.00, line_items: 2, payment_method: 'Cash on Delivery', payment_status: 'Pending' }
    ],
    order_items: [
      { order_item_id: 1, order_id: 1, product_id: 1, quantity: 1, unit_price: 17999.00, line_total: 17999.00, product_name: 'Redmi Note 13 5G (8GB/128GB)', sku: 'MOB-REDMI-13', brand: 'Xiaomi', category_name: 'Mobiles & Accessories' },
      { order_item_id: 2, order_id: 1, product_id: 17, quantity: 1, unit_price: 1499.00, line_total: 1499.00, product_name: 'boAt Rockerz 450 Bluetooth Headphones', sku: 'AUD-BOAT-450', brand: 'boAt', category_name: 'Audio & Headphones' },
      { order_item_id: 3, order_id: 1, product_id: 16, quantity: 1, unit_price: 360.00, line_total: 360.00, product_name: 'Classmate Notebook Pack of 6', sku: 'STA-CLS-NB6', brand: 'Classmate', category_name: 'Stationery' },
      { order_item_id: 4, order_id: 2, product_id: 2, quantity: 1, unit_price: 62990.00, line_total: 62990.00, product_name: 'HP Pavilion 15 Laptop (i5, 16GB)', sku: 'LAP-HP-PAV15', brand: 'HP', category_name: 'Laptops & Computers' },
      { order_item_id: 5, order_id: 3, product_id: 14, quantity: 1, unit_price: 4599.00, line_total: 4599.00, product_name: 'Nilkamal Freedom Plastic Storage Cabinet', sku: 'FUR-NIL-CAB', brand: 'Nilkamal', category_name: 'Furniture' },
      { order_item_id: 6, order_id: 3, product_id: 12, quantity: 1, unit_price: 1498.00, line_total: 1498.00, product_name: 'Cosco Football Size 5', sku: 'SPO-COS-BALL', brand: 'Cosco', category_name: 'Sports & Fitness' },
      { order_item_id: 7, order_id: 4, product_id: 10, quantity: 2, unit_price: 395.00, line_total: 790.00, product_name: 'Wings of Fire (Autobiography)', sku: 'BOK-WINGS-FIRE', brand: 'Universities Press', category_name: 'Books' },
      { order_item_id: 8, order_id: 4, product_id: 16, quantity: 2, unit_price: 413.50, line_total: 827.00, product_name: 'Classmate Notebook Pack of 6', sku: 'STA-CLS-NB6', brand: 'Classmate', category_name: 'Stationery' },
      { order_item_id: 9, order_id: 5, product_id: 3, quantity: 1, unit_price: 29990.00, line_total: 29990.00, product_name: 'Samsung 43-inch Crystal 4K Smart TV', sku: 'TV-SAMS-43K', brand: 'Samsung', category_name: 'Televisions' },
      { order_item_id: 10, order_id: 6, product_id: 5, quantity: 1, unit_price: 5999.00, line_total: 5999.00, product_name: 'Philips Air Fryer HD9200', sku: 'KIT-PHIL-AF', brand: 'Philips', category_name: 'Kitchen Appliances' },
      { order_item_id: 11, order_id: 7, product_id: 7, quantity: 1, unit_price: 2499.00, line_total: 2499.00, product_name: 'Levi\'s Men\'s Slim Fit Jeans', sku: 'FAS-LEVI-511', brand: 'Levi\'s', category_name: 'Men\'s Fashion' },
      { order_item_id: 12, order_id: 8, product_id: 9, quantity: 3, unit_price: 185.00, line_total: 555.00, product_name: 'Tata Sampann Toor Dal 1 kg', sku: 'GRO-TATA-DAL', brand: 'Tata Sampann', category_name: 'Groceries' },
      { order_item_id: 13, order_id: 8, product_id: 15, quantity: 2, unit_price: 611.50, line_total: 1223.00, product_name: 'Dabur Chyawanprash 1 kg', sku: 'HEA-DAB-CHY', brand: 'Dabur', category_name: 'Health & Wellness' },
      { order_item_id: 14, order_id: 9, product_id: 18, quantity: 1, unit_price: 38995.00, line_total: 38995.00, product_name: 'Canon EOS 1500D DSLR Camera', sku: 'CAM-CAN-1500', brand: 'Canon', category_name: 'Cameras' },
      { order_item_id: 15, order_id: 10, product_id: 8, quantity: 1, unit_price: 4295.00, line_total: 4295.00, product_name: 'Nike Air Monarch IV Running Shoes', sku: 'FTW-NIKE-MN4', brand: 'Nike', category_name: 'Footwear' },
      { order_item_id: 16, order_id: 11, product_id: 12, quantity: 2, unit_price: 799.00, line_total: 1598.00, product_name: 'Cosco Football Size 5', sku: 'SPO-COS-BALL', brand: 'Cosco', category_name: 'Sports & Fitness' },
      { order_item_id: 17, order_id: 12, product_id: 11, quantity: 2, unit_price: 299.00, line_total: 598.00, product_name: 'Nivea Soft Light Moisturizer 200ml', sku: 'BEA-NIV-SFT', brand: 'Nivea', category_name: 'Beauty & Personal Care' },
      { order_item_id: 18, order_id: 12, product_id: 10, quantity: 1, unit_price: 400.00, line_total: 400.00, product_name: 'Wings of Fire (Autobiography)', sku: 'BOK-WINGS-FIRE', brand: 'Universities Press', category_name: 'Books' },
      { order_item_id: 19, order_id: 13, product_id: 4, quantity: 1, unit_price: 34990.00, line_total: 34990.00, product_name: 'LG 7 kg Front Load Washing Machine', sku: 'APP-LG-WASH7', brand: 'LG', category_name: 'Home Appliances' },
      { order_item_id: 20, order_id: 14, product_id: 10, quantity: 1, unit_price: 395.00, line_total: 395.00, product_name: 'Wings of Fire (Autobiography)', sku: 'BOK-WINGS-FIRE', brand: 'Universities Press', category_name: 'Books' },
      { order_item_id: 21, order_id: 14, product_id: 19, quantity: 1, unit_price: 8604.00, line_total: 8604.00, product_name: 'Titan Neo Analog Watch', sku: 'WAT-TIT-NEO', brand: 'Titan', category_name: 'Watches & Wearables' },
      { order_item_id: 22, order_id: 15, product_id: 17, quantity: 2, unit_price: 1499.00, line_total: 2998.00, product_name: 'boAt Rockerz 450 Bluetooth Headphones', sku: 'AUD-BOAT-450', brand: 'boAt', category_name: 'Audio & Headphones' },
      { order_item_id: 23, order_id: 16, product_id: 1, quantity: 1, unit_price: 17999.00, line_total: 17999.00, product_name: 'Redmi Note 13 5G (8GB/128GB)', sku: 'MOB-REDMI-13', brand: 'Xiaomi', category_name: 'Mobiles & Accessories' },
      { order_item_id: 24, order_id: 17, product_id: 19, quantity: 1, unit_price: 4995.00, line_total: 4995.00, product_name: 'Titan Neo Analog Watch', sku: 'WAT-TIT-NEO', brand: 'Titan', category_name: 'Watches & Wearables' },
      { order_item_id: 25, order_id: 17, product_id: 6, quantity: 2, unit_price: 1651.00, line_total: 3302.00, product_name: 'Biba Cotton Printed Kurti', sku: 'FAS-BIBA-KUR', brand: 'Biba', category_name: 'Women\'s Fashion' },
      { order_item_id: 26, order_id: 18, product_id: 16, quantity: 5, unit_price: 360.00, line_total: 1800.00, product_name: 'Classmate Notebook Pack of 6', sku: 'STA-CLS-NB6', brand: 'Classmate', category_name: 'Stationery' },
      { order_item_id: 27, order_id: 19, product_id: 6, quantity: 2, unit_price: 1599.00, line_total: 3198.00, product_name: 'Biba Cotton Printed Kurti', sku: 'FAS-BIBA-KUR', brand: 'Biba', category_name: 'Women\'s Fashion' },
      { order_item_id: 28, order_id: 19, product_id: 20, quantity: 1, unit_price: 1700.00, line_total: 1700.00, product_name: 'Noise ColorFit Pulse 3 Smartwatch', sku: 'WAT-NOI-PUL', brand: 'Noise', category_name: 'Watches & Wearables' },
      { order_item_id: 29, order_id: 20, product_id: 15, quantity: 1, unit_price: 200.00, line_total: 200.00, product_name: 'Dabur Chyawanprash 1 kg', sku: 'HEA-DAB-CHY', brand: 'Dabur', category_name: 'Health & Wellness' },
      { order_item_id: 30, order_id: 20, product_id: 9, quantity: 1, unit_price: 185.00, line_total: 185.00, product_name: 'Tata Sampann Toor Dal 1 kg', sku: 'GRO-TATA-DAL', brand: 'Tata Sampann', category_name: 'Groceries' }
    ]
  };
}

// Initialize PostgreSQL Connection Pool
async function initDb(customConnString = null) {
  const connString = customConnString || process.env.DATABASE_URL;

  if (connString) {
    try {
      if (pool) {
        await pool.end().catch(() => { });
      }

      const isLocalhost = connString.includes('localhost') || connString.includes('127.0.0.1');
      pool = new Pool({
        connectionString: connString,
        ssl: isLocalhost && process.env.DB_SSL !== 'true' ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      // Verify connection with test query
      const client = await pool.connect();
      const res = await client.query('SELECT current_database(), current_user, version()');
      client.release();

      const parsedUrl = new URL(connString.replace(/^postgresql:\/\//, 'http://'));
      connectionInfo = {
        type: 'postgres',
        host: parsedUrl.hostname,
        database: res.rows[0].current_database,
        user: res.rows[0].current_user,
        ssl: !isLocalhost || process.env.DB_SSL === 'true',
        version: res.rows[0].version,
        error: null,
      };
      isConnected = true;
      console.log(`[Database] Successfully connected to PostgreSQL at ${connectionInfo.host} (${connectionInfo.database})`);

      // Auto-Migration: Ensure tables and view exist
      await autoMigrate(pool);
      return { success: true, connectionInfo };
    } catch (err) {
      console.error('[Database] PostgreSQL connection failed:', err.message);
      connectionInfo = {
        type: 'mock',
        host: 'Mock In-Memory DB (PostgreSQL Fallback)',
        database: 'vedantchaudhari_ecommerce',
        user: 'postgres',
        ssl: false,
        error: err.message,
      };
      isConnected = false;
      loadMockData();
      return { success: false, error: err.message };
    }
  } else {
    console.log('[Database] No DATABASE_URL specified. Initializing in-memory mock PostgreSQL state.');
    connectionInfo = {
      type: 'mock',
      host: 'Mock In-Memory DB (Ready for Cloud Connection)',
      database: 'vedantchaudhari_ecommerce',
      user: 'postgres',
      ssl: false,
      error: null,
    };
    isConnected = false;
    loadMockData();
    return { success: true, connectionInfo };
  }
}

// Auto-migration & seed verification
async function autoMigrate(activePool) {
  try {
    const tableCheck = await activePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'categories';
    `);

    if (tableCheck.rows.length === 0) {
      console.log('[Database] Tables not found. Running PostgreSQL DDL schema.sql...');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await activePool.query(schemaSql);
      console.log('[Database] Schema successfully created.');

      console.log('[Database] Seeding 20 categories, 20 customers, 20 products, 20 orders, 30 items, 20 payments...');
      const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
      await activePool.query(seedSql);
      console.log('[Database] Seed data successfully applied.');
    } else {
      // Check if categories has rows
      const countRes = await activePool.query('SELECT COUNT(*) AS count FROM categories');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('[Database] Empty database detected. Applying seed data...');
        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
        await activePool.query(seedSql);
        console.log('[Database] Seed data applied.');
      }
    }
  } catch (err) {
    console.error('[Database] Migration error:', err.message);
  }
}

// Universal query runner (switches seamlessly between Live Cloud PostgreSQL and Mock State)
async function query(text, params = []) {
  if (isConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('[Database Query Error]:', err.message);
      throw err;
    }
  }

  // Fallback handler for mock state when no PostgreSQL URL is connected
  if (!mockData) loadMockData();
  const lower = text.toLowerCase();

  if (lower.includes('count(*) as n from products')) {
    return { rows: [{ n: mockData.products.length }] };
  }
  if (lower.includes('count(*) as n from customers')) {
    return { rows: [{ n: mockData.customers.length }] };
  }
  if (lower.includes('count(*) as n from orders')) {
    return { rows: [{ n: mockData.orders.length }] };
  }
  if (lower.includes('revenue') && lower.includes('orders')) {
    const revenue = mockData.orders
      .filter(o => o.order_status !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    return { rows: [{ revenue }] };
  }

  // Products with search
  if (lower.includes('from products') && lower.includes('like')) {
    const searchParam = (params[0] || '').replace(/%/g, '').toLowerCase();
    const rows = mockData.products.filter(p =>
      p.product_name.toLowerCase().includes(searchParam) ||
      p.brand.toLowerCase().includes(searchParam) ||
      p.category_name.toLowerCase().includes(searchParam)
    );
    return { rows };
  }

  // Products all
  if (lower.includes('from products')) {
    return { rows: [...mockData.products] };
  }

  // Orders view
  if (lower.includes('from v_order_summary') || lower.includes('from orders')) {
    const rows = [...mockData.orders].sort((a, b) => b.order_id - a.order_id);
    return { rows };
  }

  // Order items
  if (lower.includes('from order_items')) {
    const orderId = params[0];
    const items = (mockData.order_items || []).filter(item => !orderId || item.order_id === orderId);
    return { rows: items };
  }

  // Categories
  if (lower.includes('from categories')) {
    return { rows: [...mockData.categories] };
  }

  // Customers
  if (lower.includes('from customers')) {
    return { rows: [...mockData.customers] };
  }

  return { rows: [] };
}

// ACID Transaction Execution helper for checkout & laboratory demonstration
async function executeTransaction(callback) {
  if (isConnected && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // In-memory transaction demonstration
    if (!mockData) loadMockData();
    return await callback({
      query: async (sql, params) => {
        return query(sql, params);
      }
    });
  }
}

// Reset Database directly from Seed SQL
async function resetDatabase() {
  if (isConnected && pool) {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await pool.query(schemaSql);
    await pool.query(seedSql);
    return { success: true };
  } else {
    loadMockData();
    return { success: true, message: 'Mock data reloaded to original 20-row case study records.' };
  }
}

module.exports = {
  initDb,
  query,
  getPool: () => pool,
  executeTransaction,
  resetDatabase,
  getConnectionInfo: () => connectionInfo,
  isCloudConnected: () => isConnected,
};
