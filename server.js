const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/workerDB')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Initialize GridFS
let gfs;
mongoose.connection.once('open', () => {
    gfs = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
    console.log('GridFS initialized');
});

// Mongoose Schemas
const customerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    flat: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, required: true },
    pincode: { type: String, required: true },
    town: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    profilePhoto: String,
    role: { type: String, default: 'customer' }
});

const sellerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    shopName: { type: String, required: true },
    professionalPhone: String,
    professionalEmail: String,
    shopDescription: String,
    shopTypes: [String],
    personalAddress: { type: String, required: true },
    professionalAddress: { type: String, required: true },
    profilePhoto: String,
    shopImages: [String],
    govtId: String,
    shopRegistration: String,
    gstRegistration: String,
    pricing: { type: Map, of: Number, default: {} },
    rating: { type: Number, default: 0 },
    role: { type: String, default: 'seller' }
});

const workerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    professionalPhone: { type: String, default: '' },
    professionalEmail: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    description: { type: String, default: '' },
    primarySkill: { type: String, required: true },
    electricianSubSkills: { type: [String], default: [] },
    address: {
        flat: { type: String, required: true },
        area: { type: String, required: true },
        landmark: { type: String, required: true },
        pincode: { type: String, required: true },
        town: { type: String, required: true },
        state: { type: String, required: true },
        district: { type: String, required: true }
    },
    workTiming: { type: String, required: true },
    role: { type: String, default: 'worker' },
    profilePhoto: { type: String, default: '' },
    govtId: { type: String, default: '' },
    selfieId: { type: String, default: '' },
    drivingLicense: { type: String, default: '' },
    degreeCertificate: { type: String, default: '' },
    intermediateCertificate: { type: String, default: '' },
    tenthCertificate: { type: String, default: '' },
    priceRanges: { type: Object, default: {} },
    earnings: {
        total: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        pending: { type: Number, default: 0 }
    },
    rating: { type: Number, default: 0 } // Add rating field with default value
});

//const Worker = mongoose.model('Worker', workerSchema);

const jobRequestSchema = new mongoose.Schema({
    worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    header: { type: String, required: true },
    customer: { type: String, required: true },
    location: { type: String, required: true },
    time: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'pending' },
    service_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' }
});

const workHistorySchema = new mongoose.Schema({
    worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    job: { type: String, required: true },
    customer: { type: String, required: true },
    date: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    rating: Number,
    feedback: String
});

const serviceRequestSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customer_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    zipcode: { type: String, required: true },
    service_group: { type: String, required: true },
    service_type: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, default: 'pending' },
    assigned_worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }
});

const sellerPurchaseSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    items: { type: [Map], required: true },
    total_price: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    rating: Number,
    feedback: String,
    purchase_date: String
});

const supplyRequestSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    category: { type: String, required: true },
    supplies: { type: [Map], required: true },
    additional: String,
    status: { type: String, default: 'pending' },
    created_at: { type: String, required: true }
});

const sellerResponseSchema = new mongoose.Schema({
    supply_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplyRequest', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    supplies: { type: [Map], required: true },
    total_price: { type: Number, required: true },
    created_at: { type: String, required: true }
});

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: { type: String, required: true },
    message: { type: String, required: true },
    created_at: { type: String, required: true },
    is_read: { type: Number, default: 0 }
});

// Mongoose Models
const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
const Worker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);
const JobRequest = mongoose.models.JobRequest || mongoose.model('JobRequest', jobRequestSchema);
const WorkHistory = mongoose.models.WorkHistory || mongoose.model('WorkHistory', workHistorySchema);
const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);
const SellerPurchase = mongoose.models.SellerPurchase || mongoose.model('SellerPurchase', sellerPurchaseSchema);
const SupplyRequest = mongoose.models.SupplyRequest || mongoose.model('SupplyRequest', supplyRequestSchema);
const SellerResponse = mongoose.models.SellerResponse || mongoose.model('SellerResponse', sellerResponseSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : true,
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secure_secret_key_12345', // Use env variable in production
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Multer Configuration for Memory Storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log(`Invalid file type for ${file.fieldname}: ${file.mimetype}`);
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadFields = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'shopImages', maxCount: 10 },
    { name: 'govtId', maxCount: 1 },
    { name: 'selfieId', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'intermediateCertificate', maxCount: 1 },
    { name: 'tenthCertificate', maxCount: 1 },
    { name: 'shopRegistration', maxCount: 1 },
    { name: 'gstRegistration', maxCount: 1 }
]);

const uploadSingle = upload.single('profilePhoto');
const uploadShopImages = upload.array('shopImages', 10);

// Helper Function to Upload File to GridFS
async function uploadFileToGridFS(file) {
    return new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(file.originalname, {
            contentType: file.mimetype
        });
        uploadStream.end(file.buffer);
        uploadStream.on('finish', () => {
            resolve(uploadStream.id.toString());
        });
        uploadStream.on('error', (err) => {
            reject(err);
        });
    });
}

// State-District Mapping
const stateDistrictMap = {
    "Telangana": ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupathi", "Chithoor"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"]
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { isLoggedIn: !!req.session.user });
});

app.get('/supplies', (req, res) => {
    res.render('supplies', { isLoggedIn: !!req.session.user });
});

app.get('/Sellers_page', (req, res) => {
    res.render('Sellers_page', { stateDistrictMap, isLoggedIn: !!req.session.user });
});

app.get('/Workers_signup', (req, res) => {
    res.render('Workers_signup', { stateDistrictMap, isLoggedIn: !!req.session.user });
});

app.get('/Cus_signup', (req, res) => {
    res.render('Cus_signup', { stateDistrictMap, isLoggedIn: !!req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { isLoggedIn: !!req.session.user });
});

app.get('/confirmation', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.redirect('/login');
    res.render('confirmation', { isLoggedIn: !!req.session.user, serviceRequest: req.session.serviceRequest || {} });
});

app.get('/suppliesform1', (req, res) => {
    if (!req.session.user || (req.session.user.role !== 'worker' && req.session.user.role !== 'customer')) return res.redirect('/login');
    const user = req.session.user;
    res.render('suppliesform1', {
        userProfile: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            email: user.email || '',
            flat: user.flat || '',
            area: user.area || '',
            landmark: user.landmark || '',
            pincode: user.pincode || '',
            town: user.town || '',
            state: user.state || '',
            district: user.district || ''
        },
        isLoggedIn: true
    });
});
app.get('/services', (req, res) => {
    res.render('services', { isLoggedIn: !!req.session.user });
});
app.get('/suppliesform2', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const requestId = req.query.requestId;
    if (req.session.user.role === 'seller' && requestId) {
        try {
            const requestData = await SupplyRequest.findById(requestId);
            if (!requestData) return res.status(404).send('Supply request not found');
            res.render('suppliesform2', { requestId, requestData, isLoggedIn: !!req.session.user });
        } catch (err) {
            res.status(500).send('Internal Server Error');
        }
    } else if (req.session.user.role === 'customer') {
        res.render('suppliesform2', { requestId: null, requestData: null, isLoggedIn: !!req.session.user });
    } else {
        return res.redirect('/login');
    }
});

