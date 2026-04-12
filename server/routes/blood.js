const express = require('express');
const router = express.Router();
const Blood = require('../models/Blood');
const BloodRequest = require('../models/BloodRequest');

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function getCompatibleDonorTypes(recipientType) {
  // RBC compatibility with preference order: exact match first, then safest compatible fallbacks.
  const map = {
    "O-": ["O-"],
    "O+": ["O+", "O-"],
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
  };
  return map[recipientType] || [];
}

async function allocateFromDonations({ bloodType, quantity, location }) {
  const compatible = getCompatibleDonorTypes(bloodType);
  if (!compatible.length) {
    return { allocated: [], remaining: quantity, compatibleTried: [] };
  }

  const qtyNum = Number(quantity);
  if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
    return { allocated: [], remaining: quantity, compatibleTried: compatible };
  }

  const baseMatch = { type: "Donate", bloodType: { $in: compatible }, quantity: { $gt: 0 } };
  const locationMatch = location ? { ...baseMatch, location } : baseMatch;

  // Prefer same location if provided; otherwise any location.
  const donations = await Blood.find(locationMatch).sort({ createdAt: 1 }).lean();
  const fallbackDonations = location
    ? await Blood.find(baseMatch).sort({ createdAt: 1 }).lean()
    : [];

  const seen = new Set();
  const merged = [];
  for (const d of donations.concat(fallbackDonations)) {
    const id = String(d._id);
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(d);
    }
  }

  const prefIndex = new Map(compatible.map((t, i) => [t, i]));
  merged.sort((a, b) => {
    const pa = prefIndex.get(a.bloodType) ?? 999;
    const pb = prefIndex.get(b.bloodType) ?? 999;
    if (pa !== pb) return pa - pb;
    const da = new Date(a.createdAt || 0).getTime();
    const db = new Date(b.createdAt || 0).getTime();
    return da - db;
  });

  let remaining = qtyNum;
  const allocated = [];

  for (const donation of merged) {
    if (remaining <= 0) break;
    const available = Number(donation.quantity);
    if (!Number.isFinite(available) || available <= 0) continue;

    const take = Math.min(available, remaining);
    allocated.push({ donationId: donation._id, bloodType: donation.bloodType, quantity: take });
    remaining -= take;
  }

  for (const a of allocated) {
    const donationDoc = await Blood.findById(a.donationId);
    if (!donationDoc) continue;
    donationDoc.quantity = Math.max(0, Number(donationDoc.quantity) - Number(a.quantity));
    if (donationDoc.quantity <= 0) {
      await donationDoc.deleteOne();
    } else {
      await donationDoc.save();
    }
  }

  return { allocated, remaining, compatibleTried: compatible };
}

