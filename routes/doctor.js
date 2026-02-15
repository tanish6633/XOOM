const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const db = require('../config/db');
const auth = require('../middleware/auth');

// --- GEMINI VISION PRO SIMULATION ---
// This database simulates the output of a Multimodal LLM analyzing crop images.
const KNOWLEDGE_GRAPH = [
    {
        name: "Tomato Late Blight",
        scientific_name: "Phytophthora infestans",
        confidence: "98.4%",
        symptoms: "Dark, water-soaked spots on leaves; white fungal growth on undersides during humidity.",
        cause: "Fungal-like oomycete pathogen spread by wind and water splash.",
        organic_treatment: [
            "Remove and destroy all infected plant parts immediately (do not compost).",
            "Spray with a Copper-based fungicide or Bordeaux mixture.",
            "Improve air circulation by pruning excess foliage."
        ],
        chemical_treatment: [
            "Apply fungicides containing Chlorothalonil (Daconil) every 7-10 days.",
            "Use systematic fungicides like Metalaxyl for severe infections."
        ],
        prevention: "Use drip irrigation to keep foliage dry. Rotate crops every 3 years."
    },
    {
        name: "Wheat Yellow Rust",
        scientific_name: "Puccinia striiformis",
        confidence: "96.2%",
        symptoms: "Yellow or orange powdery pustules arranged in stripes on leaf blades.",
        cause: "Fungal spores spread by wind over long distances.",
        organic_treatment: [
            "Spray Neem Oil (3%) mixed with mild soap water.",
            "Use bio-fungicides like Trichoderma viride.",
            "Dust wood ash on leaves in early morning."
        ],
        chemical_treatment: [
            "Spray Propiconazole (Tilt) or Tebuconazole (Folicur) at 1ml/liter.",
            "Apply Azoxystrobin (Amistar) for preventive control."
        ],
        prevention: "Plant resistant varieties like HD-2967 or DBW-187."
    },
    {
        name: "Rice Blast",
        scientific_name: "Magnaporthe oryzae",
        confidence: "94.8%",
        symptoms: "Diamond or spindle-shaped lesions with gray centers and brown margins.",
        cause: "Fungus favored by high nitrogen fertilizer and high humidity.",
        organic_treatment: [
            "Spray Pseudomonas fluorescens bacteria.",
            "Reduce Nitrogen fertilizer application immediately.",
            "Maintain water level depth of 5-10 cm."
        ],
        chemical_treatment: [
            "Spray Tricyclazole 75 WP or Isoprothiolane.",
            "Use Kasugamycin for severe neck blast."
        ],
        prevention: "Treat seeds with Carbendazim before sowing."
    },
    {
        name: "Cotton Leaf Curl",
        scientific_name: "Begomovirus (CLCuD)",
        confidence: "91.5%",
        symptoms: "Upward curling of leaves, thickened veins, and stunted growth.",
        cause: "Viral disease transmitted by Whitefly (Bemisia tabaci).",
        organic_treatment: [
            "Install yellow sticky traps (20 per acre) to catch whiteflies.",
            "Spray Neem Oil (10000 ppm) or Fish Oil Rosin Soap.",
            "Intercrop with Cowpea or Maize to act as barrier."
        ],
        chemical_treatment: [
            "Control vector using Imidacloprid or Diafenthiuron.",
            "Apply Acetamiprid for rapid knockdown."
        ],
        prevention: "Use virus-resistant hybrids and remove weed hosts."
    },
    {
        name: "Healthy Crop",
        scientific_name: "N/A",
        confidence: "99.1%",
        symptoms: "Leaves are vibrant green, turgid, and free of spots or deformities.",
        cause: "Optimal growing conditions.",
        organic_treatment: [
            "Continue current irrigation schedule.",
            "Add Vermicompost to maintain soil fertility."
        ],
        chemical_treatment: [
            "Apply NPK 19:19:19 water-soluble fertilizer for maintenance.",
            "Monitor regularly for early signs of pests."
        ],
        prevention: "Maintain good field hygiene."
    }
];

