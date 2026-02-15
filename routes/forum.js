const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET Posts
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM forum_posts ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const upload = require('../middleware/upload');

// POST Post (Text + Media)
router.post('/', auth, upload.single('media'), async (req, res) => {
    try {
        const { content } = req.body;

        let mediaUrl = null;
        let mediaType = 'text';

        if (req.file) {
            mediaUrl = '/uploads/' + req.file.filename;
            mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        }

        // Get username
        const [user] = await db.execute('SELECT username FROM users WHERE id = ?', [req.user.id]);

        await db.execute(
            'INSERT INTO forum_posts (user_id, username, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, user[0].username, content, mediaUrl, mediaType]
        );
        res.status(201).json({ message: "Post Shared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Post
router.delete('/:id', auth, async (req, res) => {
    try {
        // Only allow deleting own posts
        await db.execute('DELETE FROM forum_posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Post Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
