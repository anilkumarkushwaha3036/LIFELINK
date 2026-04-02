const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB.');

    // Check if admin already exists
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('[Seed] Super Admin already exists. No action needed.');
      process.exit();
    }

    const testAdmin = new User({
      role: 'admin',
      name: 'PulseNet Grid Controller',
      email: 'admin@pulsenet.gov',
      password: 'grid_admin_2026',
      phone: 'SYSTEM-GRID-01',
      verificationStatus: 'Verified'
    });

    await testAdmin.save();
    console.log('[Seed] Super Admin Created Successfully!');
    console.log('-----------------------------------');
    console.log('ADMIN EMAIL: admin@pulsenet.gov');
    console.log('PASSWORD:    grid_admin_2026');
    console.log('-----------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedAdmin();
