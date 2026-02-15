const cron = require('node-cron'); // Use node-cron if available, else setInterval
const db = require('./config/db');
const { sendAlert } = require('./utils/mailer');

// Schedule: Check every minute
const startScheduler = () => {
    console.log("⏰ Task Scheduler Started...");

    setInterval(async () => {
        try {
            // Get current date and time
            const now = new Date();
            // Format to match DB: YYYY-MM-DD HH:MM:SS (roughly)
            // But easier to just let SQL compare if possible.
            // MySQL 'DATE' is YYYY-MM-DD, 'TIME' is HH:MM:SS.

            // Query for due tasks that haven't been notified
            const [tasks] = await db.execute(`
                SELECT t.id, t.description, t.task_date, t.task_time, u.email 
                FROM tasks t
                JOIN users u ON t.user_id = u.id
                WHERE t.is_notified = 0 
                AND TIMESTAMP(t.task_date, t.task_time) <= NOW()
            `);

            if (tasks.length > 0) {
                console.log(`🔔 Found ${tasks.length} due tasks.`);

                for (const task of tasks) {
                    // Send Email
                    const subject = "⏰ Task Reminder: " + task.description;
                    const message = `Hello,\n\nThe time for your task "${task.description}" has arrived.\nScheduled for: ${task.task_date} at ${task.task_time}.\n\nPlease check your farm dashboard.`;

                    await sendAlert(task.email, subject, message);

                    // Mark as notified
                    await db.execute('UPDATE tasks SET is_notified = 1 WHERE id = ?', [task.id]);
                    console.log(`   -> Notified Task ID ${task.id}`);
                }
            }

        } catch (err) {
            console.error("Scheduler Error:", err.message);
        }
    }, 60 * 1000); // Run every 60 seconds
};

module.exports = startScheduler;
