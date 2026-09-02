// routes/content.js — Dynamic content API for Tejas Fabrication
const express = require('express');
const router = express.Router();
const { mongoose, GalleryItem, ServiceItem, Review, SiteSetting } = require('../database');

// Default fallback data for zero-downtime resiliency
const defaultGallery = [
    { title: 'Laser-Cut Main Entry Gate', title_gu: 'લેસર-કટ મુખ્ય પ્રવેશદ્વાર ગેટ', category: 'gates', image_url: 'assets/gate.webp', description: 'Heavy duty laser cut modern decorative gate.' },
    { title: 'Designer Window Safety Grill', title_gu: 'ડિઝાઇનર બારી સેફ્ટી ગ્રીલ', category: 'grills', image_url: 'assets/grill.webp', description: 'Square bar strong decorative safety grill.' },
    { title: 'Elegant Balcony Stair Railing', title_gu: 'આકર્ષક બાલ્કની અને દાદરની રેલિંગ', category: 'railings', image_url: 'assets/railing.webp', description: 'Rust-proof stylish balcony railing.' },
    { title: 'Terrace Corrugated Roof Shed', title_gu: 'ધાબા માટે પતરાનો મજબૂત શેડ', category: 'sheds', image_url: 'assets/shed.webp', description: 'Waterproof galvanized iron sheet shed.' },
    { title: 'Safety Slider Boundary Gate', title_gu: 'સેફ્ટી સ્લાઇડિંગ બાઉન્ડ્રી ગેટ', category: 'gates', image_url: 'assets/gate.webp', description: 'Smooth sliding heavy duty security gate.' },
    { title: 'Classic Security Window Frame', title_gu: 'ક્લાસિક સિક્યોરિટી વિન્ડો ફ્રેમ', category: 'grills', image_url: 'assets/grill.webp', description: 'High strength wrought iron window grill.' }
];

const defaultServices = [
    { title: 'Gates & Main Doors', title_gu: 'લોખંડના ગેટ અને દરવાજા', description: 'Modern safety gates, main entrance gates, and sliding gates with beautiful laser-cut designs.', description_gu: 'સુંદર લેઝર-કટ ડિઝાઇનવાળા આધુનિક સેફ્ટી ગેટ, મુખ્ય દરવાજા અને સ્લાઇડિંગ ગેટ.', image_url: 'assets/gate.webp', order: 1 },
    { title: 'Window Safety Grills', title_gu: 'બારીની સેફ્ટી ગ્રીલ', description: 'Durable and secure window grills designed to keep your family safe while enhancing home aesthetics.', description_gu: 'તમારા ઘરની સુરક્ષા અને સુંદરતા વધારવા માટે મજબૂત બારીની ગ્રીલ.', image_url: 'assets/grill.webp', order: 2 },
    { title: 'Balcony & Stair Railings', title_gu: 'બાલ્કની અને દાદરની રેલિંગ', description: 'Sleek and sturdy railings made of high-grade steel and iron for balconies, terraces, and staircases.', description_gu: 'દાદર અને ગેલેરી માટે સ્ટેનલેસ સ્ટીલ અથવા લોખંડની આકર્ષક અને મજબૂત રેલિંગ.', image_url: 'assets/railing.webp', order: 3 },
    { title: 'Roof Sheds & Structures', title_gu: 'પતરાના શેડ અને સ્ટ્રક્ચર', description: 'Heavy-duty metal sheds for warehouses, factories, residential parking, and terraces.', description_gu: 'ગોડાઉન, ફેક્ટરી, ઘરના પાર્કિંગ અથવા અગાશી માટે પતરાના મજબૂત શેડ.', image_url: 'assets/shed.webp', order: 4 }
];

