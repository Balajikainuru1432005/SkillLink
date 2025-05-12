const express = require('express');
const router = express.Router();
const multer = require('multer');
const Seller = require('./models/Seller'); // Adjust path to your Seller schema
const Worker = require('./models/Worker'); // Adjust path to your Worker schema

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Email uniqueness check
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const seller = await Seller.findOne({ email });
        const worker = await Worker.findOne({ email });
        res.json({ exists: !!(seller || worker) });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Signup route for both Seller and Worker
router.post('/signup', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'shopImages', maxCount: 10 }, // Seller-specific
    { name: 'govtId', maxCount: 1 },
    { name: 'shopRegistration', maxCount: 1 }, // Seller-specific
    { name: 'gstRegistration', maxCount: 1 }, // Seller-specific
    { name: 'selfieId', maxCount: 1 }, // Worker-specific
    { name: 'drivingLicense', maxCount: 1 }, // Worker-specific (optional)
    { name: 'studyCertificates', maxCount: 10 } // Worker-specific (dynamic)
]), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, role, shopName, shopTypes, primarySkill, ...otherFields } = req.body;
        const files = req.files;

        if (role === 'seller') {
            // Seller signup logic
            const sellerData = {
                firstName,
                lastName,
                email,
                phone,
                password, // Hash this in production!
                shopName,
                shopTypes: shopTypes ? JSON.parse(shopTypes) : [],
                profilePhoto: files.profilePhoto ? files.profilePhoto[0].path : null,
                shopImages: files.shopImages ? files.shopImages.map(file => file.path) : [],
                govtId: files.govtId ? files.govtId[0].path : null,
                shopRegistration: files.shopRegistration ? files.shopRegistration[0].path : null,
                gstRegistration: files.gstRegistration ? files.gstRegistration[0].path : null,
                ...otherFields
            };
            const seller = new Seller(sellerData);
            await seller.save();
            res.json({ success: true, message: 'Seller signup successful' });
        } else if (role === 'worker') {
            // Worker signup logic
            const workerData = {
                firstName,
                lastName,
                email,
                phone,
                password, // Hash this in production!
                primarySkill,
                profilePhoto: files.profilePhoto ? files.profilePhoto[0].path : null,
                govtId: files.govtId ? files.govtId[0].path : null,
                selfieId: files.selfieId ? files.selfieId[0].path : null,
                drivingLicense: files.drivingLicense ? files.drivingLicense[0].path : null,
                studyCertificates: files.studyCertificates ? files.studyCertificates.map(file => file.path) : [],
                ...otherFields
            };
            const worker = new Worker(workerData);
            await worker.save();
            res.json({ success: true, message: 'Worker signup successful' });
        } else {
            res.status(400).json({ error: 'Invalid role' });
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;