const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const DoctorProfile = require("../models/DoctorProfile");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = 'uploads/';
    if (file.fieldname === 'profilePhoto') dir += 'doctors/profile/';
    else if (file.fieldname === 'medCouncilCert') dir += 'doctors/certificates/';
    else if (file.fieldname === 'medicalLicense') dir += 'doctors/licenses/';
    else if (file.fieldname === 'digitalSignature') dir += 'doctors/signatures/';
    else if (file.fieldname === 'idProof') dir += 'doctors/idproof/';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Files must be PDF, JPG, or PNG'));
    }
  },
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'medCouncilCert', maxCount: 1 },
  { name: 'medicalLicense', maxCount: 1 },
  { name: 'digitalSignature', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
]);

// Middleware to handle file uploads
const handleUploads = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Routes for Doctor Profile
router.post("/doctors", handleUploads, async (req, res) => {
  const doctorData = req.body;

  // Basic validation for required fields
  const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'dob', 'gender', 'medicalRegNumber', 'specialization', 'agreementConsent'];
  const missingFields = requiredFields.filter(field => !doctorData[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  // Parse array and object fields
  ['degrees', 'additionalCertifications', 'currentWorkplaces', 'clinicDetails', 'workSchedule',
   'consultationModes', 'languagesSpoken', 'paymentModesAccepted']
    .forEach(field => {
      if (typeof doctorData[field] === "string") doctorData[field] = JSON.parse(doctorData[field] || "[]");
    });
  if (typeof doctorData.bankDetails === "string") doctorData.bankDetails = JSON.parse(doctorData.bankDetails || "{}");

  // Handle file uploads
  if (req.files) {
    if (req.files.profilePhoto) doctorData.profilePhoto = `/uploads/doctors/profile/${req.files.profilePhoto[0].filename}`;
    if (req.files.medCouncilCert) doctorData.medCouncilCert = `/uploads/doctors/certificates/${req.files.medCouncilCert[0].filename}`;
    if (req.files.medicalLicense) doctorData.medicalLicense = `/uploads/doctors/licenses/${req.files.medicalLicense[0].filename}`;
    if (req.files.digitalSignature) doctorData.digitalSignature = `/uploads/doctors/signatures/${req.files.digitalSignature[0].filename}`;
    if (req.files.idProof) doctorData.idProof = `/uploads/doctors/idproof/${req.files.idProof[0].filename}`;
  }

  // Process boolean and number fields
  ['feeVariesByComplexity', 'emergencyAvailability', 'availability24_7', 'onCallConsultation',
   'followUpDiscount', 'referralProgram', 'connectedHospitalDatabase', 'medicalRecordAccess',
   'allowPatientReviews', 'publicProfileVisibility', 'agreementConsent']
    .forEach(field => doctorData[field] = doctorData[field] === "true" || doctorData[field] === true);
  ['yearsOfExperience', 'consultationFeeOnline', 'consultationFeeOffline', 'maxPatientsPerDay', 'followUpDiscountPercentage']
    .forEach(field => doctorData[field] = parseFloat(doctorData[field]) || 0);
  if (doctorData.dob) doctorData.dob = new Date(doctorData.dob);

  try {
    const newDoctor = new DoctorProfile(doctorData);
    await newDoctor.save();
    res.status(201).json({ message: "Doctor registered successfully", doctor: newDoctor });
  } catch (err) {
    console.error('Error saving doctor:', err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.get("/doctors", async (req, res) => {
  try {
    const doctors = await DoctorProfile.find();
    res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/doctors/:id", async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/doctors/:id", handleUploads, async (req, res) => {
  const doctorData = req.body;

  // Parse array and object fields
  ['degrees', 'additionalCertifications', 'currentWorkplaces', 'clinicDetails', 'workSchedule',
   'consultationModes', 'languagesSpoken', 'paymentModesAccepted']
    .forEach(field => {
      if (typeof doctorData[field] === "string") doctorData[field] = JSON.parse(doctorData[field] || "[]");
    });
  if (typeof doctorData.bankDetails === "string") doctorData.bankDetails = JSON.parse(doctorData.bankDetails || "{}");

  // Handle file uploads
  if (req.files) {
    if (req.files.profilePhoto) doctorData.profilePhoto = `/uploads/doctors/profile/${req.files.profilePhoto[0].filename}`;
    if (req.files.medCouncilCert) doctorData.medCouncilCert = `/uploads/doctors/certificates/${req.files.medCouncilCert[0].filename}`;
    if (req.files.medicalLicense) doctorData.medicalLicense = `/uploads/doctors/licenses/${req.files.medicalLicense[0].filename}`;
    if (req.files.digitalSignature) doctorData.digitalSignature = `/uploads/doctors/signatures/${req.files.digitalSignature[0].filename}`;
    if (req.files.idProof) doctorData.idProof = `/uploads/doctors/idproof/${req.files.idProof[0].filename}`;
  }

  // Process boolean and number fields
  ['feeVariesByComplexity', 'emergencyAvailability', 'availability24_7', 'onCallConsultation',
   'followUpDiscount', 'referralProgram', 'connectedHospitalDatabase', 'medicalRecordAccess',
   'allowPatientReviews', 'publicProfileVisibility', 'agreementConsent']
    .forEach(field => doctorData[field] = doctorData[field] === "true" || doctorData[field] === true);
  ['yearsOfExperience', 'consultationFeeOnline', 'consultationFeeOffline', 'maxPatientsPerDay', 'followUpDiscountPercentage']
    .forEach(field => doctorData[field] = parseFloat(doctorData[field]) || 0);

  if (doctorData.dob) doctorData.dob = new Date(doctorData.dob);

  try {
    const updatedDoctor = await DoctorProfile.findByIdAndUpdate(
      req.params.id,
      { ...doctorData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.delete("/doctors/:id", async (req, res) => {
  try {
    const deletedDoctor = await DoctorProfile.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
