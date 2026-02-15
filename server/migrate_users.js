const db = require('./config/db');
require('dotenv').config();

async function migrateUsers() {
    console.log("🛠️ Starting Migration: Add reset_token and reset_expires to users...");
    try {
        await db.execute(`
            ALTER TABLE users
            ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
            ADD COLUMN reset_expires BIGINT DEFAULT NULL;
        `);
        console.log("✅ Successfully added reset columns to 'users'.");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ Columns already exist.");
        } else {
            console.error("❌ Migration failed:", err.message);
        }
    }
    process.exit();
}

migrateUsers();
