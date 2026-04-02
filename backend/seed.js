const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedHospital = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB.');

    // Check if hospital already exists
    const existing = await User.findOne({ hospitalLicense: 'HOSP-7892' });
    if (existing) {
      console.log('[Seed] Test Hospital already exists. No action needed.');
      process.exit();
    }

    const testHospital = new User({
      role: 'hospital',
      name: 'City General Hospital',
      hospitalLicense: 'HOSP-7892',
      password: 'hospital123',
      phone: '0755-1234567',
      location: {
        type: 'Point',
        coordinates: [77.4126, 23.2599] // [longitude, latitude] - Bhopal Central
      },
      verificationStatus: 'Verified'
    });

    await testHospital.save();
    console.log('[Seed] Test Hospital Created Successfully!');
    console.log('-----------------------------------');
    console.log('HOSPITAL ID: HOSP-7892');
    console.log('PASSWORD:    hospital123');
    console.log('-----------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedHospital();
