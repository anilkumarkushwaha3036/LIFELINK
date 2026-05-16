const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
const isTwilioConfigured = accountSid && authToken && twilioPhoneNumber;

if (isTwilioConfigured) {
  try {
    client = twilio(accountSid, authToken);
    console.log('[TwilioService] Twilio client initialized successfully.');
  } catch (error) {
    console.error('[TwilioService] Failed to initialize Twilio client:', error.message);
  }
} else {
  console.log('[TwilioService] Twilio credentials not found in .env. Running in Mock Mode.');
}

/**
 * Sends an emergency SMS to a donor.
 * @param {string} phone - The donor's phone number.
 * @param {string} bloodGroup - The requested blood group.
 * @param {string|number} distance - The distance string (e.g. '3km').
 */
const sendEmergencySMS = async (phone, bloodGroup, distance) => {
  const messageBody = `🚨 LIFELINK EMERGENCY 🚨\nUrgent requirement for ${bloodGroup} blood within ${distance}.\nPlease check your LIFELINK app to respond immediately. Every minute counts!`;

  if (isTwilioConfigured && client) {
    try {
      const message = await client.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: phone
      });
      console.log(`[TwilioService] Real SMS sent to ${phone} - SID: ${message.sid}`);
    } catch (error) {
      console.error(`[TwilioService Error] Failed to send SMS to ${phone}:`, error.message);
    }
  } else {
    // Mock Mode
    console.log('--------------------------------------------------');
    console.log(`[Mock TwilioService] SMS intended for: ${phone}`);
    console.log(`[Mock TwilioService] Message Body:\n${messageBody}`);
    console.log('--------------------------------------------------');
  }
};

module.exports = {
  sendEmergencySMS
};