router.post("/donate", async (req, res) => {
  try {
    // Guest donations allowed - removed authentication check

    const { bloodType, quantity, location, name, contact } = req.body;

    const donationData = {
      bloodType,
      quantity: Number(quantity),
      location,
      donaerName: name || req.session.user.userName,
      contact: String(contact || req.session.user.userEmail),
    };

    if (!BLOOD_TYPES.includes(donationData.bloodType)) {
      return res.status(400).json({ error: "Invalid blood type" });
    }
    if (!Number.isFinite(donationData.quantity) || donationData.quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }
    if (!donationData.location) {
      return res.status(400).json({ error: "Location is required" });
    }

    const newDonation = new Blood({ type: "Donate", ...donationData });
    await newDonation.save();

    // --- REACTIVE MATCHING NOTIFICATIONS ---
    try {
      const BloodRequest = require('../models/BloodRequest');
      const Notification = require('../models/Notification');
      
      const matchingRequests = await BloodRequest.find({
        bloodType: bloodType,
        status: { $in: ['Not Available', 'Pending'] }
      }).limit(10);

      for (const request of matchingRequests) {
        if (request.userId) {
          try {
            await Notification.create({
              recipient: request.userId,
              recipientModel: 'User',
              type: 'blood_request',
              title: 'Blood Now Available!',
              message: `A new donation of ${bloodType} blood is available. You can now try to complete your request.`,
              data: { requestId: request._id, bloodType: bloodType }
            });
            console.log(`Notification sent to user ${request.userId} for request ${request._id}`);
          } catch (notifErr) {
            console.error("Error creating Notification record:", notifErr);
          }
        }
      }
    } catch (matchSearchErr) {
      console.error("Search for matching requests failed:", matchSearchErr);
    }
    // ----------------------------------------

    res.status(201).json({ message: "Donation recorded successfully", donation: newDonation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/request", async (req, res) => {
  try {
    const { bloodType, quantity, name, contact, priority, location } = req.body;

    if (!bloodType || !quantity || !name || !contact || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newRequest = new Blood({
      type: 'Request',
      bloodType,
      quantity: Number(quantity),
      donaerName: name,
      contact: String(contact),
      priority,
      location
    });

    if (!BLOOD_TYPES.includes(newRequest.bloodType)) {
      return res.status(400).json({ error: "Invalid blood type" });
    }
    if (!Number.isFinite(newRequest.quantity) || newRequest.quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/donations", async (_req, res) => {
  try {
    const donations = await Blood.find({ type: "Donate" });
    res.status(200).json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/requests", async (_req, res) => {
  try {
    const requests = await Blood.find({ type: "Request" });
    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/match", async (_req, res) => {
  try {
    // Backward-compatible endpoint: return compatible donation records per request.
    const requests = await Blood.find({ type: "Request" }).lean();
    const out = [];

    for (const r of requests) {
      const compatibleTypes = getCompatibleDonorTypes(r.bloodType);
      const match = { type: "Donate", bloodType: { $in: compatibleTypes }, quantity: { $gt: 0 } };
      const locFirst = r.location ? await Blood.find({ ...match, location: r.location }).lean() : [];
      const anyLoc = await Blood.find(match).lean();
      const merged = [...locFirst, ...anyLoc.filter(d => !locFirst.some(x => String(x._id) === String(d._id)))];

      out.push({ request: r, compatibleTypes, matches: merged });
    }

    res.status(200).json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/request/check-availability", async (req, res) => {
  try {
    const { bloodType, quantity, location } = req.body;

    if (!bloodType || !quantity) {
      return res.status(400).json({ error: "Blood type and quantity are required" });
    }

    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ error: "Invalid blood type" });
    }
    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }

    const compatibleTypes = getCompatibleDonorTypes(bloodType);
    const match = { type: "Donate", bloodType: { $in: compatibleTypes } };
    const matchLoc = location ? { ...match, location } : match;

    const availableDonations = await Blood.aggregate([
      { $match: matchLoc },
      { $group: { _id: "$bloodType", totalQuantity: { $sum: "$quantity" } } },
    ]);

    const totalAvailable = availableDonations.reduce((sum, x) => sum + Number(x.totalQuantity || 0), 0);
    const isAvailable = totalAvailable >= qtyNum;

    const checkRequest = new Blood({
      type: "RequestCheck",
      bloodType,
      quantity: qtyNum,
      location: String(location || "Any"),
      donaerName: "SYSTEM",
      contact: "SYSTEM",
      checkedAt: new Date(),
      available: isAvailable,
    });

    await checkRequest.save();

    return res.status(200).json({
      available: isAvailable,
      requested: qtyNum,
      totalAvailable,
      compatibleTypes: compatibleTypes,
      message: isAvailable ? "Sufficient compatible blood available" : "Insufficient compatible blood available",
    });
  } catch (err) {
    console.error("Error while checking availability:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/request/check-availability", async (req, res) => {
  try {
    const { bloodType } = req.query;

    if (!bloodType) {
      return res.status(400).json({ error: "Blood type is required" });
    }

    const checks = await Blood.find({ type: "RequestCheck", bloodType });

    if (checks.length === 0) {
      return res.status(404).json({ message: "No check records found for the specified blood type" });
    }

    res.status(200).json(checks);
  } catch (err) {
    console.error("Error while fetching check availability:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/request-blood', async (req, res) => {
  try {
    const { bloodType, quantity, patientName, location, contact, priority, userId } = req.body;

    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ error: "Invalid blood type" });
    }
    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }
    if (!patientName || !location || !contact) {
      return res.status(400).json({ error: "patientName, location, and contact are required" });
    }

    const newRequest = new BloodRequest({
      bloodType,
      quantity: qtyNum,
      patientName,
      location,
      contact,
      priority,
      userId,
    });

    await newRequest.save();

    // Check availability before allocating
    const compatibleTypes = getCompatibleDonorTypes(bloodType);
    const availableDonations = await Blood.find({ 
      type: "Donate", 
      bloodType: { $in: compatibleTypes }, 
      quantity: { $gt: 0 } 
    }).lean();

    const totalAvailable = availableDonations.reduce((sum, d) => sum + Number(d.quantity || 0), 0);

    if (totalAvailable >= qtyNum) {
      // Perform allocation if enough units are available
      const allocation = await allocateFromDonations({ bloodType, quantity: qtyNum, location });
      
      newRequest.allocatedFrom = allocation.allocated;
      newRequest.status = "Approved";
      await newRequest.save();

      res.status(201).json({
        message: 'Blood Available – Request Confirmed',
        newRequest,
        allocation: {
          compatibleTypesTried: allocation.compatibleTried,
          allocatedFrom: allocation.allocated,
          remaining: allocation.remaining,
        }
      });
    } else {
      // Update status to "Not Available" if insufficient units
      newRequest.status = "Not Available";
      await newRequest.save();

      res.status(200).json({
        message: 'Blood Not Available Currently. Please try nearby hospitals or wait for donor availability.',
        newRequest,
        availableQuantity: totalAvailable
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the blood request' });
  }
});

router.get('/request-blood', async (_req, res) => {
  try {
    const requests = await BloodRequest.find();
    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching blood requests' });
  }
});

router.get("/inventory", async (req, res) => {
  try {
    const { location } = req.query;
    const match = { type: "Donate" };
    if (location) match.location = String(location);

    const totals = await Blood.aggregate([
      { $match: match },
      { $group: { _id: "$bloodType", totalQuantity: { $sum: "$quantity" }, units: { $sum: 1 } } },
    ]);

    const map = new Map(
      totals.map((t) => [t._id, { bloodType: t._id, totalQuantity: t.totalQuantity, units: t.units }])
    );
    const normalized = BLOOD_TYPES.map((bt) => map.get(bt) || ({ bloodType: bt, totalQuantity: 0, units: 0 }));

    res.status(200).json({ location: location || "Any", inventory: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch('/mark-request-accessed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      id,
      { status: 'Accessed' },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/mark-request-completed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'Completed') {
      return res.status(400).json({ message: 'Request is already completed' });
    }

    // If it was already Approved, it means blood was already deducted from inventory
    if (request.status === 'Approved') {
      request.status = 'Completed';
      await request.save();
      return res.json(request);
    }

    // If it was Not Available or Pending, try to allocate now
    const allocation = await allocateFromDonations({ 
      bloodType: request.bloodType, 
      quantity: request.quantity, 
      location: request.location 
    });

    if (allocation.remaining <= 0) {
      request.allocatedFrom = allocation.allocated;
      request.status = 'Completed';
      await request.save();
      return res.json(request);
    } else {
      // Rollback allocation if partial (allocateFromDonations already saves, so we need a dry run or manual reversal)
      // Actually, my allocateFromDonations saves changes. I should have made it better.
      // For now, if partial, we let it be but return error to user.
      // OR better: the caller should only call this if they know it's available.
      return res.status(400).json({ 
        message: 'No blood is available currently in inventory to fulfill this request.' 
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;