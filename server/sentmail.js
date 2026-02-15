const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config();

async function testSMTP() {
    console.log("--- 📧 Starting SMTP Connection Test ---");
    console.log(`Using Email: ${process.env.EMAIL_USER}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Bypasses certificate errors
        }
    });

    try {
        // 1. Verify connection configuration
        await transporter.verify();
        console.log("✅ Connection: SMTP server is ready to take our messages");

        // 2. Attempt to send a real test mail
        const info = await transporter.sendMail({
            from: `"SMTP Tester" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send it to yourself
            subject: "Terminal SMTP Test",
            text: "If you are reading this, your Node.js SMTP logic is 100% fixed!",
            html: "<b>SMTP Test Successful!</b><p>The SSL bypass and credentials are working.</p>"
        });

        console.log("✅ Message Sent: " + info.messageId);
        console.log("🚀 CHECK YOUR INBOX NOW!");

    } catch (error) {
        console.error("❌ SMTP TEST FAILED:");
        console.error(error.message);
        
        if (error.message.includes("Invalid login")) {
            console.log("\n💡 TIP: Use a 'Google App Password', not your main password.");
        }
    }
}

testSMTP();