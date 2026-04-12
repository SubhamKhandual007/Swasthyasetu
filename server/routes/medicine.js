const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzePrescription } = require('../utils/prescriptionAnalyzer');

// Ensure uploads directory exists
const uploadDir = 'uploads/prescriptions/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for prescriptions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `prescription-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|doc|docx/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/pdf' || 
                   file.mimetype === 'application/msword' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed!'));
    }
  },
});

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ msg: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Medicine not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/medicines
// @desc    Add a new medicine
// @access  Admin Placeholder (You'll want to add actual auth middleware later)
router.post('/', async (req, res) => {
  const { name, description, price, stock, imageUrl, category } = req.body;

  try {
    const newMedicine = new Medicine({
      name,
      description,
      price,
      stock,
      imageUrl,
      category
    });

    const medicine = await newMedicine.save();
    res.json(medicine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update a medicine
// @access  Admin Placeholder
router.put('/:id', async (req, res) => {
  const { name, description, price, stock, imageUrl, category } = req.body;

  // Build medicine object
  const medicineFields = {};
  if (name) medicineFields.name = name;
  if (description) medicineFields.description = description;
  if (price !== undefined) medicineFields.price = price;
  if (stock !== undefined) medicineFields.stock = stock;
  if (imageUrl) medicineFields.imageUrl = imageUrl;
  if (category) medicineFields.category = category;

  try {
    let medicine = await Medicine.findById(req.params.id);

    if (!medicine) return res.status(404).json({ msg: 'Medicine not found' });

    medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: medicineFields },
      { new: true }
    );

    res.json(medicine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine
// @access  Admin Placeholder
router.delete('/:id', async (req, res) => {
  try {
    // Note: in mongoose 8+, use findByIdAndDelete or deleteOne
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ msg: 'Medicine not found' });
    }

    res.json({ msg: 'Medicine removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Medicine not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/medicines/scan-prescription
// @desc    Scan a prescription and extract medicines (Mock)
// @access  Public
router.post('/scan-prescription', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a prescription file' });
    }

    // For this demo, we'll simulate extracted text based on the filename or a default
    let simulatedText = "Rx\nTab. Paracetamol 500mg\nTake twice a day for 3 days.\nDiagnosis: Fever and Body Ache\nDr. Smith";
    
    if (req.file.originalname.toLowerCase().includes('cert')) {
        simulatedText = "University Completion Certificate\nThis is to certify that John Doe has completed the course.";
    } else if (req.file.originalname.toLowerCase().includes('cough')) {
        simulatedText = "Rx\nSyp. Corex 100ml\n10ml at night\nDiagnosis: Dry Cough";
    }

    const analysis = analyzePrescription(simulatedText);

    if (!analysis.is_prescription) {
        return res.json({
            message: analysis.message,
            is_prescription: false,
            disease: null,
            medicines: [],
            dosage: []
        });
    }

    // Map extracted medicine names to actual database objects if possible
    const allMedicines = await Medicine.find();
    const matchedMedicines = analysis.medicines.map(medName => {
        return allMedicines.find(m => m.name.toLowerCase().includes(medName.toLowerCase())) || { name: medName, price: 0, is_manual: true };
    });

    setTimeout(() => {
        res.json({
            message: 'Prescription scanned successfully',
            is_prescription: true,
            file: req.file.path,
            extractedMedicines: matchedMedicines,
            diagnosis: analysis.disease,
            dosage: analysis.dosage
        });
    }, 2000); // Add a small delay for "scanning" effect
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during prescription scanning' });
  }
});

module.exports = router;