app.get('/customer_dashboard', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.redirect('/login');
    const user = req.session.user;

    try {
        const [pendingRequests, inProgress, completed, purchases] = await Promise.all([
            ServiceRequest.find({ customer_id: user.id, status: 'pending' }),
            ServiceRequest.find({ customer_id: user.id, status: 'in_progress' })
                .populate('assigned_worker_id', 'firstName lastName')
                .lean()
                .then(requests => Promise.all(requests.map(async r => {
                    const wh = await WorkHistory.findOne({ worker_id: r.assigned_worker_id, job: r.service_type });
                    return { ...r, price: wh?.price };
                }))),
            ServiceRequest.find({ customer_id: user.id, status: 'completed' })
                .populate('assigned_worker_id', 'firstName lastName')
                .lean()
                .then(requests => Promise.all(requests.map(async r => {
                    const wh = await WorkHistory.findOne({ worker_id: r.assigned_worker_id, job: r.service_type });
                    return { ...r, price: wh?.price, rating: wh?.rating, feedback: wh?.feedback };
                }))),
            SellerPurchase.find({ customer_id: user.id })
                .populate('seller_id', 'shopName')
                .lean()
                .then(purchases => purchases.map(p => ({ ...p, items: p.items })))
        ]);

        res.render('customer_dashboard', {
            customerName: `${user.firstName} ${user.lastName}`.trim(),
            profilePhoto: user.profilePhoto ? `/files/${user.profilePhoto}` : '/images/default-profile.png',
            pendingRequests: pendingRequests || [],
            inProgress: inProgress || [],
            completed: completed || [],
            purchases: purchases || [],
            isLoggedIn: true
        });
    } catch (err) {
        console.error('Customer dashboard promise error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/customer_profile', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.redirect('/login');
    const user = req.session.user;
    res.render('customer_profile', {
        customerName: `${user.firstName} ${user.lastName}`.trim(),
        userProfile: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            flat: user.flat,
            area: user.area,
            landmark: user.landmark,
            pincode: user.pincode,
            town: user.town,
            state: user.state,
            district: user.district,
            profilePhoto: user.profilePhoto ? `/files/${user.profilePhoto}` : '/images/default-profile.png'
        },
        isLoggedIn: true
    });
});

app.get('/seller_dashboard', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') return res.redirect('/login');
    const sellerId = req.session.user.id;

    try {
        const seller = await Seller.findById(sellerId);
        if (!seller) return res.status(404).send('Seller not found');

        const parseAddress = (address) => {
            if (!address) return {};
            const parts = address.split(', ');
            return {
                flat: parts[0] || '',
                area: parts[1] || '',
                landmark: parts[2] || '',
                town: parts[3] || '',
                state: parts[4]?.split(' - ')[0] || '',
                pincode: parts[4]?.split(' - ')[1] || parts[5] || '',
                district: parts[6] || ''
            };
        };

        const sellerProfile = {
            name: `${seller.firstName} ${seller.lastName}`.trim(),
            email: seller.email,
            shopName: seller.shopName || 'Unnamed Shop',
            professionalPhone: seller.professionalPhone || 'Not specified',
            professionalEmail: seller.professionalEmail || 'Not specified',
            shopDescription: seller.shopDescription || '',
            shopTypes: seller.shopTypes || [],
            personalAddress: seller.personalAddress || 'Not specified',
            professionalAddress: seller.professionalAddress || 'Not specified',
            profilePhoto: seller.profilePhoto ? `/files/${seller.profilePhoto}` : '/images/default-profile.png',
            shopImages: seller.shopImages ? seller.shopImages.map(id => `/files/${id}`) : [],
            pricing: Object.fromEntries(seller.pricing),
            flatProfessional: parseAddress(seller.professionalAddress).flat,
            areaProfessional: parseAddress(seller.professionalAddress).area,
            landmarkProfessional: parseAddress(seller.professionalAddress).landmark,
            townProfessional: parseAddress(seller.professionalAddress).town,
            districtProfessional: parseAddress(seller.professionalAddress).district,
            stateProfessional: parseAddress(seller.professionalAddress).state,
            pincodeProfessional: parseAddress(seller.professionalAddress).pincode,
            flat: parseAddress(seller.personalAddress).flat,
            area: parseAddress(seller.personalAddress).area,
            landmark: parseAddress(seller.personalAddress).landmark,
            town: parseAddress(seller.personalAddress).town,
            district: parseAddress(seller.personalAddress).district,
            state: parseAddress(seller.personalAddress).state,
            pincode: parseAddress(seller.personalAddress).pincode
        };

        const [pendingPurchases, earnings, supplyRequests, notifications] = await Promise.all([
            SellerPurchase.find({ seller_id: sellerId, status: 'Pending' }),
            SellerPurchase.find({ seller_id: sellerId }).then(purchases => {
                const earnings = purchases.reduce((acc, row) => {
                    if (row.status === 'Purchased') acc.total += row.total_price;
                    else if (row.status === 'Pending') acc.incomplete += row.total_price;
                    const month = new Date(row.purchase_date).toLocaleString('default', { month: 'short', year: 'numeric' });
                    acc.monthly[month] = (acc.monthly[month] || 0) + (row.status === 'Purchased' ? row.total_price : 0);
                    return acc;
                }, { total: 0, incomplete: 0, monthly: {} });
                return earnings;
            }),
            SupplyRequest.find({ status: 'pending' }),
            Notification.find({ user_id: sellerId, role: 'seller' }).sort({ created_at: -1 }).limit(10)
        ]);

        const chartData = {
            pie: [earnings.total, earnings.incomplete],
            line: Object.entries(earnings.monthly).map(([month, amount]) => ({ month, amount }))
        };

        res.render('seller_dashboard', {
            sellerName: `${seller.firstName} ${seller.lastName}`.trim(),
            sellerProfile,
            activeSection: 'pricing',
            requests: pendingPurchases.map(p => ({
                customer: p.customer_id,
                items: p.items,
                totalPrice: p.total_price
            })),
            supplyRequests,
            subscriptionStatus: 'Active',
            daysLeft: 30,
            subscription: { active: true, daysLeft: 30 },
            earnings: { total: earnings.total, incomplete: earnings.incomplete },
            chartData,
            notifications,
            isLoggedIn: true
        });
    } catch (err) {
        console.error('Seller dashboard error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/seller_profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') return res.redirect('/login');
    try {
        const seller = await Seller.findById(req.session.user.id);
        if (!seller) return res.status(404).send('Seller not found');

        res.render('seller_profile', {
            sellerProfile: {
                sellerName: `${seller.firstName} ${seller.lastName}`.trim(),
                firstName: seller.firstName,
                lastName: seller.lastName,
                phone: seller.phone,
                email: seller.email || 'Not provided',
                shopName: seller.shopName,
                professionalPhone: seller.professionalPhone || 'Not provided',
                professionalEmail: seller.professionalEmail || 'Not provided',
                shopDescription: seller.shopDescription || '',
                shopTypes: seller.shopTypes || [],
                personalAddress: seller.personalAddress,
                professionalAddress: seller.professionalAddress,
                profilePhoto: seller.profilePhoto ? `/files/${seller.profilePhoto}` : '/images/default-profile.png',
                shopImages: seller.shopImages ? seller.shopImages.map(id => `/files/${id}`) : [],
                govtId: seller.govtId ? `/files/${seller.govtId}` : null,
                shopRegistration: seller.shopRegistration ? `/files/${seller.shopRegistration}` : null,
                gstRegistration: seller.gstRegistration ? `/files/${seller.gstRegistration}` : null,
                pricing: Object.fromEntries(seller.pricing)
            },
            isLoggedIn: true
        });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/worker_dashboard', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') return res.redirect('/login');

    try {
        const workerId = req.session.user.id;
        const jobRequests = await JobRequest.find({ worker_id: workerId, status: 'Pending' });
        const workHistory = await WorkHistory.find({ worker_id: workerId, status: 'Completed' });
        const worker = await Worker.findById(workerId);

        res.render('worker_dashboard', {
            activeSection: 'requests',
            profilePhoto: worker.profilePhoto ? `/files/${worker.profilePhoto}` : '/images/default-profile.png',
            workerName: `${worker.firstName} ${worker.lastName}`,
            jobRequests: jobRequests.map(job => ({
                id: job._id.toString(),
                header: job.header,
                customer: job.customer,
                location: job.location,
                time: job.time,
                description: job.description
            })),
            earnings: {
                total: worker.earnings.total,
                completed: worker.earnings.completed,
                pending: worker.earnings.pending
            },
            performance: {
                jobsCompleted: workHistory.length,
                positiveReviews: workHistory.length > 0 ? (workHistory.filter(w => w.rating >= 4).length / workHistory.length) * 100 : 0
            },
            workHistory: workHistory.map(work => ({
                job: work.job,
                customer: work.customer,
                date: work.date,
                price: work.price,
                status: work.status,
                rating: work.rating,
                feedback: work.feedback
            }))
        });
    } catch (err) {
        console.error('Error in /worker_dashboard:', err);
        res.status(500).send('Error loading dashboard');
    }
});

