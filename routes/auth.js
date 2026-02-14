const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendAlert } = require('../utils/mailer');
const passport = require('passport');

// SIGN UP (New Farmer Registration)
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPass]
        );

        res.status(201).json({ message: "Registration successful! Please login." });
    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(400).json({ error: "Registration failed. Email may be taken." });
    }
});

// SIGN IN (Login + Email Alert)
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // --- TRIGGER LOGIN EMAIL ALERT (Background) ---
        sendAlert(
            user.email,
            "Login Alert: Smart Farm",
            `Hello ${user.username}, a successful login was recorded on ${new Date().toLocaleString()}.`
        ).catch(e => console.log("Email error:", e.message));

        res.json({ token, username: user.username, email: user.email });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Server error during signin" });
    }
});

// FORGOT PASSWORD (Generate OTP)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        const expires = Date.now() + 3600000; // 1 hour

        await db.execute('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [otp, expires, user.id]);

        await sendAlert(email, "Password Reset Request", `Your OTP for password reset is: ${otp}`);

        res.json({ message: "OTP sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// RESET PASSWORD (Verify OTP & Change)
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];

        if (user.reset_token !== otp || user.reset_expires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', [hashedPass, user.id]);

        res.json({ message: "Password reset successful! Please login." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// TEST EMAIL ROUTE (For Debugging)
router.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        await sendAlert(email, "Test Email System", "If you are reading this, the SMTP configuration on Render is working correctly! 🚀");

        res.json({ message: "Test email command sent. Check server logs for success/failure." });
    } catch (err) {
        res.status(500).json({ error: "Failed to send test email" });
    }
});

// --- GOOGLE AUTH ROUTES ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=GoogleAuthFailed' }),
    (req, res) => {
        // Successful authentication
        const user = req.user;
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send Login Alert (Async)
        sendAlert(
            user.email,
            "Login Alert: Smart Farm (Google)",
            `Hello ${user.username}, you signed in via Google on ${new Date().toLocaleString()}.`
        ).catch(e => console.log("Email error:", e.message));

        // Redirect to Dashboard with Token
        res.redirect(`/dashboard.html?token=${token}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`);
    }
);

module.exports = router;