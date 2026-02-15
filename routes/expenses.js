const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { sendAlert } = require('../utils/mailer');

// GET: All Expenses for current farmer
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to load expenses" });
    }
});

// POST: Add new expense
router.post('/', auth, async (req, res) => {
    try {
        const { category, amount, description, expense_date } = req.body;

        await db.execute(
            'INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, category, amount, description, expense_date]
        );

        // Send Email Alert
        const [user] = await db.execute('SELECT email, username FROM users WHERE id = ?', [req.user.id]);
        sendAlert(
            user[0].email,
            "💸 New Expense Recorded",
            `Hello ${user[0].username}, an expense of ₹${amount} for "${category}" has been recorded on ${expense_date}.`
        ).catch(e => console.error("Expense Email Failed:", e.message));

        res.status(201).json({ message: "Expense recorded successfully" });
    } catch (err) {
        console.error("Expense Error:", err.message);
        res.status(500).json({ error: "Failed to save expense" });
    }
});

// DELETE: Remove expense
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

module.exports = router;