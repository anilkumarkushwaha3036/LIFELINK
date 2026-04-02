const User = require('../models/User');
const Request = require('../models/Request');
const { launchEmergencyCascade } = require('../services/pulseEngine');

// @desc    Get all donors pending verification (both Document and Offline)
// @route   GET /api/hospital/pending-donors
// @access  Private/Hospital
const getPendingDonors = async (req, res) => {
  try {
    const donors = await User.find({
      role: 'donor',
      verificationStatus: { $in: ['Unverified', 'Pending Document'] }
    }).select('-password');
    
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Hospital verifies a donor (either via review or physical test)
// @route   PUT /api/hospital/verify-donor/:donorId
// @access  Private/Hospital
const verifyDonor = async (req, res) => {
  try {
    const donor = await User.findById(req.params.donorId);

    if (donor && donor.role === 'donor') {
      donor.verificationStatus = 'Verified';
      await donor.save();
      res.json({ message: 'Donor successfully verified.' });
    } else {
      res.status(404).json({ message: 'Donor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Initiate an Emergency Blood Request (PulseNet Core)
// @route   POST /api/hospital/request
// @access  Private/Hospital
const createEmergencyRequest = async (req, res) => {
  try {
    const { bloodGroupRequired, urgency, timeConstraintMinutes, currentRadiusKm } = req.body;

    const request = new Request({
      hospitalId: req.user._id,
      bloodGroupRequired,
      urgency,
      timeConstraintMinutes: timeConstraintMinutes || 2,
      currentRadiusKm: currentRadiusKm || 3,
      notifiedDonors: [],
    });

    const createdRequest = await request.save();
    launchEmergencyCascade(createdRequest._id);
    
    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get real-time grid stats for the specific hospital region
// @route   GET /api/hospital/stats
// @access  Private/Hospital
const getHospitalStats = async (req, res) => {
  try {
    const hospital = req.user;
    if (!hospital.location) return res.json({ totalDonorsNearby: 0 });

    const totalDonorsNearby = await User.countDocuments({
      role: 'donor',
      verificationStatus: 'Verified',
      location: {
        $near: {
          $geometry: hospital.location,
          $maxDistance: 25000 // 25km radius
        }
      }
    });

    const recentRequests = await Request.find({ hospitalId: hospital._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalDonorsNearby,
      recentRequests,
      gridStatus: 'Active'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = { getPendingDonors, verifyDonor, createEmergencyRequest, getHospitalStats };
