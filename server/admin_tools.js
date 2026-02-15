const db = require('./config/db');
require('dotenv').config();

const action = process.argv[2];
const target = process.argv[3];

async function main() {
    try {
        if (action === 'delete' && target) {
            console.log(`Checking for user with email: ${target}...`);
            const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [target]);

            if (users.length === 0) {
                console.log('❌ User not found.');
                process.exit();
            }

            const user = users[0];
            console.log(`found user: ${user.username} (ID: ${user.id})`);

            // Delete
            await db.execute('DELETE FROM users WHERE id = ?', [user.id]);
            console.log(`✅ User "${user.username}" and all their data have been deleted.`);

        } else {
            // List users
            console.log('\n--- 👥 Current Users ---');
            const [rows] = await db.execute('SELECT id, username, email, created_at FROM users');
            if (rows.length === 0) {
                console.log('No users found.');
            } else {
                rows.forEach(u => {
                    console.log(`[ID: ${u.id}] ${u.username} (${u.email})`);
                });
            }
            console.log('\nTo delete a user, run:');
            console.log('node server/admin_tools.js delete <email>');
        }
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();
