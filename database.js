// database.js — MongoDB connection setup using Mongoose
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tejas';

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})
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

// ─── Dynamic Gallery Schema ───────────────────
const GalleryItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    title_gu: {
        type: String,
        default: '',
        trim: true
    },
    category: {
        type: String,
        enum: ['gates', 'grills', 'railings', 'sheds'],
        default: 'gates'
    },
    image_url: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// ─── Dynamic Services Schema ──────────────────
const ServiceItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    title_gu: {
        type: String,
        default: '',
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    description_gu: {
        type: String,
        default: '',
        trim: true
    },
    image_url: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
});

// ─── Dynamic Reviews Schema ───────────────────
const ReviewSchema = new mongoose.Schema({
    client_name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        default: 'Gujarat',
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    comment_gu: {
        type: String,
        default: '',
        trim: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// ─── Dynamic Site Settings & Pricing Schema ───
const SiteSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'main_config',
        unique: true
    },
    phone: {
        type: String,
        default: '+91 72268 33799'
    },
    whatsapp: {
        type: String,
        default: '917226833799'
    },
    email: {
        type: String,
        default: 'contact@tejasfabrication.com'
    },
    address: {
        type: String,
        default: 'Near Railway Crossing, GIDC Area, Gujarat, India'
    },
    address_gu: {
        type: String,
        default: 'રેલવે ક્રોસિંગ પાસે, જીઆઈડીસી વિસ્તાર, ગુજરાત, ભારત'
    },
    estimator_rates: {
        gates_standard: { type: Number, default: 380 },
        gates_designer: { type: Number, default: 550 },
        gates_ss:       { type: Number, default: 850 },
        grills_standard: { type: Number, default: 240 },
        grills_designer: { type: Number, default: 380 },
        grills_ss:       { type: Number, default: 650 },
        railings_standard: { type: Number, default: 320 },
        railings_designer: { type: Number, default: 480 },
        railings_ss:       { type: Number, default: 750 },
        sheds_standard: { type: Number, default: 280 },
        sheds_designer: { type: Number, default: 420 },
        sheds_ss:       { type: Number, default: 600 }
    }
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);
const Admin = mongoose.model('Admin', AdminSchema);
const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema);
const ServiceItem = mongoose.model('ServiceItem', ServiceItemSchema);
const Review = mongoose.model('Review', ReviewSchema);
const SiteSetting = mongoose.model('SiteSetting', SiteSettingSchema);

