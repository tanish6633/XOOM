const db = require('./config/db');

async function migrate() {
    try {
        console.log('Retry Migration...');

        // 1. Add google_id column (No UNIQUE for now to avoid issues, we can check uniqueness in code)
        try {
            await db.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(255)');
            console.log('✅ Added google_id column.');
        } catch (e) {
            console.log('ℹ️ Add google_id info:', e.message);
        }

        // 2. Make password nullable
        try {
            await db.execute('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL');
            console.log('✅ Modified password to be nullable.');
        } catch (e) {
            console.log('⚠️ Modify password info:', e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
