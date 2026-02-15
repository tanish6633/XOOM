const db = require('./config/db');
require('dotenv').config();

async function migrate() {
    console.log("🛠️ Starting Migration: Add is_notified to tasks...");
    try {
        // Check if column exists strictly if we could, but simpler to try adding it and catch "Duplicate column" error
        // Or using INFORMATION_SCHEMA.
        // Let's just try to add it.
        await db.execute(`
            ALTER TABLE tasks
            ADD COLUMN is_notified BOOLEAN DEFAULT FALSE;
        `);
        console.log("✅ Successfully added 'is_notified' column.");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ Column 'is_notified' already exists.");
        } else {
            console.error("❌ Migration failed:", err.message);
        }
    }
    process.exit();
}

migrate();
