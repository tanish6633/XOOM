const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// 1. Search Users
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Explicitly exclude the requesting user from results
        const [users] = await db.execute(
            'SELECT id, username FROM users WHERE username LIKE ? AND id != ? LIMIT 10',
            [`%${q}%`, req.user.id]
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const upload = require('../middleware/upload');

// 2. Get Recent Conversations (For Sidebar)
router.get('/conversations', auth, async (req, res) => {
    try {
        const myId = req.user.id;
        // Complex query to get most recent message and user details for each conversation
        const query = `
            SELECT 
                u.id, u.username,
                m.content, m.msg_type, m.messaged_at
            FROM users u
            JOIN (
                SELECT 
                    CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
                    MAX(messaged_at) as last_msg_time
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY other_id
            ) recent ON u.id = recent.other_id
            JOIN messages m ON (
                (m.sender_id = ? AND m.receiver_id = u.id) OR 
                (m.sender_id = u.id AND m.receiver_id = ?)
            ) AND m.messaged_at = recent.last_msg_time
            ORDER BY m.messaged_at DESC
        `;

        const [rows] = await db.execute(query, [myId, myId, myId, myId, myId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load conversations" });
    }
});

// 3. Get Conversation with specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const otherId = req.params.userId;
        const myId = req.user.id;

        if (otherId == myId) return res.status(400).json({ error: "Cannot chat with self" });

        const [rows] = await db.execute(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = ?)
            ORDER BY messaged_at ASC
        `, [myId, otherId, otherId, myId]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to load chat" });
    }
});

// 4. Send Message (Text or Media)
router.post('/:userId', auth, upload.single('media'), async (req, res) => {
    try {
        const receiverId = req.params.userId;
        const senderId = req.user.id;
        let { content, type } = req.body; // type can be 'text'
        const senderName = req.user.username;

        // If file is uploaded, override content/type
        let mediaUrl = null;
        if (req.file) {
            mediaUrl = '/uploads/' + req.file.filename;
            if (req.file.mimetype.startsWith('image/')) type = 'image';
            else if (req.file.mimetype.startsWith('video/')) type = 'video';
            else if (req.file.mimetype.startsWith('audio/')) type = 'audio';

            content = content || `Sent a ${type}`;
        } else {
            type = 'text';
        }

        if (receiverId == senderId) return res.status(400).json({ error: "Sending message to self is not allowed" });

        const [receiver] = await db.execute('SELECT username FROM users WHERE id = ?', [receiverId]);
        if (!receiver.length) return res.status(404).json({ error: "User not found" });

        await db.execute(
            'INSERT INTO messages (sender_id, receiver_id, sender_username, receiver_username, content, msg_type, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [senderId, receiverId, senderName, receiver[0].username, content, type, mediaUrl]
        );

        res.json({ message: "Sent", timestamp: new Date(), mediaUrl, type });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send" });
    }
});

module.exports = router;
