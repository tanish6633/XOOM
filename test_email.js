require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("--- 📧 Testing Email Configuration ---");
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass: ${process.env.EMAIL_PASS ? '********' : 'Not Set'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("Attempting to verify connection...");
        await transporter.verify();
        console.log("✅ Connection Successful! Credentials are valid.");

        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email from Debug Script",
            text: "If you see this, the mailer is working perfectly!"
        });

        console.log("✅ Email Sent!");
        console.log("Message ID:", info.messageId);
    } catch (err) {
        console.error("❌ Email FAILED:");
        console.error(err);
    }
}

testEmail();
