const express = require('express');
const router = express.Router();
const { getPendingDonors, verifyDonor, createEmergencyRequest, getHospitalStats } = require('../controllers/hospitalController');
const { protect, hospitalOnly } = require('../middleware/authMiddleware');

router.route('/pending-donors').get(protect, hospitalOnly, getPendingDonors);
router.route('/verify-donor/:donorId').put(protect, hospitalOnly, verifyDonor);
router.route('/request').post(protect, hospitalOnly, createEmergencyRequest);
router.route('/stats').get(protect, hospitalOnly, getHospitalStats);

module.exports = router;
