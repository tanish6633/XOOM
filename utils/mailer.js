const nodemailer = require('nodemailer');

// 1. Configure the transporter (Using Gmail as an example)
const createTransporter = () => {
    // Debug Logging (Secure)
    if (process.env.EMAIL_USER) {
        const maskedUser = process.env.EMAIL_USER.substring(0, 3) + '***';
        console.log(`🔧 Configuring Transporter for: ${maskedUser}`);
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }
    return nodemailer.createTransport({
        service: 'gmail', // Use built-in service for better auto-config
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Fixes 'self-signed certificate' errors
        }
    });
};

const sendAlert = async (toEmail, subject, text) => {
    try {
        console.log(`📧 Attempting to send email to: ${toEmail}`);

        // Re-check env vars every time
        const currentTransporter = createTransporter();

        if (!currentTransporter) {
            console.error('❌ Email config missing. Please check EMAIL_USER and EMAIL_PASS variables.');
            return;
        }

        const mailOptions = {
            from: `"Smart Farm Alerts" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            text: text,
            html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; border: 1px solid #4ade80; border-radius: 12px; background-color: #f0fdf4; color: #1e293b;">
                    <h2 style="color: #15803d; margin-top: 0;">🌾 Farm System Alert</h2>
                    <p style="font-size: 16px; line-height: 1.5;">${text}</p>
                    <hr style="border: 0; border-top: 1px solid #bbf7d0; margin: 20px 0;">
                    <small style="color: #64748b;">This is an automated security notification for your Smart Farm account.</small>
                   </div>`
        };

        const info = await currentTransporter.sendMail(mailOptions);
        console.log(`✅ Alert sent successfully to ${toEmail}. MessageID: ${info.messageId}`);
    } catch (err) {
        console.error("❌ CRITICAL EMAIL ERROR:", err);
        if (err.code === 'EAUTH') {
            console.error("👉 Auth failed. Check EMAIL_USER/PASS. If using Gmail, use an App Password.");
        }
    }
};

const verifyConnection = async () => {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️  Email Transporter not initialized. Missing EMAIL_USER or EMAIL_PASS.');
        return;
    }
    try {
        await transporter.verify();
        console.log('✅ SMTP Server Connection Established (Ready to send emails)');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error.message);
    }
};

module.exports = { sendAlert, verifyConnection };