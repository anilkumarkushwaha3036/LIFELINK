const express = require('express');
const router = express.Router();
const { 
  getPendingHospitals, 
  getPendingDonors, 
  approveHospital, 
  rejectHospital,
  approveDonor, 
  rejectDonor,
  getGridStats,
  getBridgeSuggestions,
  createBridge 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to ensure user is a Super Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as Grid Admin' });
  }
};

router.route('/pending-hospitals').get(protect, adminOnly, getPendingHospitals);
router.route('/pending-donors').get(protect, adminOnly, getPendingDonors);
router.route('/approve-hospital/:id').put(protect, adminOnly, approveHospital);
router.route('/reject-hospital/:id').delete(protect, adminOnly, rejectHospital);
router.route('/approve-donor/:id').put(protect, adminOnly, approveDonor);
router.route('/reject-donor/:id').delete(protect, adminOnly, rejectDonor);
router.route('/grid-stats').get(protect, adminOnly, getGridStats);
router.route('/bridge-suggestions').get(protect, adminOnly, getBridgeSuggestions);
router.route('/create-bridge').post(protect, adminOnly, createBridge);

module.exports = router;
