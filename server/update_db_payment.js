const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🔄 Updating Database for Payments...");

        // Create 'transactions' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                listing_id INT NOT NULL,
                buyer_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                commission DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (listing_id) REFERENCES market_listings(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id)
            )
        `);
        console.log("✅ Created 'transactions' table");

        process.exit();
    } catch (err) {
        console.error("❌ Update Error:", err);
        process.exit(1);
    }
}

updateSchema();
