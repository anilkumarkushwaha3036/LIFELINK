const User = require('../models/User');
const Request = require('../models/Request');
const BridgeRequest = require('../models/BridgeRequest');

// @desc    Get all hospitals awaiting verification
// @route   GET /api/admin/pending-hospitals
// @access  Private/Admin
const getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await User.find({
      role: 'hospital',
      verificationStatus: 'Unverified'
    }).select('-password');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all donors awaiting verification (Offline or Upload)
// @route   GET /api/admin/pending-donors
// @access  Private/Admin
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

// @desc    Approve/Verify a hospital on the grid
// @route   PUT /api/admin/approve-hospital/:id
// @access  Private/Admin
const approveHospital = async (req, res) => {
  try {
    const hospital = await User.findById(req.params.id);
    if (hospital && hospital.role === 'hospital') {
      hospital.verificationStatus = 'Verified';
      await hospital.save();
      res.json({ message: `Hospital ${hospital.name} verified successfully.` });
    } else {
      res.status(404).json({ message: 'Hospital entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Verify a donor on the grid
// @route   PUT /api/admin/approve-donor/:id
// @access  Private/Admin
const approveDonor = async (req, res) => {
  try {
    const donor = await User.findById(req.params.id);
    if (donor && donor.role === 'donor') {
      donor.verificationStatus = 'Verified';
      await donor.save();
      res.json({ message: `Donor ${donor.name} verified successfully.` });
    } else {
      res.status(404).json({ message: 'Donor entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Aggregate global grid stats for the Pulse Monitor (Data Viz)
// @route   GET /api/admin/grid-stats
// @access  Private/Admin
const getGridStats = async (req, res) => {
  try {
    // 1. Demand Trends: Frequency of blood group requests
    const demandTrends = await Request.aggregate([
      { $group: { _id: '$bloodGroupRequired', totalRequests: { $sum: 1 } } },
      { $sort: { totalRequests: -1 } }
    ]);

    // 2. Supply Analysis: Donor count by blood group
    const supplyStats = await User.aggregate([
      { $match: { role: 'donor', verificationStatus: 'Verified' } },
      { $group: { _id: '$bloodGroup', donorCount: { $sum: 1 } } }
    ]);

    // 3. Hospital Activity: Total requests per hospital
    const hospitalActivity = await Request.aggregate([
      { $group: { _id: '$hospitalId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 4. Activity Stream: Latest emergency cascades
    const activityStream = await Request.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('hospitalId', 'name');

    // 5. Grid Totals
    const totalDonors = await User.countDocuments({ role: 'donor', verificationStatus: 'Verified' });
    const totalRequests = await Request.countDocuments();
    const activeEmergencies = await Request.countDocuments({ status: 'Pending' });

    res.json({
      demandTrends,
      supplyStats,
      hospitalActivity,
      activityStream,
      stats: {
        totalDonors,
        totalRequests,
        activeEmergencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Suggest inter-hospital transfers based on recent activity
// @route   GET /api/admin/bridge-suggestions
// @access  Private/Admin
const getBridgeSuggestions = async (req, res) => {
  try {
    // Advanced: This would use a real matching algo. 
    // For now, we return high-potential coordinate pairs.
    const suggestions = [
      {
        fromHospital: "City Health Center",
        toHospital: "PulseNet South Node",
        bloodGroup: "O-",
        priority: "Critical",
        reason: "Zero local supply detected"
      }
    ];
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Initiate a Bridge Transfer
// @route   POST /api/admin/create-bridge
// @access  Private/Admin
const createBridge = async (req, res) => {
  try {
    const { fromHospId, toHospId, bloodGroup, units } = req.body;
    const bridge = await BridgeRequest.create({
      fromHospitalId: fromHospId,
      toHospitalId: toHospId,
      bloodGroup,
      units,
      status: 'Pending'
    });
    res.status(201).json(bridge);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = { 
  getPendingHospitals, 
  getPendingDonors, 
  approveHospital, 
  approveDonor, 
  getGridStats,
  getBridgeSuggestions,
  createBridge
};
