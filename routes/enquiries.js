// routes/enquiries.js — API routes for customer enquiries using MongoDB Mongoose
const express = require('express');
const router = express.Router();
const { Enquiry } = require('../database');

// Middleware: require admin session for protected routes
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
}

// ─────────────────────────────────────────────
// POST /api/enquiry
// Save a new customer enquiry (public endpoint)
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { name, phone, message, email = null, source = 'contact_form' } = req.body;

    // Validation
    if (!name || !phone || !message) {
        return res.status(400).json({ success: false, error: 'Name, phone, and message are required.' });
    }

    const trimmedName    = String(name).trim().slice(0, 100);
    const trimmedPhone   = String(phone).trim().slice(0, 20);
    const trimmedEmail   = email ? String(email).trim().slice(0, 100) : null;
    const trimmedMessage = String(message).trim().slice(0, 2000);
    
    // Check session for admin privileges to allow 'manual' source and custom status
    const isAdmin = req.session && req.session.isAdmin;
    const allowedSources = ['contact_form', 'estimator', 'whatsapp'];
    if (isAdmin) allowedSources.push('manual');
    
    const validSource = allowedSources.includes(source) ? source : 'contact_form';
    
    let validStatus = 'new';
    if (isAdmin && req.body.status && ['new', 'read', 'done'].includes(req.body.status)) {
        validStatus = req.body.status;
    }

    // Phone: must be 10 digits
    if (!/^\d{10}$/.test(trimmedPhone)) {
        return res.status(400).json({ success: false, error: 'Please provide a valid 10-digit phone number.' });
    }

    try {
        const enquiry = new Enquiry({
            name: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail,
            message: trimmedMessage,
            source: validSource,
            status: validStatus
        });
        const saved = await enquiry.save();

        return res.status(201).json({
            success: true,
            message: 'Enquiry saved successfully.',
            id: saved._id
        });
    } catch (err) {
        console.error('[DB Error] POST /api/enquiry:', err.message);
        return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
});

// ─────────────────────────────────────────────
// GET /api/enquiries  (ADMIN ONLY)
// List all enquiries with optional filtering
// ─────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
    const { status, limit = 100, offset = 0 } = req.query;
    const query = {};

    if (status && ['new', 'read', 'done'].includes(status)) {
        query.status = status;
    }

    try {
        const total = await Enquiry.countDocuments({});
        const newCount = await Enquiry.countDocuments({ status: 'new' });
        
        const rows = await Enquiry.find(query)
            .sort({ created_at: -1 })
            .skip(Number(offset))
            .limit(Number(limit));

        const formatted = rows.map(r => {
            const obj = r.toObject();
            obj.id = obj._id.toString(); // Map mongo _id to id virtual key
            return obj;
        });

        return res.json({ success: true, total, new_count: newCount, enquiries: formatted });
    } catch (err) {
        console.error('[DB Error] GET /api/enquiries:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// PATCH /api/enquiries/:id/status  (ADMIN ONLY)
// Update status of an enquiry
// ─────────────────────────────────────────────
router.patch('/:id/status', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'done'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Use: new, read, or done.' });
    }

    try {
        const updated = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Enquiry not found.' });
        }
        return res.json({ success: true, message: `Status updated to "${status}".` });
    } catch (err) {
        console.error('[DB Error] PATCH /api/enquiries/:id/status:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/enquiries/:id  (ADMIN ONLY)
// Delete an enquiry
// ─────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Enquiry.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Enquiry not found.' });
        }
        return res.json({ success: true, message: 'Enquiry deleted.' });
    } catch (err) {
        console.error('[DB Error] DELETE /api/enquiries/:id:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// POST /api/enquiries/:id/call  (ADMIN ONLY)
// Log a call attempt to this customer
// ─────────────────────────────────────────────
router.post('/:id/call', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found.' });
        }

        enquiry.called_at = new Date();
        if (enquiry.status === 'new') {
            enquiry.status = 'read';
        }
        await enquiry.save();

        return res.json({ success: true, message: 'Call logged.', called_at: enquiry.called_at, status: enquiry.status });
    } catch (err) {
        console.error('[DB Error] POST /api/enquiries/:id/call:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// POST /api/enquiries/:id/email  (ADMIN ONLY)
// Log an email attempt to this customer
// ─────────────────────────────────────────────
router.post('/:id/email', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ success: false, error: 'Enquiry not found.' });
        }

        enquiry.emailed_at = new Date();
        if (enquiry.status === 'new') {
            enquiry.status = 'read';
        }
        await enquiry.save();

        return res.json({ success: true, message: 'Email logged.', emailed_at: enquiry.emailed_at, status: enquiry.status });
    } catch (err) {
        console.error('[DB Error] POST /api/enquiries/:id/email:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

// ─────────────────────────────────────────────
// GET /api/enquiries/stats  (ADMIN ONLY)
// Dashboard statistics
// ─────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const total = await Enquiry.countDocuments({});
        const newCount = await Enquiry.countDocuments({ status: 'new' });
        const done = await Enquiry.countDocuments({ status: 'done' });
        
        // Count entries with created_at today in local timezone
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const today = await Enquiry.countDocuments({
            created_at: { $gte: startOfDay, $lte: endOfDay }
        });

        return res.json({ success: true, stats: { total, new: newCount, done, today } });
    } catch (err) {
        console.error('[DB Error] GET /api/enquiries/stats:', err.message);
        return res.status(500).json({ success: false, error: 'Server error.' });
    }
});

module.exports = router;
