const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log("Initializing Trade Tables...");

    // 1. Listings Table
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS trade_listings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            seller_id INT NOT NULL,
            buyer_id INT DEFAULT NULL,
            crop_name VARCHAR(255) NOT NULL,
            quantity DECIMAL(10,2) NOT NULL,
            price_per_unit DECIMAL(10,2) NOT NULL,
            description TEXT,
            status ENUM('active', 'sold', 'cancelled') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id)
        )
    `);

    // 2. Transactions Table
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            listing_id INT NOT NULL,
            buyer_id INT NOT NULL,
            seller_id INT NOT NULL,
            total_amount DECIMAL(15,2) NOT NULL,
            status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (listing_id) REFERENCES trade_listings(id)
        )
    `);

    console.log("Trade tables created!");
    process.exit();
}
init();
