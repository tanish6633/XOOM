const db = require('./config/db');

async function migrate() {
    try {
        console.log('Migrating database for Google Auth...');

        // 1. Add google_id column
        try {
            await db.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE');
            console.log('✅ Added google_id column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ google_id column already exists.');
            } else {
                throw e;
            }
        }

        // 2. Make password nullable (for OAuth users)
        try {
            await db.execute('ALTER TABLE users MODIFY password VARCHAR(255) NULL');
            console.log('✅ Modified password to be nullable.');
        } catch (e) {
            console.log('⚠️ Could not modify password column (might already be nullable or other issue):', e.message);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