app.get('/worker_profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') return res.redirect('/login');
    try {
        const worker = await Worker.findById(req.session.user.id);
        if (!worker) return res.status(404).send('Worker not found');

        res.render('worker_profile', {
            userProfile: {
                workerName: `${worker.firstName} ${worker.lastName}`.trim(),
                firstName: worker.firstName || '',
                lastName: worker.lastName || '',
                phone: worker.phone || 'Not provided',
                email: worker.email || 'Not provided',
                professionalPhone: worker.professionalPhone || 'Not provided',
                professionalEmail: worker.professionalEmail || 'Not provided',
                yearsOfExperience: worker.yearsOfExperience || 0,
                description: worker.description || '',
                primarySkill: worker.primarySkill || 'Not specified',
                electricianSubSkills: worker.electricianSubSkills || [],
                address: worker.address || 'Not provided',
                workTiming: worker.workTiming || 'Not specified',
                profilePhoto: worker.profilePhoto ? `/files/${worker.profilePhoto}` : '/images/default-profile.png',
                govtId: worker.govtId ? `/files/${worker.govtId}` : '',
                selfieId: worker.selfieId ? `/files/${worker.selfieId}` : '',
                drivingLicense: worker.drivingLicense ? `/files/${worker.drivingLicense}` : '',
                degreeCertificate: worker.degreeCertificate ? `/files/${worker.degreeCertificate}` : '',
                intermediateCertificate: worker.intermediateCertificate ? `/files/${worker.intermediateCertificate}` : '',
                tenthCertificate: worker.tenthCertificate ? `/files/${worker.tenthCertificate}` : ''
            },
            isLoggedIn: true
        });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/admin_dashboard', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    try {
        const [totalCustomers, totalWorkers, totalSellers, customers, workers, sellers] = await Promise.all([
            Customer.countDocuments(),
            Worker.countDocuments(),
            Seller.countDocuments(),
            Customer.find().select('firstName lastName email phone flat area landmark pincode town state district'),
            Worker.find().select('firstName lastName email primarySkill phone address'),
            Seller.find().select('firstName lastName email shopName phone professionalAddress')
        ]);

        const analytics = { totalVisitors: 1000, activeUsers: 150, mostRequestedServices: "Electrical, Plumbing", totalTransactions: 500, averageRating: 4.5, avgResponseTime: "2 hours" };
        const chartData = { pie: [totalCustomers, totalWorkers, totalSellers], line: [100, 150, 200, 250, 300] };
        res.render('admin_dashboard', {
            adminName: req.session.user.firstName,
            totalCustomers, totalWorkers, totalSellers,
            customers, workers, sellers,
            totalVisitors: analytics.totalVisitors,
            activeUsers: analytics.activeUsers,
            mostRequestedServices: analytics.mostRequestedServices,
            totalTransactions: analytics.totalTransactions,
            averageRating: analytics.averageRating,
            avgResponseTime: analytics.avgResponseTime,
            chartData,
            isLoggedIn: true
        });
    } catch (err) {
        console.error('Admin dashboard error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/general_electrician_service', (req, res) => {
    res.render('general_electrician_service', { isLoggedIn: !!req.session.user });
});

app.get('/response', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer' || !req.session.serviceRequestId) return res.redirect('/login');
    const serviceRequestId = req.session.serviceRequestId;

    try {
        const serviceRequest = await ServiceRequest.findById(serviceRequestId);
        if (!serviceRequest) return res.status(500).send('Error fetching service request');

        const skillMapping = {
            'installation-setup': 'Electrician',
            'repair-maintenance': 'Electrician',
            'safety-upgrades': 'Electrician',
            'cooling-refrigeration': 'Electrician',
            'entertainment-appliances': 'Electrician',
            'power-heating': 'Electrician',
            'repairs-fixes': 'Plumber',
            'installations-replacements': 'Plumber',
            'appliance-fixture': 'Plumber',
            'driver-service': 'Driver'
        };

        const primarySkill = skillMapping[serviceRequest.service_group] || serviceRequest.service_group;
        let query = { primarySkill: new RegExp(`^${primarySkill}$`, 'i') };

        if (primarySkill === 'Electrician' && serviceRequest.service_group !== 'driver-service') {
            const subSkillMap = {
                'installation-setup': 'General Electrical',
                'repair-maintenance': 'General Electrical',
                'safety-upgrades': 'General Electrical',
                'cooling-refrigeration': 'Appliances Electrical',
                'entertainment-appliances': 'Appliances Electrical',
                'power-heating': 'Appliances Electrical'
            };
            const subSkill = subSkillMap[serviceRequest.service_group] || 'General Electrical';
            query.electricianSubSkills = subSkill;
        }

        const workers = await Worker.find(query)
            .select('_id firstName lastName profilePhoto yearsOfExperience description electricianSubSkills priceRanges rating address');

        res.render('response', { 
            serviceRequest, 
            workers: workers.map(worker => {
                // Ensure rating exists, default to 0 if undefined
                const workerData = worker._doc;
                workerData.rating = workerData.rating !== undefined ? workerData.rating : 0;
                return {
                    ...workerData,
                    id: worker._id.toString(),
                    profilePhoto: worker.profilePhoto ? `/files/${worker.profilePhoto}` : '/images/default-profile.png'
                };
            }), 
            serviceRequestId,
            isLoggedIn: !!req.session.user
        });
    } catch (err) {
        res.status(500).send('Error fetching workers');
    }
});
app.get('/seller_responses', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.redirect('/login');

    const supplyRequestId = req.query.requestId || req.session.supplyRequestId;
    if (!supplyRequestId) return res.status(400).send('No supply request specified');

    try {
        const request = await SupplyRequest.findOne({ _id: supplyRequestId, customer_id: req.session.user.id });
        if (!request) return res.status(404).send('Supply request not found');
        req.session.supplyRequestId = request._id.toString();

        if (!request.category) return res.status(400).send('Invalid supply request: Missing category');

        const sellers = await Seller.find({ shopTypes: { $in: [request.category] } })
            .select('firstName lastName shopName professionalAddress phone profilePhoto shopImages rating pricing');

        const sellerResponses = sellers.map(seller => {
            let totalPrice = 0;
            const items = request.supplies.map(item => {
                const pricePerUnit = seller.pricing.get(item.partName) || 0;
                const itemTotal = pricePerUnit * item.units;
                totalPrice += itemTotal;
                return { name: item.partName, units: item.units, price: pricePerUnit };
            });

            return {
                id: seller._id,
                name: `${seller.firstName} ${seller.lastName}`.trim(),
                shopName: seller.shopName || 'Unnamed Shop',
                location: seller.professionalAddress || 'Not provided',
                contact: seller.phone || 'Not provided',
                image: seller.profilePhoto ? `/files/${seller.profilePhoto}` : '/images/default-profile.png',
                shopImages: seller.shopImages ? seller.shopImages.map(id => `/files/${id}`) : [],
                rating: seller.rating || 0,
                totalPrice,
                supplies: items
            };
        });

        res.render('seller_response', {
            request,
            sellers: sellerResponses,
            customerName: `${req.session.user.firstName} ${req.session.user.lastName}`.trim(),
            profilePhoto: req.session.user.profilePhoto ? `/files/${req.session.user.profilePhoto}` : '/images/default-profile.png',
            isLoggedIn: true
        });
    } catch (err) {
        console.error('Error fetching sellers:', err.message);
        res.status(500).send('Error fetching sellers: ' + err.message);
    }
});

