const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { sendAlert } = require('../utils/mailer');

// GET: Fetch inventory for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM inventory WHERE user_id = ? ORDER BY quantity ASC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to load inventory" });
    }
});

// POST: Add inventory with automated low-stock check
router.post('/', auth, async (req, res) => {
    try {
        const { name, type, quantity, cost } = req.body;
        const farmerId = req.user.id;
        const threshold = 5; // You can make this dynamic later

        // 1. Insert into Database
        await db.execute(
            'INSERT INTO inventory (user_id, name, type, quantity, cost) VALUES (?, ?, ?, ?, ?)',
            [farmerId, name, type, quantity, cost]
        );

        // 2. Always Send Email Alert
        const [user] = await db.execute('SELECT email, username FROM users WHERE id = ?', [farmerId]);

        let subject = "📦 Inventory Update";
        let message = `Hello ${user[0].username}, you have added ${quantity} units of "${name}" to your inventory.`;

        // Add low stock warning if applicable
        if (parseInt(quantity) <= threshold) {
            subject = "⚠️ LOW STOCK ALERT";
            message += ` Warning: Stock levels are now low (${quantity} left).`;
        }

        sendAlert(
            user[0].email,
            subject,
            message
        ).catch(e => console.error("Inventory Email Failed:", e.message));

        res.status(201).json({ message: "Inventory updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save inventory item" });
    }
});

// DELETE: Remove inventory item
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.execute('DELETE FROM inventory WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Inventory deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete inventory item" });
    }
});

module.exports = router;