const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// 1. GET ALL LISTINGS (Marketplace)
router.get('/listings', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT t.id, t.crop_name, t.quantity, t.price_per_unit, t.description, t.created_at, u.username as seller_name, u.id as seller_id 
            FROM trade_listings t 
            JOIN users u ON t.seller_id = u.id 
            WHERE t.status = 'active' 
            ORDER BY t.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

// 1.5 GET MY LISTINGS
router.get('/listings/my', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT * FROM trade_listings 
            WHERE seller_id = ? 
            ORDER BY created_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch your listings" });
    }
});

// 2. CREATE A NEW LISTING (Sell Crop)
router.post('/listings', auth, async (req, res) => {
    try {
        const { crop_name, quantity, price, description } = req.body;
        if (!crop_name || !quantity || !price) return res.status(400).json({ error: "Missing fields" });

        await db.execute(`
            INSERT INTO trade_listings (seller_id, crop_name, quantity, price_per_unit, description) 
            VALUES (?, ?, ?, ?, ?)
        `, [req.user.id, crop_name, quantity, price, description]);

        res.status(201).json({ message: "Listing Created" });
    } catch (err) {
        res.status(500).json({ error: "Failed to create listing" });
    }
});

// 3. BUY A LISTING (Transaction)
router.post('/buy/:id', auth, async (req, res) => {
    try {
        const listingId = req.params.id;
        const buyerId = req.user.id;

        // Check listing exists and is active
        const [listings] = await db.execute("SELECT * FROM trade_listings WHERE id = ? AND status = 'active'", [listingId]);
        if (listings.length === 0) return res.status(404).json({ error: "Listing not found or sold" });

        const listing = listings[0];
        if (listing.seller_id === buyerId) return res.status(400).json({ error: "Cannot buy your own crop" });

        // Start Transaction
        const conn = await db.getConnection();
        await conn.beginTransaction();

        try {
            // Update Listing Status
            await conn.execute("UPDATE trade_listings SET status = 'sold', buyer_id = ? WHERE id = ?", [buyerId, listingId]);

            // Log Transaction
            const totalValue = listing.quantity * listing.price_per_unit;
            await conn.execute(`
                INSERT INTO transactions (listing_id, buyer_id, seller_id, total_amount, status) 
                VALUES (?, ?, ?, ?, 'completed')
            `, [listingId, buyerId, listing.seller_id, totalValue]);

            await conn.commit();
            res.json({ message: "Purchase Successful!", total: totalValue });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }

    } catch (err) {
        res.status(500).json({ error: "Transaction Failed" });
    }
});

module.exports = router;
