const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🔄 Updating Database for Withdrawals...");

        // Create 'withdrawals' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS withdrawals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                bank_account VARCHAR(255) NOT NULL,
                ifsc_code VARCHAR(50) NOT NULL,
                status ENUM('pending', 'processed', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log("✅ Created 'withdrawals' table");

        process.exit();
    } catch (err) {
        console.error("❌ Update Error:", err);
        process.exit(1);
    }
}

updateSchema();
