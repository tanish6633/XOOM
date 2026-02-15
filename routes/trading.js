const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET Listings
router.get('/', auth, async (req, res) => {
    try {
        // Exclude own listings
        const [rows] = await db.execute(
            "SELECT * FROM market_listings WHERE status = 'active' AND user_id != ? ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Listing
router.post('/', auth, async (req, res) => {
    try {
        const { crop, qty, price, location } = req.body;
        const [user] = await db.execute('SELECT username FROM users WHERE id = ?', [req.user.id]);

        await db.execute(
            'INSERT INTO market_listings (user_id, username, crop_name, quantity, price_per_unit, location) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, user[0].username, crop, qty, price, location]
        );
        res.status(201).json({ message: "Listing Created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BUY (Simulate Payment & Commission)
router.post('/buy/:id', auth, async (req, res) => {
    try {
        const listingId = req.params.id;
        const buyerId = req.user.id;
        const { amount, commission } = req.body;

        // 1. Validate Listing
        const [listing] = await db.execute('SELECT * FROM market_listings WHERE id = ? AND status = "active"', [listingId]);
        if (listing.length === 0) return res.status(400).json({ error: "Item already sold or unavailable." });

        // 2. Prevent Self-Buy (Double Check)
        if (listing[0].user_id === buyerId) return res.status(403).json({ error: "Cannot buy your own listing" });

        // 3. Record Transaction (Simulated)
        // We log it as "completed" immediately since we are mocking the payment success
        await db.execute(
            'INSERT INTO transactions (listing_id, buyer_id, amount, commission, status) VALUES (?, ?, ?, ?, "completed")',
            [listingId, buyerId, amount, commission]
        );

        // 4. Update Listing to SOLD
        await db.execute('UPDATE market_listings SET status = "sold" WHERE id = ?', [listingId]);

        console.log(`💰 Trade: Item ${listingId} sold for ₹${amount}. Comm: ₹${commission}`);
        res.json({ message: "Payment Successful. Commission Sent to Admin." });
    } catch (err) {
        console.error("Buy Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
