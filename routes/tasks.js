const express = require('express'); // 1. Import Express
const router = express.Router();    // 2. Define the router
const db = require('../config/db');
const auth = require('../middleware/auth');
const { sendAlert } = require('../utils/mailer');

// GET Tasks
router.get('/', auth, async (req, res) => {
    try {
        // Show only future tasks
        const [rows] = await db.execute(`
            SELECT * FROM tasks 
            WHERE user_id = ? 
            AND TIMESTAMP(task_date, task_time) > NOW()
            ORDER BY task_date ASC, task_time ASC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Task
router.post('/', auth, async (req, res) => {
    try {
        const { task_date, task_time, description } = req.body;
        await db.execute(
            'INSERT INTO tasks (user_id, task_date, task_time, description) VALUES (?, ?, ?, ?)',
            [req.user.id, task_date, task_time, description]
        );

        // Send Email Alert
        const [user] = await db.execute('SELECT email FROM users WHERE id = ?', [req.user.id]);
        sendAlert(
            user[0].email,
            "New Task Assigned",
            `A new task "${description}" has been added to your planner.`
        ).catch(e => console.error("Task Email Failed:", e.message));

        res.status(201).json({ message: "Task Saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Task
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

module.exports = router; // 3. Export the router