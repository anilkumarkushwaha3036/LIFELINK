const User = require('../models/User');
const Request = require('../models/Request');

let _io;

// Inject the io instance from server.js
const initEngine = (io) => {
  _io = io;
  console.log('[PulseEngine] Initialized logic engine active.');
};

// Start the search and countdown cascade
const launchEmergencyCascade = async (requestId) => {
  try {
    const request = await Request.findById(requestId).populate('hospitalId');
    if (!request || request.status !== 'Searching') return;

    const { hospitalId, bloodGroupRequired, currentRadiusKm, escalationLevel, timeConstraintMinutes } = request;
    const hId = hospitalId._id || hospitalId;

    console.log(`[PulseEngine] Level ${escalationLevel} Escalation for ${bloodGroupRequired} at ${currentRadiusKm}km`);

    // Notify Hospital Dashboard of the new escalation phase
    _io.to(`hospital_${hId}`).emit('pulse_update', { 
      status: 'Searching',
      radius: currentRadiusKm, 
      level: escalationLevel,
      expiryTime: Date.now() + (timeConstraintMinutes * 60 * 1000)
    });

    // The Hospital coordinates
    const hospitalCoords = hospitalId.location.coordinates;

    // Filter Step 1: Finding valid donors in radius based on current escalation
    const targetDonors = await User.find({
      role: 'donor',
      bloodGroup: bloodGroupRequired,
      verificationStatus: 'Verified',
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: hospitalCoords,
          },
          $maxDistance: currentRadiusKm * 1000, // Convert km to meters
        },
      },
      // Exclude donors we've ALREADY pinged in previous escalations
      _id: { $nin: request.notifiedDonors.map((d) => d.donorId) },
    })
      .sort({ 'metrics.reliabilityScore': -1 }) // Top reliable donors first
      .limit(escalationLevel === 1 ? 10 : 30);  // Level 1 = 10, Level 2+ = 30

    if (targetDonors.length === 0) {
      console.log(`[PulseEngine] No donors found in ${currentRadiusKm}km radius.`);
      handleEscalation(request);
      return;
    }

    console.log(`[PulseEngine] Pinging ${targetDonors.length} donors...`);

    // Add them to the request model
    targetDonors.forEach((donor) => {
      request.notifiedDonors.push({ donorId: donor._id, status: 'Pending' });
      
      // FIRE THE SOCKET PING
      _io.to(`user_${donor._id}`).emit('emergency_override_alert', {
        requestId: request._id,
        bloodGroup: bloodGroupRequired,
        distanceStr: `${currentRadiusKm}km`,
        timeConstraintMinutes,
        escalationLevel
      });
    });

    await request.save();

    // Notify Hospital Dashboard that pings were sent with the donor count
    _io.to(`hospital_${hId}`).emit('pulse_update', { 
      notifiedCount: targetDonors.length,
      radius: currentRadiusKm,
      level: escalationLevel 
    });

    // SET THE TIME BOMB (Escalation Timer)
    setTimeout(() => {
      verifyRequestStatus(requestId);
    }, timeConstraintMinutes * 60 * 1000);

  } catch (error) {
    console.error(`[PulseEngine Error] ${error.message}`);
  }
};

// Check if anyone accepted. If not, explode (escalate)
const verifyRequestStatus = async (requestId) => {
  const request = await Request.findById(requestId);
  if (request.status === 'Searching') {
    handleEscalation(request);
  }
};

const handleEscalation = async (request) => {
  if (request.escalationLevel >= 3) {
    request.status = 'Failed';
    await request.save();
    console.log(`[PulseEngine] Request ${request._id} FAILED. Reached MAX Escelation.`);
    _io.to(`hospital_${request.hospitalId}`).emit('request_failed', { requestId: request._id });
    return;
  }

  // Escalate
  request.escalationLevel += 1;
  request.currentRadiusKm = request.currentRadiusKm === 3 ? 10 : 25; // 3km -> 10km -> 25km
  await request.save();

  console.log(`[PulseEngine] AUTO-ESCALATED Request ${request._id} to Level ${request.escalationLevel}`);
  launchEmergencyCascade(request._id);
};

// Called when a donor hits "ACCEPT"
const acceptEmergency = async (requestId, donorId, timeTaken) => {
  const request = await Request.findById(requestId);
  if (request.status !== 'Searching') return false; // Too late!

  // Update Request
  request.status = 'Matched';
  request.matchedDonor = donorId;
  
  const donorRecord = request.notifiedDonors.find(d => d.donorId.toString() === donorId.toString());
  if(donorRecord) {
    donorRecord.status = 'Accepted';
    donorRecord.timeTakenSeconds = timeTaken;
  }

  await request.save();

  // Update Donor Score
  const donorUser = await User.findById(donorId);
  donorUser.metrics.pingsResponded += 1;
  donorUser.metrics.requestsAccepted += 1;
  donorUser.metrics.avgResponseTimeSeconds = 
       (donorUser.metrics.avgResponseTimeSeconds + timeTaken) / 2; // Simple running average
  
  // They are no longer available since they are active
  donorUser.isAvailable = false;
  await donorUser.save();

  // Notify Hospital!
  _io.to(`hospital_${request.hospitalId}`).emit('match_found', { 
    donorId: donorUser._id, 
    name: donorUser.name, 
    timeTaken 
  });

  return true;
};

module.exports = { initEngine, launchEmergencyCascade, acceptEmergency };
