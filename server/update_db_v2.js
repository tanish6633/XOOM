const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🔄 Updating Database Schema...");

        // 1. Create 'market_listings' table for Trading Feature
        await db.execute(`
            CREATE TABLE IF NOT EXISTS market_listings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                username VARCHAR(255),
                crop_name VARCHAR(255) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                price_per_unit DECIMAL(10,2) NOT NULL,
                location VARCHAR(255),
                status ENUM('active', 'sold') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created 'market_listings' table");

        // 2. Add 'is_notified' column check (Already done but checking safe) in case it was missed
        // (Skipping to avoid errors if already exists)

        console.log("🎉 Database Update Complete!");
        process.exit();
    } catch (err) {
        console.error("❌ Fatal Update Error:", err);
        process.exit(1);
    }
}

updateSchema();
