const express = require('express');
const router = express.Router();
const { toggleAvailability, getDonorProfile } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getDonorProfile);
router.put('/availability', protect, toggleAvailability);

module.exports = router;
