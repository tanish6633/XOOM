const db = require('./config/db');
require('dotenv').config();

const action = process.argv[2];

async function main() {
    try {
        if (action === 'delete-all-users') {
            console.log('⚠️  WARNING: You are about to DELETE ALL USERS from the database!');
            console.log('This will also cascade delete all their tasks, inventory, expenses, etc.');
            console.log('Waiting 5 seconds before proceeding... (Ctrl+C to cancel)');

            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('🗑️  Deleting all users...');
            await db.execute('DELETE FROM users');

            // Optional: Reset Auto Increment to 1
            await db.execute('ALTER TABLE users AUTO_INCREMENT = 1');

            console.log('✅ All users and related data have been WIPED completely.');
        } else {
            console.log('\nUsage:');
            console.log('node server/reset_users.js delete-all-users');
        }
        process.exit();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
