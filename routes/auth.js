// routes/auth.js — Admin login/logout routes using MongoDB Mongoose
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Admin } = require('../database');

// ─────────────────────────────────────────────
// POST /api/login
// Authenticate admin user
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    try {
        const admin = await Admin.findOne({ username: String(username).trim() });

        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        const isValid = await bcrypt.compare(String(password), admin.password_hash);

        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        req.session.isAdmin = true;
        req.session.adminId = admin._id.toString();
        req.session.username = admin.username;

        return res.json({ success: true, message: 'Logged in successfully.' });
    } catch (err) {
        console.error('[Auth Error] POST /api/login:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// POST /api/logout
// Clear admin session
// ─────────────────────────────────────────────
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Logged out.' });
    });
});

// ─────────────────────────────────────────────
// GET /api/auth/check
// Check if current session is admin
// ─────────────────────────────────────────────
router.get('/check', (req, res) => {
    if (req.session && req.session.isAdmin) {
        return res.json({ success: true, isAdmin: true, username: req.session.username });
    }
    return res.json({ success: true, isAdmin: false });
});

module.exports = router;
