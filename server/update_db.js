const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🔄 Updating Database Schema...");

        // 1. Add 'is_notified' to 'tasks' if not exists
        try {
            await db.execute("ALTER TABLE tasks ADD COLUMN is_notified BOOLEAN DEFAULT FALSE");
            console.log("✅ Added 'is_notified' column to 'tasks'");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ 'is_notified' column already exists in 'tasks'");
            } else {
                console.error("❌ Error adding column:", err.message);
            }
        }

        // 2. Create 'calendar_events' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS calendar_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                start_date DATETIME NOT NULL,
                end_date DATETIME,
                color VARCHAR(20) DEFAULT '#3B82F6',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created 'calendar_events' table");

        // 3. Create 'forum_posts' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS forum_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created 'forum_posts' table");

        // 4. Create 'trade_listings' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS trade_listings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                seller_id INT NOT NULL,
                crop_name VARCHAR(255) NOT NULL,
                quantity FLOAT NOT NULL,
                price_per_unit DECIMAL(10, 2) NOT NULL,
                description TEXT,
                status ENUM('active', 'sold', 'cancelled') DEFAULT 'active',
                buyer_id INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created 'trade_listings' table");

        // 5. Create 'transactions' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                listing_id INT NOT NULL,
                buyer_id INT NOT NULL,
                seller_id INT NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'completed',
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (listing_id) REFERENCES trade_listings(id) ON DELETE CASCADE,
                FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created 'transactions' table");

        // 6. Create 'medical_reports' table (AI Doctor)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS medical_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                scan_id VARCHAR(50) NOT NULL,
                diagnosis VARCHAR(255) NOT NULL,
                confidence VARCHAR(50),
                treatment TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Created 'medical_reports' table");

        console.log("🎉 Database Update Complete!");
        process.exit();
    } catch (err) {
        console.error("❌ Fatal Update Error:", err);
        process.exit(1);
    }
}

updateSchema();