// ─── Initial Dynamic Content Seeder ───────────
async function seedInitialContent() {
    try {
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve) => {
                const timer = setTimeout(() => resolve(), 4000);
                mongoose.connection.once('connected', () => {
                    clearTimeout(timer);
                    resolve();
                });
                mongoose.connection.once('error', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });
        }
        if (mongoose.connection.readyState !== 1) {
            console.warn('⚠️ MongoDB not connected yet. Seeding skipped for now.');
            return;
        }

        // 1. Seed Gallery Items if empty
        const galleryCount = await GalleryItem.countDocuments();
        if (galleryCount === 0) {
            await GalleryItem.insertMany([
                {
                    title: 'Laser-Cut Main Entry Gate',
                    title_gu: 'લેસર-કટ મુખ્ય પ્રવેશદ્વાર ગેટ',
                    category: 'gates',
                    image_url: 'assets/gate.webp',
                    description: 'Heavy duty laser cut modern decorative gate.'
                },
                {
                    title: 'Designer Window Safety Grill',
                    title_gu: 'ડિઝાઇનર બારી સેફ્ટી ગ્રીલ',
                    category: 'grills',
                    image_url: 'assets/grill.webp',
                    description: 'Square bar strong decorative safety grill.'
                },
                {
                    title: 'Elegant Balcony Stair Railing',
                    title_gu: 'આકર્ષક બાલ્કની અને દાદરની રેલિંગ',
                    category: 'railings',
                    image_url: 'assets/railing.webp',
                    description: 'Rust-proof stylish balcony railing.'
                },
                {
                    title: 'Terrace Corrugated Roof Shed',
                    title_gu: 'ધાબા માટે પતરાનો મજબૂત શેડ',
                    category: 'sheds',
                    image_url: 'assets/shed.webp',
                    description: 'Waterproof galvanized iron sheet shed.'
                },
                {
                    title: 'Safety Slider Boundary Gate',
                    title_gu: 'સેફ્ટી સ્લાઇડિંગ બાઉન્ડ્રી ગેટ',
                    category: 'gates',
                    image_url: 'assets/gate.webp',
                    description: 'Smooth sliding heavy duty security gate.'
                },
                {
                    title: 'Classic Security Window Frame',
                    title_gu: 'ક્લાસિક સિક્યોરિટી વિન્ડો ફ્રેમ',
                    category: 'grills',
                    image_url: 'assets/grill.webp',
                    description: 'High strength wrought iron window grill.'
                }
            ]);
            console.log('✅ Seeded initial Gallery items');
        }

        // 2. Seed Services if empty
        const serviceCount = await ServiceItem.countDocuments();
        if (serviceCount === 0) {
            await ServiceItem.insertMany([
                {
                    title: 'Gates & Main Doors',
                    title_gu: 'લોખંડના ગેટ અને દરવાજા',
                    description: 'Modern safety gates, main entrance gates, and sliding gates with beautiful laser-cut designs.',
                    description_gu: 'સુંદર લેઝર-કટ ડિઝાઇનવાળા આધુનિક સેફ્ટી ગેટ, મુખ્ય દરવાજા અને સ્લાઇડિંગ ગેટ.',
                    image_url: 'assets/gate.webp',
                    order: 1
                },
                {
                    title: 'Window Safety Grills',
                    title_gu: 'બારીની સેફ્ટી ગ્રીલ',
                    description: 'Durable and secure window grills designed to keep your family safe while enhancing home aesthetics.',
                    description_gu: 'તમારા ઘરની સુરક્ષા અને સુંદરતા વધારવા માટે મજબૂત બારીની ગ્રીલ.',
                    image_url: 'assets/grill.webp',
                    order: 2
                },
                {
                    title: 'Balcony & Stair Railings',
                    title_gu: 'બાલ્કની અને દાદરની રેલિંગ',
                    description: 'Sleek and sturdy railings made of high-grade steel and iron for balconies, terraces, and staircases.',
                    description_gu: 'દાદર અને ગેલેરી માટે સ્ટેનલેસ સ્ટીલ અથવા લોખંડની આકર્ષક અને મજબૂત રેલિંગ.',
                    image_url: 'assets/railing.webp',
                    order: 3
                },
                {
                    title: 'Roof Sheds & Structures',
                    title_gu: 'પતરાના શેડ અને સ્ટ્રક્ચર',
                    description: 'Heavy-duty metal sheds for warehouses, factories, residential parking, and terraces.',
                    description_gu: 'ગોડાઉન, ફેક્ટરી, ઘરના પાર્કિંગ અથવા અગાશી માટે પતરાના મજબૂત શેડ.',
                    image_url: 'assets/shed.webp',
                    order: 4
                }
            ]);
            console.log('✅ Seeded initial Services');
        }

        // 3. Seed Reviews if empty
        const reviewCount = await Review.countDocuments();
        if (reviewCount === 0) {
            await Review.insertMany([
                {
                    client_name: 'Ramesh Patel',
                    location: 'Ahmedabad',
                    comment: 'Tejas Fabrication installed our main sliding gate. The design is absolutely premium, the welding joints are very neat, and the strength is outstanding. Strongly recommended!',
                    comment_gu: 'તેજસ ફેબ્રિકેશને અમારો મુખ્ય સ્લાઇડિંગ ગેટ બનાવ્યો. ડિઝાઇન ખુબ પ્રીમિયમ છે અને મજબૂતાઈ જોરદાર છે. ખુબ ખુબ આભાર!',
                    rating: 5,
                    is_active: true
                },
                {
                    client_name: 'Ketan Shah',
                    location: 'Vadodara',
                    comment: 'They made custom safety grills for all my windows and a balcony railing. Prompt service, high-grade iron materials, and very reasonable pricing.',
                    comment_gu: 'તેમણે મારી તમામ બારીઓની સેફ્ટી ગ્રીલ અને ગેલેરી રેલિંગ બનાવી આપી. કામ સમયસર પૂરું કર્યું અને ગુણવત્તા પણ એકદમ શ્રેષ્ઠ છે.',
                    rating: 5,
                    is_active: true
                }
            ]);
            console.log('✅ Seeded initial Reviews');
        }

        // 4. Seed Settings if empty
        const settingCount = await SiteSetting.countDocuments();
        if (settingCount === 0) {
            await SiteSetting.create({
                key: 'main_config',
                phone: '+91 72268 33799',
                whatsapp: '917226833799',
                email: 'contact@tejasfabrication.com',
                address: 'Near Railway Crossing, GIDC Area, Gujarat, India',
                address_gu: 'રેલવે ક્રોસિંગ પાસે, જીઆઈડીસી વિસ્તાર, ગુજરાત, ભારત'
            });
            console.log('✅ Seeded initial Site Settings');
        }
    } catch (err) {
        console.error('[DB Error] seedInitialContent:', err.message);
    }
}

module.exports = {
    mongoose,
    Enquiry,
    Admin,
    GalleryItem,
    ServiceItem,
    Review,
    SiteSetting,
    seedInitialContent
};
