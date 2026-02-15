const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch Inventory Total
        const [inv] = await db.execute(
            'SELECT COALESCE(SUM(quantity * cost), 0) as inventoryValue FROM inventory WHERE user_id = ?',
            [userId]
        );

        // Fetch Expenses Total (The key is "totalExpenses")
        const [exp] = await db.execute(
            'SELECT COALESCE(SUM(amount), 0) as totalExpenses FROM expenses WHERE user_id = ?',
            [userId]
        );

        // Fetch Tasks Count
        const [tasks] = await db.execute(
            'SELECT COUNT(*) as taskCount FROM tasks WHERE user_id = ?',
            [userId]
        );

        // Fetch Expenses by Category
        const [expenseBreakdown] = await db.execute(
            'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category',
            [userId]
        );

        // Fetch Unread Messages Count (New Feature)
        // Assuming 'is_read' column exists? actually we didn't add it in schema. 
        // Let's count TOTAL messages received for now as "Inbox Activity" 
        // to avoid complex schema changes right now if column missing.
        // Wait, better to query "Distinct Conversions" or just "Total Msgs Received".
        // Let's do: Total Messages Received
        const [msgs] = await db.execute(
            'SELECT COUNT(*) as msgCount FROM messages WHERE receiver_id = ?',
            [userId]
        );

        // Fetch Inventory Breakdown (for Pie Chart)
        const [invBreakdown] = await db.execute(
            'SELECT type, SUM(quantity * cost) as value FROM inventory WHERE user_id = ? GROUP BY type',
            [userId]
        );

        // Send a clean object to the frontend
        res.json({
            username: req.user.username,
            inventoryValue: inv[0].inventoryValue,
            totalExpenses: exp[0].totalExpenses,
            taskCount: tasks[0].taskCount,
            msgCount: msgs[0].msgCount,
            expenseBreakdown: expenseBreakdown,
            inventoryBreakdown: invBreakdown
        });
    } catch (err) {
        console.error("Dashboard SQL Error:", err.message);
        res.status(500).json({ error: "Failed to load dashboard data" });
    }
});

module.exports = router;