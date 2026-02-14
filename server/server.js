const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Passport for Google Auth
const passport = require('../config/passport');
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, '../public')));

// --- REGISTER ALL API ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/trading', require('./routes/trading'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/market', require('./routes/market'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/trade', require('./routes/trade'));
app.use('/api/ai', require('./routes/ai')); // NEW AI VOICE ROUTE

// --- SOCKET.IO SIGNALLING (For Calls) ---
// --- SOCKET.IO SIGNALLING (Real-Time Presence & Calls) ---
const onlineUsers = new Map(); // Store { socketId: username }

io.on('connection', (socket) => {

    // 1. Handle User Presence
    socket.on('user-online', (username) => {
        socket.username = username;
        onlineUsers.set(socket.id, username);

        // Broadcast to others that this user is online
        socket.broadcast.emit('user-status', { username, status: 'online' });

        // Send list of currently online users to THIS new user
        const activeUsers = Array.from(new Set(onlineUsers.values())); // Unique usernames
        socket.emit('active-users-list', activeUsers);
    });

    // 2. Handle Disconnect
    socket.on('disconnect', () => {
        const username = onlineUsers.get(socket.id);
        if (username) {
            onlineUsers.delete(socket.id);
            // Only broadcast offline if no other sockets exist for this user (simple check)
            // For now, we just broadcast. The client can handle debounce or check.
            io.emit('user-status', { username, status: 'offline' });
        }
    });

    // 3. WebRTC Signaling (Calls)
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('offer', (data) => socket.to(data.roomId).emit('offer', data));
    socket.on('answer', (data) => socket.to(data.roomId).emit('answer', data));
    socket.on('ice-candidate', (data) => socket.to(data.roomId).emit('ice-candidate', data));

    // 4. Call Signaling (Ringing)
    socket.on('call-request', (data) => socket.broadcast.emit('incoming-call', data));
    socket.on('call-accepted', (data) => socket.broadcast.emit('call-started', data));
    socket.on('call-rejected', (data) => socket.broadcast.emit('call-ended', data));

    // 5. Chat Typing
    socket.on('typing', (data) => socket.broadcast.emit('typing', data));
    socket.on('stop-typing', (data) => socket.broadcast.emit('stop-typing', data));
});

// Default route to serve Dashboard
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Debug Route to check Env Vars (Access via /api/debug-env)
app.get('/api/debug-env', (req, res) => {
    res.json({
        has_db_host: !!process.env.DB_HOST,
        has_db_user: !!process.env.DB_USER,
        has_email_user: !!process.env.EMAIL_USER,
        email_user_value: process.env.EMAIL_USER || "MISSING",
        has_email_pass: !!process.env.EMAIL_PASS,
        node_env: process.env.NODE_ENV
    });
});

// Health Check (Public)
app.get('/health', async (req, res) => {
    try {
        const db = require('./config/db');
        await db.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
const startScheduler = require('./scheduler');
const { verifyConnection } = require('./utils/mailer'); // Import Verify

// Conditional Listen for Local Development
if (require.main === module) {
    startScheduler();
    verifyConnection(); // Verify SMTP on Start

    server.listen(PORT, () => {
        console.log(`
        --- 🌾 FARM SYSTEM ONLINE ---
        🚀 Port: ${PORT}
        ✅ Routes Linked: Auth, Inv, Tasks, Exp, Dash, Chat
        ⚡ Socket.io: Active (Calling System Ready)
        -----------------------------
        `);
    });
}

// Export for Vercel (Serverless)
module.exports = app;  b