const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['donor', 'hospital', 'admin'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Sparse allows multiple nulls if hospitals don't use email
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // GeoJSON Point for geospatial queries ($near)
    location: {
      type: {
        type: String,
        enum: ['Point'], 
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    // --- DONOR SPECIFIC FIELDS ---
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    verificationMethod: {
      type: String,
      enum: ['Upload', 'Offline', 'None'],
      default: 'None',
    },
    verificationStatus: {
      type: String,
      enum: ['Unverified', 'Pending Document', 'Verified'],
      default: 'Unverified',
    },
    verificationDocument: {
      type: String, // Store file path
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },

    // Reliability Intelligence Tracking
    metrics: {
      totalPingsReceived: { type: Number, default: 0 },
      pingsResponded: { type: Number, default: 0 },
      requestsAccepted: { type: Number, default: 0 },
      avgResponseTimeSeconds: { type: Number, default: 0 },
      reliabilityScore: { type: Number, default: 100 }, // Scaled 0-100
    },

    // --- HOSPITAL SPECIFIC FIELDS ---
    hospitalLicense: {
      type: String, // License Number (Hospital ID) for login
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for $near geospatial queries
userSchema.index({ location: '2dsphere' });

// Pre-save middleware to hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
