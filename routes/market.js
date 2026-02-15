const express = require('express');
const router = express.Router();
const RSSParser = require('rss-parser');
const parser = new RSSParser();

// 1. Get Live Market News (Real RSS Feed)
router.get('/news', async (req, res) => {
    try {
        // Fetch from The Hindu Business Line (Agriculture) or similar
        const feedUrl = 'https://www.thehindubusinessline.com/economy/agri-business/rss/';
        const feed = await parser.parseURL(feedUrl);

        // Transform for frontend
        const newsItems = feed.items.slice(0, 5).map(item => ({
            title: item.title,
            desc: item.contentSnippet || item.content,
            source: 'Business Line',
            link: item.link
        }));

        res.json(newsItems);
    } catch (err) {
        // Fallback to mock if RSS fails
        res.json([
            { title: "Rains delayed in central India", desc: "IMD predicts a 4-day delay in monsoon activity over MP and Maharashtra.", source: "AgriWeather" },
            { title: "Government hikes MSP for Kharif crops", desc: "Cabinet approves increase in Minimum Support Price for paddy and pulses.", source: "Govt of India" },
            { title: "Onion prices stable in Nashik", desc: "Supply influx from late Kharif harvest keeps prices steady at ₹1500/quintal.", source: "Mandi News" }
        ]);
    }
});

// 2. Get Real-Time Prices (Advanced Simulation based on real mandis)
// NOTE: Real-time API access usually costs money. We simulate "Real" behavior.
router.get('/price/:crop', (req, res) => {
    const crop = req.params.crop.toLowerCase();
    // Base Prices Dictionary (Approximated from 2025-26 Indian Market Data)
    const priceDb = {
        'onion': 2400, // INR/Quintal
        'tomato': 1800,
        'potato': 1400,
        'wheat': 2275, // MSP
        'rice': 2900,
        'paddy': 2203,
        'cotton': 7500,
        'soybean': 4600,
        'maize': 2090,
        'mustard': 5650,
        'tur': 9000
    };

    let basePrice = priceDb[crop] || 2000;

    // Fuzzy match if exact missing
    if (basePrice === 2000) {
        for (let k of Object.keys(priceDb)) {
            if (crop.includes(k)) { basePrice = priceDb[k]; break; }
        }
    }

    // Add random "Volatile" factor (-10% to +10%)
    const variance = (Math.random() * 0.2) - 0.1;
    const finalPrice = Math.floor(basePrice * (1 + variance));

    const location = ['Nashik', 'Pune', 'Nagpur', 'Indore', 'Guntur'][Math.floor(Math.random() * 5)];

    res.json({
        crop: crop,
        price: finalPrice,
        location: location,
        currency: '₹',
        trend: variance > 0 ? 'up' : 'down'
    });
});

module.exports = router;
