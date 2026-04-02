const User = require('../models/User');

// @desc    Toggle donor availability status
// @route   PUT /api/donor/availability
// @access  Private/Donor
const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user && user.role === 'donor') {
      if (user.verificationStatus !== 'Verified') {
        return res.status(403).json({ message: 'Only verified donors can go online' });
      }

      user.isAvailable = !user.isAvailable;
      await user.save();

      res.json({
        message: `Status updated to ${user.isAvailable ? 'Online' : 'Offline'}`,
        isAvailable: user.isAvailable
      });
    } else {
      res.status(404).json({ message: 'Donor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get donor profile & metrics
// @route   GET /api/donor/profile
// @access  Private/Donor
const getDonorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { toggleAvailability, getDonorProfile };