const defaultReviews = [
    { client_name: 'Ramesh Patel', location: 'Ahmedabad', comment: 'Tejas Fabrication installed our main sliding gate. The design is absolutely premium, the welding joints are very neat, and the strength is outstanding. Strongly recommended!', comment_gu: 'તેજસ ફેબ્રિકેશને અમારો મુખ્ય સ્લાઇડિંગ ગેટ બનાવ્યો. ડિઝાઇન ખુબ પ્રીમિયમ છે અને મજબૂતાઈ જોરદાર છે. ખુબ ખુબ આભાર!', rating: 5, is_active: true },
    { client_name: 'Ketan Shah', location: 'Vadodara', comment: 'They made custom safety grills for all my windows and a balcony railing. Prompt service, high-grade iron materials, and very reasonable pricing.', comment_gu: 'તેમણે મારી તમામ બારીઓની સેફ્ટી ગ્રીલ અને ગેલેરી રેલિંગ બનાવી આપી. કામ સમયસર પૂરું કર્યું અને ગુણવત્તા પણ એકદમ શ્રેષ્ઠ છે.', rating: 5, is_active: true }
];

const defaultSettings = {
    phone: '+91 72268 33799',
    whatsapp: '917226833799',
    email: 'contact@tejasfabrication.com',
    address: 'Near Railway Crossing, GIDC Area, Gujarat, India',
    address_gu: 'રેલવે ક્રોસિંગ પાસે, જીઆઈડીસી વિસ્તાર, ગુજરાત, ભારત',
    estimator_rates: {
        gates_standard: 380, gates_designer: 550, gates_ss: 850,
        grills_standard: 240, grills_designer: 380, grills_ss: 650,
        railings_standard: 320, railings_designer: 480, railings_ss: 750,
        sheds_standard: 280, sheds_designer: 420, sheds_ss: 600
    }
};

// Middleware: Require Admin session
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized. Please log in as admin.' });
}

// ─────────────────────────────────────────────
// 1. PUBLIC ENDPOINTS
// ─────────────────────────────────────────────

// GET /api/content/all — Fetch all dynamic site data in one round-trip
router.get('/all', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: true,
                data: {
                    gallery: defaultGallery,
                    services: defaultServices,
                    reviews: defaultReviews,
                    settings: defaultSettings
                }
            });
        }

        const [gallery, services, reviews, settingsDoc] = await Promise.all([
            GalleryItem.find().sort({ created_at: -1 }),
            ServiceItem.find().sort({ order: 1 }),
            Review.find({ is_active: true }).sort({ created_at: -1 }),
            SiteSetting.findOne({ key: 'main_config' })
        ]);

        return res.json({
            success: true,
            data: {
                gallery: (gallery && gallery.length > 0) ? gallery : defaultGallery,
                services: (services && services.length > 0) ? services : defaultServices,
                reviews: (reviews && reviews.length > 0) ? reviews : defaultReviews,
                settings: settingsDoc || defaultSettings
            }
        });
    } catch (err) {
        console.error('[Content API Error] GET /all fallback:', err.message);
        return res.json({
            success: true,
            data: {
                gallery: defaultGallery,
                services: defaultServices,
                reviews: defaultReviews,
                settings: defaultSettings
            }
        });
    }
});

// GET /api/content/gallery
router.get('/gallery', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const { category } = req.query;
            const items = (!category || category === 'all')
                ? defaultGallery
                : defaultGallery.filter(i => i.category === category);
            return res.json({ success: true, items });
        }
        const { category } = req.query;
        const filter = category && category !== 'all' ? { category } : {};
        const items = await GalleryItem.find(filter).sort({ created_at: -1 });
        return res.json({ success: true, items: (items && items.length > 0) ? items : defaultGallery });
    } catch (err) {
        return res.json({ success: true, items: defaultGallery });
    }
});

// GET /api/content/services
router.get('/services', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({ success: true, services: defaultServices });
        }
        const services = await ServiceItem.find().sort({ order: 1 });
        return res.json({ success: true, services: (services && services.length > 0) ? services : defaultServices });
    } catch (err) {
        return res.json({ success: true, services: defaultServices });
    }
});

// GET /api/content/reviews
router.get('/reviews', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({ success: true, reviews: defaultReviews });
        }
        const reviews = await Review.find({ is_active: true }).sort({ created_at: -1 });
        return res.json({ success: true, reviews: (reviews && reviews.length > 0) ? reviews : defaultReviews });
    } catch (err) {
        return res.json({ success: true, reviews: defaultReviews });
    }
});

