// routes/auth.js — Admin login/logout routes using MongoDB Mongoose
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { mongoose, Admin } = require('../database');

// ─────────────────────────────────────────────
// POST /api/login
// Authenticate admin user
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const inputUser = String(username).trim();
    const inputPass = String(password);

    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envPass = process.env.ADMIN_PASSWORD || 'tejas@2026';

    // 1. Direct fast-path: Check against configured environment credentials
    if (inputUser === envUser && inputPass === envPass) {
        req.session.isAdmin = true;
        req.session.adminId = 'env_admin';
        req.session.username = envUser;
        return res.json({ success: true, message: 'Logged in successfully.' });
    }

    // 2. Database check: If MongoDB is connected, authenticate against Admin model
    try {
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            const admin = await Admin.findOne({ username: inputUser });
            if (admin) {
                const isValid = await bcrypt.compare(inputPass, admin.password_hash);
                if (isValid) {
                    req.session.isAdmin = true;
                    req.session.adminId = admin._id.toString();
                    req.session.username = admin.username;
                    return res.json({ success: true, message: 'Logged in successfully.' });
                }
            }
        }
        return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    } catch (err) {
        console.error('[Auth Error] POST /api/login:', err.message);
        return res.status(401).json({ success: false, error: 'Invalid username or password.' });
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
