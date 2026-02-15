const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🔄 Updating Database Schema...");

        // 1. Add media columns to forum_posts
        try {
            await db.execute("ALTER TABLE forum_posts ADD COLUMN media_url TEXT DEFAULT NULL");
            await db.execute("ALTER TABLE forum_posts ADD COLUMN media_type VARCHAR(50) DEFAULT 'text'"); // 'image', 'video', 'text'
            console.log("✅ Added media columns to forum_posts");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ forum_posts media columns already exist");
            else console.error("❌ forum_posts error:", err.message);
        }

        // 2. Add media columns to messages (for "Insta-like" chat media)
        try {
            await db.execute("ALTER TABLE messages ADD COLUMN media_url TEXT DEFAULT NULL");
            await db.execute("ALTER TABLE messages ADD COLUMN msg_type VARCHAR(20) DEFAULT 'text'"); // 'text', 'image', 'video', 'call_log'
            console.log("✅ Added media columns to messages");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ messages media columns already exist");
            else console.error("❌ messages error:", err.message);
        }

        console.log("🎉 Database schema update complete!");
        process.exit();
    } catch (err) {
        console.error("❌ Critical Migration Error:", err);
        process.exit(1);
    }
}

updateSchema();
