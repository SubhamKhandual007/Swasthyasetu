const express = require("express");
const mongoose = require("mongoose");
const Bill = require("../models/Bill");

const router = express.Router();

// Create a new bill
router.post("/", async (req, res) => {
  try {
    const { patientId, hospital, service, amount, currency, status, paymentMethod, transactionId, notes } = req.body;

    if (!patientId || !hospital || !service || !amount) {
      return res.status(400).json({ error: "patientId, hospital, service and amount are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "Invalid patientId" });
    }

    const bill = new Bill({
      patientId,
      hospital,
      service,
      amount: Number(amount),
      currency: currency || "INR",
      status: status || "Pending",
      paymentMethod,
      transactionId,
      notes,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all bills for a patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "Invalid patientId" });
    }

    const bills = await Bill.find({ patientId }).sort({ date: -1 });
    res.status(200).json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all bills (Admin)
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    res.status(200).json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update bill status / payment info
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid bill id" });
    }

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
    }

    const bill = await Bill.findByIdAndUpdate(id, updates, { new: true });
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.status(200).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

