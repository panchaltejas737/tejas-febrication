// database.js — MongoDB connection setup using Mongoose
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tejas';

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas / Local MongoDB successfully!'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.warn('⚠️ Server will run, but database actions will fail. Please set a valid MONGODB_URI in your .env file.');
    });

// ─── Enquiry Schema ───────────────────────────
const EnquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        default: null,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    source: {
        type: String,
        enum: ['contact_form', 'estimator', 'whatsapp', 'manual'],
        default: 'contact_form'
    },
    status: {
        type: String,
        enum: ['new', 'read', 'done'],
        default: 'new'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    called_at: {
        type: Date,
        default: null
    },
    emailed_at: {
        type: Date,
        default: null
    }
});

// ─── Admin Schema ─────────────────────────────
const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password_hash: {
        type: String,
        required: true
    }
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = {
    mongoose,
    Enquiry,
    Admin
};
