const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farming',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 🌩️ Cloud Database Support (TiDB, PlanetScale, AWS)
// Automatically enable SSL if we are connecting to a remote host
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    console.log(`☁️ Configuring SSL for Remote Database: ${process.env.DB_HOST}`);
    dbConfig.ssl = {
        rejectUnauthorized: false // Helps avoid 'Self-signed' errors on Render/Free tiers
    };
}

const pool = mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL (farming database)');
        connection.release();
    }
});

module.exports = pool.promise();