router.post('/analyze', upload.single('image'), (req, res) => {
    // 1. Simulate "Vision Processing"
    // In a real app, we would send req.file.path to Gemini Pro Vision API here.

    setTimeout(() => {
        // Pick a random result based on a "pseudo-hash" of the filename length to be somewhat consistent
        // or just random for demo diversity.
        const randomIndex = Math.floor(Math.random() * KNOWLEDGE_GRAPH.length);
        const result = KNOWLEDGE_GRAPH[randomIndex];

        res.json({
            success: true,
            scan_id: "VIS-" + Math.floor(Math.random() * 100000),
            diagnosis: result.name,
            scientific_name: result.scientific_name,
            confidence: result.confidence,
            symptoms: result.symptoms,
            cause: result.cause,
            treatment: {
                organic: result.organic_treatment,
                chemical: result.chemical_treatment
            },
            prevention: result.prevention,
            image_url: req.file ? `/uploads/${req.file.filename}` : null
        });
    }, 3000); // 3 seconds to simulate deep "AI Thinking"
});

router.post('/save-report', auth, async (req, res) => {
    try {
        const { scan_id, diagnosis, confidence, treatment, image_url } = req.body;
        // treatment comes as object, stringify it for simple storage or just store summary
        // For existing DB compatibility, we'll store a summary string
        const treatmentSummary = `Organic: ${treatment.organic[0]} | Chemical: ${treatment.chemical[0]}`;

        const userId = req.user.id;

        await db.execute(`
            INSERT INTO medical_reports (user_id, scan_id, diagnosis, confidence, treatment, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, scan_id, diagnosis, confidence, treatmentSummary, image_url || null]);

        res.json({ message: "Saved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save report" });
    }
});

// GET: My Past Reports
router.get('/history', auth, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM medical_reports WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to load history" });
    }
});

// GET: Generate PDF
router.get('/report/:id', auth, async (req, res) => {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    try {
        const reportId = req.params.id;
        const [rows] = await db.execute('SELECT * FROM medical_reports WHERE id = ? AND user_id = ?', [reportId, req.user.id]);

        if (rows.length === 0) return res.status(404).send("Report not found");
        const report = rows[0];

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Crop_Doctor_Report_${report.scan_id}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(24).fillColor('#10b981').text('FARM CENTRAL VISION', { align: 'center' });
        doc.fontSize(16).fillColor('black').text('AI DIAGNOSTIC REPORT', { align: 'center' });
        doc.moveDown();

        // Info
        doc.fontSize(12).text(`Scan ID: ${report.scan_id}`);
        doc.text(`Date: ${new Date(report.created_at).toLocaleString()}`);
        doc.moveDown();

        // Image
        if (report.image_url) {
            const imagePath = path.join(__dirname, '../../public', report.image_url);
            if (fs.existsSync(imagePath)) {
                try {
                    doc.image(imagePath, { fit: [500, 300], align: 'center' });
                    doc.moveDown();
                } catch (e) { }
            }
        }
        doc.moveDown();

        // Diagnosis
        doc.fontSize(18).fillColor(report.diagnosis === 'Healthy Crop' ? 'green' : 'red')
            .text(`Diagnosis: ${report.diagnosis}`, { underline: true });

        doc.fontSize(12).fillColor('grey').text(`Confidence: ${report.confidence}`);
        doc.moveDown();

        // Treatment
        doc.fillColor('black').fontSize(14).text("Treatment Plan:");
        doc.fontSize(11).text(report.treatment);

        // Footer
        doc.moveDown(3);
        doc.fontSize(10).fillColor('grey').text('Generated by Farm Central Gemini Vision Engine.', { align: 'center' });

        doc.end();

    } catch (err) {
        console.error(err);
        res.status(500).send("PDF Generation Failed");
    }
});

module.exports = router;
