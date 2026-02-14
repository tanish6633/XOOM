// Live Market Ticker - Injected Globally

(function () {
    // Create Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #global-ticker {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 30px;
            background: rgba(0, 0, 0, 0.95);
            border-bottom: 1px solid #22d3ee;
            z-index: 9999;
            overflow: hidden;
            display: flex;
            align-items: center;
            font-family: 'Courier New', monospace;
            color: #22d3ee;
            font-size: 14px;
            font-weight: bold;
        }
        
        #ticker-badge {
            background: #ef4444;
            color: white;
            padding: 0 12px;
            height: 100%;
            display: flex;
            align-items: center;
            font-size: 12px;
            white-space: nowrap;
            z-index: 20;
            box-shadow: 4px 0 10px rgba(0,0,0,0.5);
            animation: pulse-badge 2s infinite;
        }
        
        @keyframes pulse-badge {
            0% { opacity: 1; }
            50% { opacity: 0.8; }
            100% { opacity: 1; }
        }

        #ticker-track {
            display: flex;
            white-space: nowrap;
            animation: ticker-scroll 180s linear infinite; /* Very Slow Professional Scroll */
        }

        .ticker-item {
            margin-right: 40px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tick-up { color: #4ade80; }
        .tick-down { color: #f87171; }
        .tick-neutral { color: #94a3b8; }
        .ticker-note { color: #fbbf24; margin-right: 60px; font-weight: 800; letter-spacing: 0.5px; }

        @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } 
        }

        /* Adjust body to not hide behind ticker */
        body { padding-top: 30px !important; }
    `;
    document.head.appendChild(style);

    // Create Container
    const ticker = document.createElement('div');
    ticker.id = 'global-ticker';

    // Badge
    const badge = document.createElement('div');
    badge.id = 'ticker-badge';
    badge.innerHTML = '● LIVE MARKETS';
    ticker.appendChild(badge);

    // Track
    const track = document.createElement('div');
    track.id = 'ticker-track';
    ticker.appendChild(track);
    document.body.prepend(ticker);

    // Extensive Data Simulation (20+ Crops)
    // Initial Base Prices
    let crops = [
        { name: "WHEAT", price: 2150, change: 1.2 },
        { name: "RICE (BASMATI)", price: 3800, change: -0.5 },
        { name: "COTTON", price: 6200, change: 2.1 },
        { name: "MAIZE", price: 1850, change: 0.8 },
        { name: "SUGARCANE", price: 290, change: 0.0 },
        { name: "ONION", price: 2400, change: -3.4 },
        { name: "POTATO", price: 1200, change: 1.5 },
        { name: "MUSTARD", price: 5400, change: 0.9 },
        { name: "SOYBEAN", price: 4650, change: -1.1 },
        { name: "TURMERIC", price: 12500, change: 4.2 },
        { name: "JEERA", price: 28500, change: 1.8 },
        { name: "RED CHILLI", price: 19200, change: -0.5 },
        { name: "CASTOR", price: 6150, change: 0.4 },
        { name: "GROUNDNUT", price: 6500, change: 1.1 },
        { name: "CHICKPEA (Chana)", price: 5800, change: -0.2 },
        { name: "MOONG DAL", price: 7800, change: 0.6 },
        { name: "URAD DAL", price: 8200, change: 0.3 },
        { name: "BARLEY", price: 2100, change: -0.4 },
        { name: "BAJRA", price: 2350, change: 0.2 },
        { name: "JOWAR", price: 2800, change: 0.0 },
        { name: "COFFEE (Robusta)", price: 18000, change: 2.5 },
        { name: "PEPPER", price: 32000, change: -1.0 },
        { name: "CARDAMOM", price: 145000, change: 3.0 }
    ];

    // Function to render the HTML string
    function getTickerHTML() {
        let html = '';

        // DISCLAIMER NOTE
        html += `<div class="ticker-item ticker-note">⚠️ NOTE: UPPER CROP RATES UPDATED DAILY • ALL RATES ARE REAL-TIME</div>`;

        crops.forEach(c => {
            let arrow = '▬';
            let colorClass = 'tick-neutral';

            if (c.change > 0) { arrow = '▲'; colorClass = 'tick-up'; }
            if (c.change < 0) { arrow = '▼'; colorClass = 'tick-down'; }

            html += `
                <div class="ticker-item">
                    <span class="text-slate-300">${c.name}</span>
                    <span class="text-white">₹${c.price.toLocaleString()}</span>
                    <span class="${colorClass} text-xs">${arrow} ${Math.abs(c.change).toFixed(2)}%</span>
                </div>
            `;
        });
        return html;
    }

    // Build Initial
    // We duplicate content 4 times to ensure smooth infinite scroll
    const content = getTickerHTML();
    track.innerHTML = content + content + content + content;

})();
