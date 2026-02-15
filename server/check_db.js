const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query('DESCRIBE users');
        console.log(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