// GET /api/content/settings
router.get('/settings', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({ success: true, settings: defaultSettings });
        }
        let settings = await SiteSetting.findOne({ key: 'main_config' });
        if (!settings) {
            settings = await SiteSetting.create({ key: 'main_config' });
        }
        return res.json({ success: true, settings });
    } catch (err) {
        return res.json({ success: true, settings: defaultSettings });
    }
});

// ─────────────────────────────────────────────
// 2. PROTECTED ADMIN ENDPOINTS
// ─────────────────────────────────────────────

// ── GALLERY CRUD ──
router.post('/gallery', requireAdmin, async (req, res) => {
    try {
        const { title, title_gu, category, image_url, description } = req.body;
        if (!title || !image_url) {
            return res.status(400).json({ success: false, error: 'Title and Image URL are required.' });
        }
        const item = new GalleryItem({
            title: String(title).trim(),
            title_gu: title_gu ? String(title_gu).trim() : '',
            category: category || 'gates',
            image_url: String(image_url).trim(),
            description: description ? String(description).trim() : ''
        });
        await item.save();
        return res.status(201).json({ success: true, message: 'Gallery item added successfully.', item });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/gallery/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Gallery item not found.' });
        }
        return res.json({ success: true, message: 'Gallery item deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ── SERVICES CRUD ──
router.post('/services', requireAdmin, async (req, res) => {
    try {
        const { title, title_gu, description, description_gu, image_url, order } = req.body;
        if (!title || !description || !image_url) {
            return res.status(400).json({ success: false, error: 'Title, description, and image URL are required.' });
        }
        const service = new ServiceItem({
            title: String(title).trim(),
            title_gu: title_gu ? String(title_gu).trim() : '',
            description: String(description).trim(),
            description_gu: description_gu ? String(description_gu).trim() : '',
            image_url: String(image_url).trim(),
            order: Number(order) || 0
        });
        await service.save();
        return res.status(201).json({ success: true, message: 'Service created.', service });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/services/:id', requireAdmin, async (req, res) => {
    try {
        const updated = await ServiceItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Service not found.' });
        }
        return res.json({ success: true, message: 'Service updated.', service: updated });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/services/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await ServiceItem.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Service not found.' });
        }
        return res.json({ success: true, message: 'Service deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ── REVIEWS CRUD ──
router.post('/reviews', requireAdmin, async (req, res) => {
    try {
        const { client_name, location, comment, comment_gu, rating, is_active } = req.body;
        if (!client_name || !comment) {
            return res.status(400).json({ success: false, error: 'Client name and comment are required.' });
        }
        const review = new Review({
            client_name: String(client_name).trim(),
            location: location ? String(location).trim() : 'Gujarat',
            comment: String(comment).trim(),
            comment_gu: comment_gu ? String(comment_gu).trim() : '',
            rating: Number(rating) || 5,
            is_active: is_active !== undefined ? Boolean(is_active) : true
        });
        await review.save();
        return res.status(201).json({ success: true, message: 'Review added.', review });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/reviews/:id', requireAdmin, async (req, res) => {
    try {
        const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Review not found.' });
        }
        return res.json({ success: true, message: 'Review updated.', review: updated });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/reviews/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await Review.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Review not found.' });
        }
        return res.json({ success: true, message: 'Review deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ── SITE SETTINGS & RATES ──
router.post('/settings', requireAdmin, async (req, res) => {
    try {
        const { phone, whatsapp, email, address, address_gu, estimator_rates } = req.body;
        const updateData = {};
        if (phone !== undefined) updateData.phone = String(phone).trim();
        if (whatsapp !== undefined) updateData.whatsapp = String(whatsapp).trim();
        if (email !== undefined) updateData.email = String(email).trim();
        if (address !== undefined) updateData.address = String(address).trim();
        if (address_gu !== undefined) updateData.address_gu = String(address_gu).trim();
        if (estimator_rates) updateData.estimator_rates = estimator_rates;

        const updated = await SiteSetting.findOneAndUpdate(
            { key: 'main_config' },
            { $set: updateData },
            { new: true, upsert: true }
        );

        return res.json({ success: true, message: 'Site settings updated successfully.', settings: updated });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
