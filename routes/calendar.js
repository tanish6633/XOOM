const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET Events
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM calendar_events WHERE user_id = ?', [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Event
router.post('/', auth, async (req, res) => {
    try {
        const { title, start, end, color } = req.body;
        await db.execute(
            'INSERT INTO calendar_events (user_id, title, start_date, end_date, color) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, title, start, end || null, color || '#3B82F6']
        );
        res.status(201).json({ message: "Event Saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Event
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.execute('DELETE FROM calendar_events WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Event Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CROP DATABASE (Mock Knowledge Base) ---
const CROP_DB = {
    "rice": { season: "Rainy (Kharif)", duration: "120-150 days", water: "High", soil: "Clay/Loam", temp: "20-35°C", tips: "Maintain standing water." },
    "wheat": { season: "Winter (Rabi)", duration: "100-120 days", water: "Medium", soil: "Loam", temp: "10-25°C", tips: "Needs cold winter." },
    "corn": { season: "Spring/Summer", duration: "90-110 days", water: "Medium", soil: "Well-drained", temp: "18-30°C", tips: "Heavy feeder (Nitrogen)." },
    "maize": { season: "Year-round", duration: "80-100 days", water: "Medium", soil: "Loam", temp: "20-30°C", tips: "Versatile crop." },
    "cotton": { season: "Summer", duration: "150-180 days", water: "Medium", soil: "Black Soil", temp: "25-35°C", tips: "Avoid frost." },
    "tomato": { season: "Spring/Summer", duration: "70-90 days", water: "Medium", soil: "Sandy Loam", temp: "20-25°C", tips: "Stake plants for support." },
    "potato": { season: "Winter", duration: "90-110 days", water: "Medium", soil: "Loose/Sandy", temp: "15-20°C", tips: "Earthing up required." },
    "sugarcane": { season: "Year-round", duration: "300-365 days", water: "Very High", soil: "Deep Loam", temp: "20-35°C", tips: "Long duration crop." },
    "onion": { season: "Winter", duration: "100-120 days", water: "Low", soil: "Sandy Loam", temp: "15-25°C", tips: "Sensitive to waterlogging." },
    "soybean": { season: "Rainy", duration: "90-100 days", water: "Medium", soil: "Loam", temp: "25-30°C", tips: "Nitrogen fixing." }
};

// GET Crop Details
router.get('/crop-details', (req, res) => {
    const crop = (req.query.name || '').toLowerCase().trim();
    if (CROP_DB[crop]) {
        res.json({ found: true, name: crop, ...CROP_DB[crop] });
    } else {
        res.json({ found: false, message: "Crop details not found." });
    }
});

module.exports = router;
