const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🔄 Updating Schema for Wallets...");

        // 1. Add 'wallet_balance' to users table
        try {
            await db.execute(`ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
            console.log("✅ Added wallet_balance to users");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("ℹ️ wallet_balance already exists");
            else throw e;
        }

        process.exit();
    } catch (err) {
        console.error("❌ Update Error:", err);
        process.exit(1);
    }
}

updateSchema();
