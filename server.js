// server.js — Main Express server for Tejas Fabrication
require('dotenv').config();

const express    = require('express');
const session    = require('express-session');
const cors       = require('cors');
const path       = require('path');
const bcrypt     = require('bcryptjs');
const { Admin, seedInitialContent } = require('./database');
const compression = require('compression');

// ─── App Setup ───────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret:            process.env.SESSION_SECRET || 'tejas_secret_fallback',
    resave:            false,
    saveUninitialized: false,
    cookie: {
        secure:   false,  // set true if using HTTPS
        httpOnly: true,
        maxAge:   8 * 60 * 60 * 1000  // 8 hours
    }
}));

// ─── Seed Admin Account (first run) ──────────
async function seedAdmin() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'tejas@2026';

    try {
        const existing = await Admin.findOne({ username });
        if (!existing) {
            const hash = await bcrypt.hash(password, 12);
            const admin = new Admin({ username, password_hash: hash });
            await admin.save();
            console.log(`✅ Admin account created → username: "${username}"`);
        }
    } catch (err) {
        console.error('[Mongoose Error] seedAdmin:', err.message);
    }
}

// ─── API Routes ───────────────────────────────
const enquiriesRouter = require('./routes/enquiries');
const authRouter      = require('./routes/auth');
const contentRouter   = require('./routes/content');

app.use('/api/enquiries', enquiriesRouter);
app.use('/api/enquiry',   enquiriesRouter); // Support singular path from client script
app.use('/api/content',   contentRouter);
app.use('/api',           authRouter);

// ─── Caching configuration for Static Files ───
const oneYear = 31536000000; // 365 days in ms
const staticOptions = {
    maxAge: oneYear,
    setHeaders: (res, filepath) => {
        const ext = path.extname(filepath).toLowerCase();
        if (ext === '.html') {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (['.js', '.css', '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
};

// ─── Admin Panel ──────────────────────────────
// Serve admin dashboard (protected by session check on client + API level)
app.use('/admin', express.static(path.join(__dirname, 'admin'), staticOptions));

// Redirect /admin to /admin/index.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// ─── Subpages Routing ─────────────────────────
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/estimator', (req, res) => {
    res.sendFile(path.join(__dirname, 'estimator.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// ─── Static Frontend Files ────────────────────
// Serve the main Tejas Fabrication website
app.use(express.static(path.join(__dirname), staticOptions));

// Fallback → always serve index.html for SPA-style navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.message);
    res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('┌─────────────────────────────────────────────┐');
    console.log(`│  🔥 Tejas Fabrication Server Running         │`);
    console.log(`│  🌐  Website  →  http://localhost:${PORT}        │`);
    console.log(`│  🛡️   Admin    →  http://localhost:${PORT}/admin  │`);
    console.log('└─────────────────────────────────────────────┘');
    console.log('');

    // Seed admin account & initial dynamic content in background
    seedAdmin();
    seedInitialContent();
});
