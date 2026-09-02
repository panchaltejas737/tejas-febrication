// email.js — Nodemailer SMTP email service for Tejas Fabrication
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
function createTransporter() {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT) || 587;
    const isSecure = process.env.EMAIL_SECURE === 'true' || port === 465;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass || pass.includes('your_16_char_gmail_app_password')) {
        return null;
    }

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: isSecure,
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

const defaultFrom = process.env.EMAIL_FROM || '"Tejas Fabrication" <panchaltejas0809@gmail.com>';
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'panchaltejas0809@gmail.com';

/**
 * Send admin alert when a new enquiry is submitted
 */
async function sendNewEnquiryNotification(enquiry) {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️ [Email Service] Skipping email notification: EMAIL_USER / EMAIL_PASS not configured in .env');
        return { success: false, reason: 'unconfigured' };
    }

    const { name, phone, email, message, source = 'contact_form', _id, created_at } = enquiry;
    const enquiryId = _id ? _id.toString() : 'N/A';
    const formattedDate = created_at ? new Date(created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #131b2e; border: 1px solid #23304d; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #1e294b 0%, #0f172a 100%); border-bottom: 2px solid #f59e0b; padding: 24px 30px; text-align: center; }
            .header h1 { margin: 0; color: #f59e0b; font-size: 24px; letter-spacing: 0.5px; }
            .header p { margin: 6px 0 0; color: #94a3b8; font-size: 14px; }
            .content { padding: 30px; }
            .badge { display: inline-block; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; }
            .field-group { margin-bottom: 18px; }
            .field-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
            .field-value { font-size: 16px; color: #f8fafc; font-weight: 500; }
            .field-value a { color: #38bdf8; text-decoration: none; }
            .message-box { background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; color: #cbd5e1; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin-top: 6px; }
            .actions { margin-top: 30px; text-align: center; }
            .btn { display: inline-block; background: #f59e0b; color: #000000; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; margin: 0 6px; }
            .btn-secondary { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
            .footer { background: #090d16; border-top: 1px solid #1e293b; padding: 16px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚡ New Customer Enquiry</h1>
                <p>Tejas Fabrication Lead Notification</p>
            </div>
            <div class="content">
                <span class="badge">Source: ${source.toUpperCase()}</span>
                
                <div class="field-group">
                    <div class="field-label">Customer Name</div>
                    <div class="field-value">👤 ${name}</div>
                </div>

                <div class="field-group">
                    <div class="field-label">Phone Number</div>
                    <div class="field-value">📞 <a href="tel:${phone}">${phone}</a></div>
                </div>

                ${email ? `
                <div class="field-group">
                    <div class="field-label">Customer Email</div>
                    <div class="field-value">✉️ <a href="mailto:${email}">${email}</a></div>
                </div>
                ` : ''}

                <div class="field-group">
                    <div class="field-label">Received At</div>
                    <div class="field-value">🕒 ${formattedDate}</div>
                </div>

                <div class="field-group">
                    <div class="field-label">Requirement / Message</div>
                    <div class="message-box">${message}</div>
                </div>

                <div class="actions">
                    <a href="tel:${phone}" class="btn">📞 Call Customer</a>
                    <a href="https://wa.me/91${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ' + name + ', thank you for contacting Tejas Fabrication!')}" class="btn btn-secondary">💬 WhatsApp</a>
                </div>
            </div>
            <div class="footer">
                Enquiry ID: ${enquiryId} • Tejas Fabrication Automated Alert System
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: defaultFrom,
            to: adminNotificationEmail,
            subject: `🔥 New Enquiry from ${name} (${phone}) - Tejas Fabrication`,
            text: `New Enquiry from ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nSource: ${source}\nDate: ${formattedDate}\n\nMessage:\n${message}`,
            html: htmlContent
        });
        console.log(`✉️ [Email Service] Admin notification sent successfully! MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ [Email Service Error] Failed to send admin notification:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Send friendly acknowledgement email to customer if email is provided
 */
async function sendCustomerConfirmation(enquiry) {
    if (!enquiry.email) return { success: false, reason: 'no_email' };

    const transporter = createTransporter();
    if (!transporter) return { success: false, reason: 'unconfigured' };

    const { name, email, message } = enquiry;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #0f172a; border-bottom: 3px solid #f59e0b; padding: 24px 30px; text-align: center; }
            .header h1 { margin: 0; color: #f59e0b; font-size: 22px; }
            .header p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; }
            .content { padding: 30px; line-height: 1.6; }
            .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
            .box { background: #f1f5f9; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .contact-card { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .contact-card h4 { margin: 0 0 8px; color: #7e22ce; }
            .footer { background: #0f172a; padding: 18px; text-align: center; color: #94a3b8; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>TEJAS FABRICATION</h1>
                <p>Quality Iron & Steel Fabrication Works</p>
            </div>
            <div class="content">
                <div class="greeting">Hello ${name},</div>
                <p>Thank you for reaching out to <strong>Tejas Fabrication</strong>! We have received your inquiry and our team will get back to you shortly with design options and quotation details.</p>
                
                <div class="box">
                    <strong>Your submitted requirement:</strong><br>
                    ${message}
                </div>

                <div class="contact-card">
                    <h4>Need urgent assistance?</h4>
                    <p style="margin: 4px 0;">📞 Call / WhatsApp: <strong>+91 72268 33799</strong></p>
                    <p style="margin: 4px 0;">📍 Workshop: Near Railway Crossing, GIDC Area, Gujarat, India</p>
                    <p style="margin: 4px 0;">🕒 Hours: Monday - Saturday (9:00 AM - 7:00 PM)</p>
                </div>

                <p>Best regards,<br><strong>Tejas Fabrication Team</strong></p>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} Tejas Fabrication. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: defaultFrom,
            to: email,
            subject: `Thank you for contacting Tejas Fabrication!`,
            html: htmlContent
        });
        console.log(`✉️ [Email Service] Customer confirmation sent to ${email}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ [Email Service Error] Failed to send customer confirmation:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Send direct custom email to a customer from the admin dashboard
 */
async function sendDirectEmail({ to, subject, html, text }) {
    const transporter = createTransporter();
    if (!transporter) {
        throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in .env');
    }

    return await transporter.sendMail({
        from: defaultFrom,
        to: to,
        subject: subject,
        text: text,
        html: html || text
    });
}

module.exports = {
    sendNewEnquiryNotification,
    sendCustomerConfirmation,
    sendDirectEmail,
    createTransporter
};
