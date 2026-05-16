require('dotenv').config();
const { sendEmergencySMS } = require('./services/twilioService');

const args = process.argv.slice(2);
const targetPhone = args[0];

if (!targetPhone) {
  console.error("Please provide a target phone number (e.g. +1234567890)");
  process.exit(1);
}

console.log(`Testing Twilio SMS to ${targetPhone}...`);
sendEmergencySMS(targetPhone, 'O-', '5km').then(() => {
  console.log("Test execution finished. Check Twilio console or phone for the message.");
});