app.get('/seller_detail/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') {
        return res.redirect('/login');
    }

    const sellerId = req.params.id;
    const supplyRequestId = req.session.supplyRequestId;

    try {
        const seller = await Seller.findById(sellerId).select(
            'firstName lastName shopName professionalAddress phone profilePhoto shopImages rating pricing'
        );
        if (!seller) return res.status(404).send('Seller not found');

        const request = await SupplyRequest.findOne({ _id: supplyRequestId, customer_id: req.session.user.id });
        if (!request) return res.status(404).send('Supply request not found');

        let totalPrice = 0;
        const suppliesWithPrice = request.supplies.map(item => {
            const pricePerUnit = seller.pricing.get(item.partName) || 0;
            const itemTotal = pricePerUnit * item.units;
            totalPrice += itemTotal;
            return {
                name: item.partName,
                units: item.units,
                price: pricePerUnit,
                total: itemTotal
            };
        });

        res.render('seller_detail', {
            seller: {
                id: seller._id,
                name: `${seller.firstName} ${seller.lastName}`.trim(),
                shopName: seller.shopName,
                location: seller.professionalAddress || 'Not provided',
                contact: seller.phone || 'Not provided',
                image: seller.profilePhoto ? `/files/${seller.profilePhoto}` : '/images/default-profile.png',
                shopImages: seller.shopImages ? seller.shopImages.map(id => `/files/${id}`) : [],
                rating: seller.rating || 0,
                totalPrice: totalPrice.toFixed(2)
            },
            request,
            supplies: suppliesWithPrice,
            customerName: `${req.session.user.firstName} ${req.session.user.lastName}`.trim(),
            profilePhoto: req.session.user.profilePhoto ? `/files/${req.session.user.profilePhoto}` : '/images/default-profile.png',
            isLoggedIn: true
        });
    } catch (err) {
        console.error('Error fetching seller:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/check-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Promise.any([
            Customer.findOne({ email }),
            Seller.findOne({ email }),
            Worker.findOne({ email })
        ]);
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/check-phone', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await Promise.any([
            Customer.findOne({ phone }),
            Seller.findOne({ phone }),
            Worker.findOne({ phone })
        ]);
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/files/:fileId', async (req, res) => {
    try {
        const fileId = new ObjectId(req.params.fileId);
        const downloadStream = gfs.openDownloadStream(fileId);

        downloadStream.on('file', (file) => {
            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', `inline; filename="${file.filename}"`);
        });

        downloadStream.on('error', (err) => {
            console.error('File retrieval error:', err);
            res.status(404).json({ error: 'File not found' });
        });

        downloadStream.pipe(res);
    } catch (err) {
        console.error('Invalid file ID:', err);
        res.status(400).json({ error: 'Invalid file ID' });
    }
});

