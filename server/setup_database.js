const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: true }
        });

        console.log('✅ Connected to MySQL Server');
        const dbName = process.env.DB_NAME || 'farming';

        // Only try to create DB if we are localhost or if we expect to have permissions
        // For TiDB free tier, the DB might already exist. We'll try-catch it or just USE it.
        try {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        } catch (e) {
            console.log('⚠️ Could not create database (might already exist or permission denied). Attempting to use existing...');
        }
        await connection.query(`USE \`${dbName}\``);

        // Users: Ensure username is UNIQUE
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                wallet_balance DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Standard Tables
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50),
                quantity DECIMAL(10,2) NOT NULL,
                cost DECIMAL(10,2),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                task_date DATE NOT NULL,
                task_time TIME NOT NULL,
                description TEXT NOT NULL,
                status ENUM('pending', 'completed') DEFAULT 'pending',
                is_notified BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50),
                amount DECIMAL(10,2) NOT NULL,
                description TEXT,
                expense_date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS market_listings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                username VARCHAR(255),
                crop_name VARCHAR(255) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                price_per_unit DECIMAL(10,2) NOT NULL,
                location VARCHAR(255),
                status ENUM('active', 'sold') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                listing_id INT NOT NULL,
                buyer_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                commission DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (listing_id) REFERENCES market_listings(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id)
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS forum_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // NEW: Messages Table for Chat
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                sender_username VARCHAR(255),
                receiver_username VARCHAR(255),
                content TEXT,
                messaged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "messages" created/checked');

        // NEW: Medical Reports (AI Doctor)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS medical_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                scan_id VARCHAR(50) NOT NULL,
                diagnosis VARCHAR(255) NOT NULL,
                confidence VARCHAR(50),
                treatment TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "medical_reports" created/checked');

        console.log('🎉 Database Updated & Ready!');
        process.exit();
    } catch (err) {
        console.error('❌ DB Setup Error:', err.message);
        process.exit(1);
    }
}

setup();
