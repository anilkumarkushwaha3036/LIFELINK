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
    }).select('-password').sort({ createdAt: -1 });
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
    }).select('-password').sort({ createdAt: -1 });
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

      // Real-time socket notification to the hospital
      if (req.io) {
        req.io.to(`hospital_${hospital._id}`).emit('hospital_status_updated', {
          verificationStatus: 'Verified',
          message: 'Hospital accredited and verified on the LifeLink Grid.'
        });
      }

      res.json({ message: `Hospital ${hospital.name} verified successfully.` });
    } else {
      res.status(404).json({ message: 'Hospital entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Reject a hospital on the grid
// @route   DELETE /api/admin/reject-hospital/:id
// @access  Private/Admin
const rejectHospital = async (req, res) => {
  try {
    const hospital = await User.findById(req.params.id);
    if (hospital && hospital.role === 'hospital') {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: `Hospital ${hospital.name} registration rejected.` });
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

      // Real-time socket notification to the donor
      if (req.io) {
        req.io.to(`user_${donor._id}`).emit('donor_status_updated', {
          verificationStatus: 'Verified',
          message: 'Donor account verified by Grid Admin. You are now active!'
        });
      }

      res.json({ message: `Donor ${donor.name} verified successfully.` });
    } else {
      res.status(404).json({ message: 'Donor entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Reject a donor on the grid
// @route   DELETE /api/admin/reject-donor/:id
// @access  Private/Admin
const rejectDonor = async (req, res) => {
  try {
    const donor = await User.findById(req.params.id);
    if (donor && donor.role === 'donor') {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: `Donor ${donor.name} registration rejected.` });
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

    // Populate hospital names for activity
    const populatedActivity = await User.populate(hospitalActivity, { path: '_id', select: 'name' });

    // 4. Activity Stream: Latest emergency cascades
    const activityStream = await Request.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('hospitalId', 'name');

    // 5. Grid Totals
    const totalDonors = await User.countDocuments({ role: 'donor', verificationStatus: 'Verified' });
    const totalHospitals = await User.countDocuments({ role: 'hospital', verificationStatus: 'Verified' });
    const totalRequests = await Request.countDocuments();
    const activeEmergencies = await Request.countDocuments({ status: 'Searching' });

    res.json({
      demandTrends,
      supplyStats,
      hospitalActivity: populatedActivity,
      activityStream,
      stats: {
        totalDonors,
        totalHospitals,
        totalRequests,
        activeEmergencies
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Suggest inter-hospital transfers based on active hospitals
// @route   GET /api/admin/bridge-suggestions
// @access  Private/Admin
const getBridgeSuggestions = async (req, res) => {
  try {
    const verifiedHospitals = await User.find({ role: 'hospital', verificationStatus: 'Verified' }).limit(4);
    
    if (verifiedHospitals.length >= 2) {
      const suggestions = [
        {
          _id: 'sugg-1',
          fromHospitalId: verifiedHospitals[1]._id,
          fromHospital: verifiedHospitals[1].name,
          toHospitalId: verifiedHospitals[0]._id,
          toHospital: verifiedHospitals[0].name,
          bloodGroup: "O-",
          units: 3,
          priority: "Critical",
          reason: "Universal donor deficit detected at regional trauma desk"
        }
      ];
      return res.json(suggestions);
    }

    res.json([]);
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
      units: Number(units) || 1,
      status: 'Pending'
    });

    if (req.io) {
      req.io.to(`hospital_${toHospId}`).emit('incoming_bridge', bridge);
      req.io.to(`hospital_${fromHospId}`).emit('outgoing_bridge', bridge);
    }

    res.status(201).json(bridge);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = { 
  getPendingHospitals, 
  getPendingDonors, 
  approveHospital, 
  rejectHospital,
  approveDonor, 
  rejectDonor,
  getGridStats,
  getBridgeSuggestions,
  createBridge
};