app.post('/signup', upload.any(), async (req, res) => {
    try {
        const {
            firstName, lastName, phone, email, password, professionalPhone, professionalEmail,
            yearsOfExperience, description, primarySkill, electricianSubSkills,
            flat, area, landmark, pincode, town, state, district, workTiming, role,
            priceRanges
        } = req.body;

        console.log('Signup request body:', req.body);

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate role
        if (!['worker', 'customer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check for existing user across all relevant models
        const existingUser = await Promise.any([
            Customer.findOne({ $or: [{ email }, { phone }] }),
            Worker.findOne({ $or: [{ email }, { phone }] }),
            Seller.findOne({ $or: [{ email }, { phone }] })
        ]).catch(() => null);

        if (existingUser) {
            return res.status(400).json({ error: 'Email or phone already used for another role' });
        }

        // Parse priceRanges
        let parsedPriceRanges = {};
        try {
            parsedPriceRanges = JSON.parse(priceRanges || '{}');
        } catch (err) {
            console.error('Error parsing priceRanges:', err);
            return res.status(400).json({ error: 'Invalid price ranges format' });
        }

        // Handle file uploads
        const files = req.files.reduce((acc, file) => {
            acc[file.fieldname] = file;
            return acc;
        }, {});

        // Validate required files for worker role
        if (role === 'worker') {
            if (!files.profilePhoto || !files.govtId || !files.selfieId) {
                return res.status(400).json({ error: 'Missing required files: profilePhoto, govtId, and selfieId are required for workers' });
            }
            if (primarySkill === 'Driver' && !files.drivingLicense) {
                return res.status(400).json({ error: 'Driving license is required for Driver role' });
            }
        }

        // Upload files to GridFS
        const profilePhotoId = files.profilePhoto ? await uploadFileToGridFS(files.profilePhoto) : '';
        const govtId = files.govtId ? await uploadFileToGridFS(files.govtId) : '';
        const selfieId = files.selfieId ? await uploadFileToGridFS(files.selfieId) : '';
        const drivingLicense = files.drivingLicense ? await uploadFileToGridFS(files.drivingLicense) : '';
        const degreeCertificate = files.degreeCertificate ? await uploadFileToGridFS(files.degreeCertificate) : '';
        const intermediateCertificate = files.intermediateCertificate ? await uploadFileToGridFS(files.intermediateCertificate) : '';
        const tenthCertificate = files.tenthCertificate ? await uploadFileToGridFS(files.tenthCertificate) : '';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role === 'worker') {
            newUser = new Worker({
                firstName,
                lastName,
                phone,
                email,
                password: hashedPassword,
                professionalPhone: professionalPhone || '',
                professionalEmail: professionalEmail || '',
                yearsOfExperience: parseInt(yearsOfExperience) || 0,
                description: description || '',
                primarySkill,
                electricianSubSkills: electricianSubSkills ? JSON.parse(electricianSubSkills) : [],
                address: { flat, area, landmark, pincode, town, state, district },
                workTiming,
                role,
                profilePhoto: profilePhotoId,
                govtId,
                selfieId,
                drivingLicense,
                degreeCertificate,
                intermediateCertificate,
                tenthCertificate,
                priceRanges: parsedPriceRanges,
                earnings: { total: 0, completed: 0, pending: 0 }
            });

            await newUser.save();
            console.log('Worker created:', newUser);
        } else {
            newUser = new Customer({
                firstName,
                lastName,
                phone,
                email,
                password: hashedPassword,
                flat,
                area,
                landmark,
                pincode,
                town,
                state,
                district,
                role,
                profilePhoto: profilePhotoId
            });

            await newUser.save();
            console.log('Customer created:', newUser);
        }

        // Set session and respond
        req.session.user = { id: newUser._id, role };
        res.json({ success: true });
    } catch (err) {
        console.error('Error in /signup:', err.message, err.stack);
        res.status(500).json({ error: 'Signup failed: Database error', details: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    if (emailOrPhone === 'admindashboard@gmail.com' && password === 'Admin@123') {
        req.session.user = {
            id: '0',
            email: 'admindashboard@gmail.com',
            phone: null,
            firstName: 'Admin',
            lastName: '',
            role: 'admin'
        };
        req.session.save((err) => {
            if (err) return res.status(500).json({ error: 'Session error', details: err.message });
            res.json({ success: true, message: 'Login successful', role: 'admin', user: { email: 'admindashboard@gmail.com', firstName: 'Admin' } });
        });
        return;
    }

    try {
        const user = await Promise.any([
            Customer.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] }),
            Seller.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] }),
            Worker.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] })
        ]);

        if (!user) return res.status(400).json({ error: 'Invalid email/phone or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email/phone or password' });

        req.session.user = {
            id: user._id.toString(),
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            flat: user.flat || user.personalAddress || user.address,
            area: user.area,
            landmark: user.landmark,
            pincode: user.pincode,
            town: user.town,
            state: user.state,
            district: user.district,
            profilePhoto: user.profilePhoto,
            role: user.role
        };
        req.session.save((err) => {
            if (err) return res.status(500).json({ error: 'Session error', details: err.message });
            res.json({
                success: true,
                message: 'Login successful',
                role: user.role,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePhoto: user.profilePhoto
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/update-customer-profile', uploadSingle, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });

    const { firstName, lastName, email, phone, flat, area, landmark, pincode, town, state, district } = req.body;
    const profilePhotoId = req.file ? await uploadFileToGridFS(req.file) : req.session.user.profilePhoto;

    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.session.user.id,
            {
                firstName: firstName || req.session.user.firstName,
                lastName: lastName || req.session.user.lastName,
                email: email || req.session.user.email,
                phone: phone || req.session.user.phone,
                flat: flat || req.session.user.flat || '',
                area: area || req.session.user.area || '',
                landmark: landmark || req.session.user.landmark || '',
                pincode: pincode || req.session.user.pincode || '',
                town: town || req.session.user.town || '',
                state: state || req.session.user.state || '',
                district: district || req.session.user.district || '',
                profilePhoto: profilePhotoId
            },
            { new: true }
        );

        req.session.user = {
            ...req.session.user,
            firstName: updatedCustomer.firstName,
            lastName: updatedCustomer.lastName,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            flat: updatedCustomer.flat,
            area: updatedCustomer.area,
            landmark: updatedCustomer.landmark,
            pincode: updatedCustomer.pincode,
            town: updatedCustomer.town,
            state: updatedCustomer.state,
            district: updatedCustomer.district,
            profilePhoto: updatedCustomer.profilePhoto
        };

        res.json({ success: true, message: 'Profile updated successfully', profilePhoto: profilePhotoId ? `/files/${profilePhotoId}` : null });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/save-supply-form1', async (req, res) => {
    if (!req.session.user || (req.session.user.role !== 'customer' && req.session.user.role !== 'worker')) 
        return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { firstName, lastName, phone, email, address } = req.body;
    const Model = req.session.user.role === 'customer' ? Customer : Worker;

    try {
        const updateData = req.session.user.role === 'customer' ? {
            firstName, lastName, phone, email,
            flat: address.split(',')[0] || '',
            area: address.split(',')[1] || '',
            landmark: address.split(',')[2] || '',
            pincode: address.split(',')[5] || '',
            town: address.split(',')[3] || '',
            state: address.split(',')[4] || '',
            district: address.split(',')[6] || ''
        } : {
            firstName, lastName, phone, email, address
        };

        const updatedUser = await Model.findByIdAndUpdate(req.session.user.id, updateData, { new: true });

        req.session.user = { 
            ...req.session.user, 
            firstName: updatedUser.firstName, 
            lastName: updatedUser.lastName, 
            phone: updatedUser.phone, 
            email: updatedUser.email,
            ...(req.session.user.role === 'customer' ? {
                flat: updatedUser.flat,
                area: updatedUser.area,
                landmark: updatedUser.landmark,
                pincode: updatedUser.pincode,
                town: updatedUser.town,
                state: updatedUser.state,
                district: updatedUser.district
            } : { address: updatedUser.address })
        };

        res.json({ success: true, message: 'Form data saved' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }
});

app.post('/submit-suppliesform2', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Please log in' });
    }
    const { category, supplies, additional } = req.body;

    if (!Array.isArray(supplies) || supplies.length === 0 || supplies.some(item => !item.partName || !item.units)) {
        return res.status(400).json({ success: false, error: 'Supplies must be a non-empty array with partName and units' });
    }

    try {
        const supplyRequest = new SupplyRequest({
            customer_id: req.session.user.id,
            category,
            supplies,
            additional: additional || '',
            created_at: new Date().toISOString(),
            status: 'pending'
        });

        const savedRequest = await supplyRequest.save();
        req.session.supplyRequestId = savedRequest._id.toString();
        res.json({ success: true, redirect: `/seller_responses?requestId=${savedRequest._id}` });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.post('/submit-seller-response', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Please log in' });
    }
    const { requestId, supplies } = req.body;
    const totalPrice = supplies.reduce((sum, item) => sum + (item.units * item.price), 0);

    try {
        const sellerResponse = new SellerResponse({
            supply_request_id: requestId,
            seller_id: req.session.user.id,
            supplies,
            total_price: totalPrice,
            created_at: new Date().toISOString()
        });

        await sellerResponse.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.post('/update-seller-profile', uploadSingle, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') return res.status(403).json({ error: 'Unauthorized' });
    const { 
        firstName, lastName, email, phone, shopName, professionalPhone, professionalEmail, 
        shopDescription, shopTypes, personalAddress, professionalAddress 
    } = req.body;
    const profilePhotoId = req.file ? await uploadFileToGridFS(req.file) : req.session.user.profilePhoto;

    try {
        const seller = await Seller.findById(req.session.user.id);
        const updatedSeller = await Seller.findByIdAndUpdate(
            req.session.user.id,
            {
                firstName, lastName, email, phone, shopName,
                professionalPhone: professionalPhone || null,
                professionalEmail: professionalEmail || null,
                shopDescription: shopDescription || '',
                shopTypes: shopTypes ? JSON.parse(shopTypes) : [],
                personalAddress, professionalAddress,
                profilePhoto: profilePhotoId,
                pricing: seller.pricing
            },
            { new: true }
        );

        req.session.user = { 
            ...req.session.user, 
            firstName: updatedSeller.firstName, 
            lastName: updatedSeller.lastName, 
            email: updatedSeller.email, 
            phone: updatedSeller.phone, 
            shopName: updatedSeller.shopName,
            professionalPhone: updatedSeller.professionalPhone,
            professionalEmail: updatedSeller.professionalEmail,
            shopDescription: updatedSeller.shopDescription,
            shopTypes: updatedSeller.shopTypes,
            personalAddress: updatedSeller.personalAddress,
            professionalAddress: updatedSeller.professionalAddress,
            profilePhoto: updatedSeller.profilePhoto 
        };
        res.json({ success: true, message: 'Profile updated successfully', profilePhoto: profilePhotoId ? `/files/${profilePhotoId}` : null });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/upload-shop-images', uploadShopImages, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') return res.status(403).json({ error: 'Unauthorized' });
    const newImageIds = await Promise.all(req.files.map(file => uploadFileToGridFS(file)));

    try {
        const seller = await Seller.findById(req.session.user.id);
        const updatedImages = [...(seller.shopImages || []), ...newImageIds];
        await Seller.findByIdAndUpdate(req.session.user.id, { shopImages: updatedImages });
        res.json({ success: true, message: 'Shop images uploaded successfully', shopImages: updatedImages.map(id => `/files/${id}`) });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/update-worker-profile', uploadSingle, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') return res.status(401).json({ error: 'Unauthorized' });
    const {
        firstName, lastName, email, phone, professionalPhone, professionalEmail, yearsOfExperience,
        description, primarySkill, electricianSubSkills, flat, area, landmark, pincode, town, state, district, workTiming
    } = req.body;
    const address = `${flat}, ${area}, ${landmark}, ${town}, ${state} - ${pincode}, ${district}`;
    const profilePhotoId = req.file ? await uploadFileToGridFS(req.file) : req.session.user.profilePhoto;

    try {
        const updatedWorker = await Worker.findByIdAndUpdate(
            req.session.user.id,
            {
                firstName, lastName, email, phone, professionalPhone: professionalPhone || null,
                professionalEmail: professionalEmail || null, yearsOfExperience, description: description || '',
                primarySkill, electricianSubSkills: electricianSubSkills ? JSON.parse(electricianSubSkills) : [],
                address, workTiming, profilePhoto: profilePhotoId
            },
            { new: true }
        );

        req.session.user = { 
            ...req.session.user, 
            firstName: updatedWorker.firstName, 
            lastName: updatedWorker.lastName, 
            email: updatedWorker.email, 
            phone: updatedWorker.phone, 
            professionalPhone: updatedWorker.professionalPhone,
            professionalEmail: updatedWorker.professionalEmail,
            yearsOfExperience: updatedWorker.yearsOfExperience,
            description: updatedWorker.description,
            primarySkill: updatedWorker.primarySkill,
            electricianSubSkills: updatedWorker.electricianSubSkills,
            address: updatedWorker.address,
            workTiming: updatedWorker.workTiming,
            profilePhoto: updatedWorker.profilePhoto 
        };
        res.json({ success: true, message: 'Profile updated successfully', profilePhoto: profilePhotoId ? `/files/${profilePhotoId}` : null });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/book-service', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.redirect('/login');
    const { zipcode, serviceGroup, serviceType, date, time, details } = req.body;
    const user = req.session.user;

    req.session.serviceRequest = {
        zipcode: zipcode || '',
        serviceGroup: serviceGroup || 'unknown',
        serviceType: serviceType || 'unknown',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '00:00',
        details: details || 'No details provided',
        customerName: `${user.firstName} ${user.lastName}`.trim() || 'Unknown Customer',
        phone: user.phone || 'Not provided',
        email: user.email || 'Not provided',
        address: `${user.flat || ''}, ${user.area || ''}, ${user.landmark || ''}, ${user.town || ''}, ${user.state || ''} - ${user.pincode || ''}, ${user.district || ''}`.trim() || 'Not provided'
    };

    res.render('confirmation', {
        isLoggedIn: true,
        serviceRequest: req.session.serviceRequest
    });
});

app.post('/confirm-service', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer' || !req.session.serviceRequest) return res.redirect('/login');
    const { phone, address } = req.body;
    const serviceRequest = {
        ...req.session.serviceRequest,
        phone: phone || req.session.serviceRequest.phone,
        address: address || req.session.serviceRequest.address
    };

    try {
        const newServiceRequest = new ServiceRequest({
            customer_id: req.session.user.id,
            customer_name: serviceRequest.customerName,
            phone: serviceRequest.phone,
            email: serviceRequest.email,
            address: serviceRequest.address,
            zipcode: serviceRequest.zipcode,
            service_group: serviceRequest.serviceGroup,
            service_type: serviceRequest.serviceType,
            date: serviceRequest.date,
            time: serviceRequest.time,
            details: serviceRequest.details
        });

        const savedRequest = await newServiceRequest.save();
        req.session.serviceRequestId = savedRequest._id.toString();
        delete req.session.serviceRequest;
        req.session.save((err) => {
            if (err) return res.status(500).json({ error: 'Session error' });
            res.redirect('/response');
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }
});


// Modified /send-request Route
app.post('/send-request', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'customer') return res.status(401).json({ error: 'Unauthorized' });
    const { workerIds, serviceRequestId } = req.body;

    if (!ObjectId.isValid(serviceRequestId)) {
        return res.status(400).json({ success: false, error: 'Invalid service request ID' });
    }

    const workerIdArray = Array.isArray(workerIds) ? workerIds : [workerIds];
    if (!workerIdArray || workerIdArray.length === 0 || workerIdArray.some(id => !id || !ObjectId.isValid(id))) {
        return res.status(400).json({ success: false, error: 'Invalid or missing worker ID(s)' });
    }

    try {
        const serviceRequest = await ServiceRequest.findOne({ _id: serviceRequestId, customer_id: req.session.user.id });
        if (!serviceRequest) return res.status(400).json({ error: 'Service request not found' });

        const jobRequests = workerIdArray.map(workerId => ({
            worker_id: workerId,
            header: serviceRequest.service_type || 'Unknown Service',
            customer: serviceRequest.customer_name || 'Unknown Customer',
            location: serviceRequest.address || 'Not provided',
            time: `${serviceRequest.date || 'Not specified'} ${serviceRequest.time || 'Not specified'}`,
            description: serviceRequest.details || 'No description',
            service_request_id: serviceRequestId
        }));

        await JobRequest.insertMany(jobRequests);

        // Create notifications for workers
        const notifications = workerIdArray.map(workerId => ({
            user_id: workerId,
            role: 'worker',
            message: `New job request for ${serviceRequest.service_type} from ${serviceRequest.customer_name}`,
            created_at: new Date().toISOString(),
            is_read: 0
        }));
        await Notification.insertMany(notifications);

        res.json({ success: true, message: 'Request(s) sent successfully' });
    } catch (err) {
        console.error('Error in /send-request:', err);
        res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }
});

app.post('/api/worker/accept-request', async (req, res) => {
    const { requestId, price } = req.body;
    if (!req.session.user || req.session.user.role !== 'worker') return res.status(401).json({ error: 'Unauthorized' });

    try {
        const jobRequest = await JobRequest.findById(requestId);
        if (!jobRequest) return res.status(404).json({ error: 'Job request not found' });

        if (!price || price <= 0) {
            return res.status(400).json({ error: 'Invalid price: Price must be greater than 0' });
        }

        jobRequest.status = 'Accepted';
        jobRequest.price = price;
        await jobRequest.save();

        const serviceRequest = await ServiceRequest.findById(jobRequest.service_request_id);
        if (!serviceRequest) return res.status(404).json({ error: 'Service request not found' });
        serviceRequest.assigned_worker_id = jobRequest.worker_id;
        serviceRequest.status = 'in_progress';
        serviceRequest.price = price;
        await serviceRequest.save();

        const worker = await Worker.findById(jobRequest.worker_id);
        if (worker) {
            worker.earnings.pending += price;
            worker.earnings.total = worker.earnings.completed + worker.earnings.pending;
            await worker.save();
        }

        // Notify customer
        const notification = new Notification({
            user_id: serviceRequest.customer_id,
            role: 'customer',
            message: `Your request for ${serviceRequest.service_type} has been accepted by ${worker.firstName} ${worker.lastName} for ₹${price}`,
            created_at: new Date().toISOString(),
            is_read: 0
        });
        await notification.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Error in /api/worker/accept-request:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.post('/complete-work', async (req, res) => {
    const { serviceRequestId, rating, feedback } = req.body;
    if (!req.session.user || req.session.user.role !== 'customer') {
        return res.status(401).json({ error: 'Unauthorized: Not logged in as a customer' });
    }

    try {
        if (!serviceRequestId || typeof rating !== 'number' || rating < 1 || rating > 5 || !feedback || typeof feedback !== 'string') {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const serviceRequest = await ServiceRequest.findById(serviceRequestId);
        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        if (serviceRequest.customer_id.toString() !== req.session.user.id) {
            return res.status(403).json({ error: 'Forbidden: You do not own this service request' });
        }

        if (serviceRequest.status === 'completed') {
            return res.status(400).json({ error: 'Service request already completed' });
        }

        serviceRequest.status = 'completed';
        serviceRequest.rating = rating;
        serviceRequest.feedback = feedback;
        await serviceRequest.save();

        const jobRequest = await JobRequest.findOne({ service_request_id: serviceRequestId, status: 'Accepted' });
        if (jobRequest) {
            const workHistoryEntry = await WorkHistory.create({
                worker_id: jobRequest.worker_id,
                job: serviceRequest.service_type,
                customer: serviceRequest.customer_name,
                date: new Date().toISOString().split('T')[0],
                price: `₹${serviceRequest.price.toFixed(2)}`,
                status: 'Completed',
                rating,
                feedback
            });

            await JobRequest.deleteOne({ _id: jobRequest._id });

            const worker = await Worker.findById(jobRequest.worker_id);
            if (worker) {
                worker.earnings.pending -= serviceRequest.price;
                worker.earnings.completed += serviceRequest.price;
                worker.earnings.total = worker.earnings.completed + worker.earnings.pending;

                const workHistories = await WorkHistory.find({ worker_id: worker._id, status: 'Completed' });
                const averageRating = workHistories.length > 0
                    ? workHistories.reduce((sum, wh) => sum + (wh.rating || 0), 0) / workHistories.length
                    : 0;
                worker.rating = averageRating;

                await worker.save();

                // Notify worker
                const notification = new Notification({
                    user_id: worker._id,
                    role: 'worker',
                    message: `Your job ${serviceRequest.service_type} for ${serviceRequest.customer_name} has been completed. Rating: ${rating}/5`,
                    created_at: new Date().toISOString(),
                    is_read: 0
                });
                await notification.save();
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error in /complete-work:', err.message, err.stack);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});


app.post('/api/accept-job', async (req, res) => {
    const { jobId, price } = req.body;
    if (!req.session.user || req.session.user.role !== 'worker') return res.status(401).json({ error: 'Unauthorized' });

    try {
        const jobRequest = await JobRequest.findById(jobId);
        if (!jobRequest) return res.status(404).json({ error: 'Job request not found' });

        // Update JobRequest status
        jobRequest.status = 'Accepted';
        jobRequest.price = price;
        await jobRequest.save();

        // Update ServiceRequest to assign the worker and set price
        const serviceRequest = await ServiceRequest.findById(jobRequest.service_request_id);
        if (!serviceRequest) return res.status(404).json({ error: 'Service request not found' });
        serviceRequest.worker_id = jobRequest.worker_id;
        serviceRequest.price = price;
        serviceRequest.status = 'In Progress';
        await serviceRequest.save();

        // Update Worker's Pending Earnings
        const worker = await Worker.findById(jobRequest.worker_id);
        if (worker) {
            worker.earnings.pending += price;
            worker.earnings.total = worker.earnings.completed + worker.earnings.pending;
            await worker.save();
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error in /api/accept-job:', err);
        res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }
});

app.post('/api/reject-job', async (req, res) => {
    const { jobId } = req.body;
    if (!req.session.user || req.session.user.role !== 'worker') return res.status(401).json({ error: 'Unauthorized' });

    try {
        const jobRequest = await JobRequest.findByIdAndDelete(jobId);
        if (!jobRequest) return res.status(404).json({ error: 'Job request not found' });

        res.json({ success: true });
    } catch (err) {
        console.error('Error in /api/reject-job:', err);
        res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }
});

app.post('/worker-complete-job', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') return res.status(401).json({ error: 'Unauthorized' });
    const { workId } = req.body;
    const workerId = req.session.user.id;

    try {
        const result = await WorkHistory.findOneAndUpdate(
            { _id: workId, worker_id: workerId, status: 'Pending' },
            { status: 'Worker_Confirmed' }
        );
        if (!result) return res.status(400).json({ error: 'Work not found or already confirmed' });
        res.json({ success: true, message: 'Work completion requested' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});
// Fetch worker earnings
app.get('/api/worker/earnings', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const worker = await Worker.findById(req.session.user.id);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        res.json({ success: true, earnings: worker.earnings });
    } catch (err) {
        console.error('Error fetching worker earnings:', err.message, err.stack);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.get('/api/worker/work-history', async (req, res) => {
    
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const workHistory = await WorkHistory.find({ worker_id: req.session.user.id, status: 'Completed' }).sort({ date: -1 });
        const formattedWorkHistory = workHistory.map(work => ({
            job: work.job,
            customer: work.customer,
            date: work.date,
            price: work.price,
            rating: work.rating,
            feedback: work.feedback
        }));
        res.json({ success: true, workHistory: formattedWorkHistory });
    } catch (err) {
        console.error('Error fetching work history:', err.message, err.stack);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Fetch worker requests
app.get('/api/worker/requests', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const jobRequests = await JobRequest.find({ worker_id: req.session.user.id }).populate('service_request_id');
        const requests = jobRequests.map(jr => ({
            id: jr._id.toString(),
            service_type: jr.service_request_id ? jr.service_request_id.service_type : jr.header,
            customer_name: jr.service_request_id ? jr.service_request_id.customer_name : jr.customer,
            location: jr.service_request_id ? jr.service_request_id.address : jr.location,
            time: jr.service_request_id ? `${jr.service_request_id.date} ${jr.service_request_id.time}` : jr.time,
            description: jr.service_request_id ? jr.service_request_id.details : jr.description,
            price: jr.price || 0,
            status: jr.status
        }));
        res.json({ success: true, requests });
    } catch (err) {
        console.error('Error fetching worker requests:', err.message, err.stack);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.get('/api/service-details/:id', async (req, res) => {
    const serviceId = req.params.id;
    try {
        const serviceRequest = await ServiceRequest.findById(serviceId).select('assigned_worker_id');
        if (!serviceRequest) return res.status(400).json({ error: 'Service not found' });

        const worker = await Worker.findById(serviceRequest.assigned_worker_id).select('firstName lastName');
        const workHistory = await WorkHistory.findOne({ worker_id: serviceRequest.assigned_worker_id, job: (await ServiceRequest.findById(serviceId)).service_type });

        res.json({ workerName: `${worker.firstName} ${worker.lastName}`, price: workHistory.price });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/save-pricing', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const pricing = req.body;
    if (!pricing || typeof pricing !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid pricing data' });
    }

    try {
        await Seller.findByIdAndUpdate(req.session.user.id, { pricing });
        res.json({ success: true, message: 'Pricing saved successfully' });
    } catch (err) {
        console.error('Error saving pricing:', err.message);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.post('/remove-customer', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Unauthorized' });
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    try {
        const result = await Customer.deleteOne({ email });
        if (result.deletedCount === 0) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.json({ success: true, message: 'Customer removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.post('/remove-worker', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Unauthorized' });
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    try {
        const worker = await Worker.findOne({ email });
        if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });
        await Promise.all([
            JobRequest.deleteMany({ worker_id: worker._id }),
            WorkHistory.deleteMany({ worker_id: worker._id }),
            Worker.deleteOne({ _id: worker._id })
        ]);
        res.json({ success: true, message: 'Worker removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.post('/remove-seller', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Unauthorized' });
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    try {
        const result = await Seller.deleteOne({ email });
        if (result.deletedCount === 0) return res.status(404).json({ success: false, error: 'Seller not found' });
        res.json({ success: true, message: 'Seller removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});