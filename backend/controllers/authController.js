const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Donor or Hospital)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('[Auth] Registration request received:', req.body);
    console.log('[Auth] File received:', req.file);

    const { role, name, email, password, bloodGroup, longitude, latitude, verificationMethod, hospitalLicense, phone } = req.body;

    if (!role) {
      console.error('[Auth Error] No role provided in req.body. Current body:', req.body);
      return res.status(400).json({ message: 'No role specified in registration' });
    }

    // Check existing based on role
    if (role === 'donor') {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'Donor email already registered' });
    } else if (role === 'hospital') {
      const hospitalExists = await User.findOne({ hospitalLicense });
      if (hospitalExists) return res.status(400).json({ message: 'Hospital ID already registered' });
    } else {
      console.error('[Auth Error] Invalid role provided:', role);
      return res.status(400).json({ message: 'Invalid role specified: ' + role });
    }

    // Prepare Base Data
    const userData = { role, name, password, phone };

    if (role === 'donor') {
      userData.email = email;
      userData.bloodGroup = bloodGroup;
      userData.verificationMethod = verificationMethod || 'None';
      
      // Verification Status logic:
      // If uploading report -> Pending Document review
      // If offline -> Unverified (pending hospital visit)
      if (verificationMethod === 'Upload' && req.file) {
        userData.verificationStatus = 'Pending Document';
        userData.verificationDocument = req.file.path; // Store local path
      } else if (verificationMethod === 'Offline') {
        userData.verificationStatus = 'Unverified';
      }

      if (longitude && latitude) {
        userData.location = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
      }
    } else if (role === 'hospital') {
      userData.hospitalLicense = hospitalLicense;
      // Hospitals are now UNVERIFIED by default (awaiting admin approval)
      userData.verificationStatus = 'Unverified';
      // Hospitals must have coordinates to find donors
      if (longitude && latitude) {
        userData.location = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
      }
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user.id,
        role: user.role,
        name: user.name,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`[Auth Register Error] ${error.message}`);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { role, email, hospitalLicense, password } = req.body;
    console.log(`[Auth Login] Attempt: role=${role}, license=${hospitalLicense}, email=${email}`);
    let user;

    if (role === 'donor' || role === 'admin') {
      user = await User.findOne({ email });
    } else if (role === 'hospital') {
      user = await User.findOne({ hospitalLicense });
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    if (user && (await user.matchPassword(password))) {
      // For hospitals, ensure they are verified before login
      if (role === 'hospital' && user.verificationStatus === 'Unverified') {
        return res.status(403).json({ message: 'Hospital Access Pending: Awaiting Grid Admin verification.' });
      }
      res.json({
        _id: user.id,
        role: user.role,
        name: user.name,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(`[Auth Login Error] ${error.message}`);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { registerUser, loginUser };
