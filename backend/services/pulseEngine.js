const User = require('../models/User');
const Request = require('../models/Request');
const { sendEmergencySMS } = require('./twilioService');

let _io;

// Clinical Blood Compatibility Matrix (Donor -> Recipient)
const BLOOD_COMPATIBILITY = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-']
};

// Inject the io instance from server.js
const initEngine = (io) => {
  _io = io;
  console.log('[PulseEngine] Initialized logic engine active.');

  // Periodic Reconciliation Sweeper: Auto-recovers any pending requests if server was restarted
  setInterval(reconcilePendingRequests, 30000);
};

// Sweeper function to verify any stuck requests
const reconcilePendingRequests = async () => {
  try {
    const expiredRequests = await Request.find({ status: 'Searching' });
    const now = Date.now();
    for (const req of expiredRequests) {
      const elapsedMs = now - new Date(req.updatedAt).getTime();
      const maxWaitMs = (req.timeConstraintMinutes || 2) * 60 * 1000;
      if (elapsedMs >= maxWaitMs) {
        console.log(`[PulseEngine Sweeper] Auto-reconciling Request ${req._id}`);
        handleEscalation(req);
      }
    }
  } catch (err) {
    console.error('[PulseEngine Sweeper Error]', err.message);
  }
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
    if (_io) {
      _io.to(`hospital_${hId}`).emit('pulse_update', { 
        status: 'Searching',
        radius: currentRadiusKm, 
        level: escalationLevel,
        expiryTime: Date.now() + (timeConstraintMinutes * 60 * 1000)
      });

      // Notify Super Admin Grid Channel of active emergency
      _io.to('admin_grid').emit('grid_activity', {
        type: 'EMERGENCY_BROADCAST',
        requestId: request._id,
        hospitalName: hospitalId.name || 'Hospital Node',
        bloodGroup: bloodGroupRequired,
        radius: currentRadiusKm,
        level: escalationLevel,
        timestamp: new Date()
      });
    }

    // Safely retrieve hospital coordinates
    const hospitalCoords = hospitalId?.location?.coordinates;
    if (!hospitalCoords || hospitalCoords.length < 2) {
      console.error(`[PulseEngine Error] Hospital ${hId} does not have valid GPS coordinates.`);
      return;
    }

    // Determine compatible donor blood groups
    const compatibleBloodGroups = BLOOD_COMPATIBILITY[bloodGroupRequired] || [bloodGroupRequired];

    // Filter Step 1: Finding valid donors in radius based on current escalation
    const targetDonors = await User.find({
      role: 'donor',
      bloodGroup: { $in: compatibleBloodGroups },
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
      console.log(`[PulseEngine] No compatible donors found in ${currentRadiusKm}km radius.`);
      handleEscalation(request);
      return;
    }

    console.log(`[PulseEngine] Pinging ${targetDonors.length} compatible donors (${compatibleBloodGroups.join(', ')})...`);

    // Add them to the request model
    targetDonors.forEach((donor) => {
      request.notifiedDonors.push({ donorId: donor._id, status: 'Pending' });
      
      // FIRE THE SOCKET PING
      if (_io) {
        _io.to(`user_${donor._id}`).emit('emergency_override_alert', {
          requestId: request._id,
          bloodGroup: bloodGroupRequired,
          donorBloodGroup: donor.bloodGroup,
          distanceStr: `${currentRadiusKm}km`,
          timeConstraintMinutes,
          escalationLevel
        });
      }

      // SEND TWILIO SMS PING
      if (donor.phone) {
        sendEmergencySMS(donor.phone, bloodGroupRequired, `${currentRadiusKm}km`);
      }
    });

    await request.save();

    // Notify Hospital Dashboard that pings were sent with the donor count
    if (_io) {
      _io.to(`hospital_${hId}`).emit('pulse_update', { 
        notifiedCount: targetDonors.length,
        radius: currentRadiusKm, 
        level: escalationLevel 
      });
    }

    // SET THE ESCALATION TIMER
    setTimeout(() => {
      verifyRequestStatus(requestId);
    }, timeConstraintMinutes * 60 * 1000);

  } catch (error) {
    console.error(`[PulseEngine Error] ${error.message}`);
  }
};

// Check if anyone accepted. If not, explode (escalate)
const verifyRequestStatus = async (requestId) => {
  try {
    const request = await Request.findById(requestId);
    if (request && request.status === 'Searching') {
      handleEscalation(request);
    }
  } catch (err) {
    console.error('[PulseEngine verifyRequestStatus Error]', err.message);
  }
};

const handleEscalation = async (request) => {
  try {
    if (request.escalationLevel >= 3) {
      request.status = 'Failed';
      await request.save();
      console.log(`[PulseEngine] Request ${request._id} FAILED. Reached MAX Escalation.`);
      const hId = request.hospitalId._id || request.hospitalId;
      if (_io) {
        _io.to(`hospital_${hId}`).emit('request_failed', { requestId: request._id });
        _io.to('admin_grid').emit('grid_activity', {
          type: 'EMERGENCY_FAILED',
          requestId: request._id,
          timestamp: new Date()
        });
      }
      return;
    }

    // Escalate to next radius
    request.escalationLevel += 1;
    request.currentRadiusKm = request.currentRadiusKm === 3 ? 10 : 25; // 3km -> 10km -> 25km
    await request.save();

    console.log(`[PulseEngine] AUTO-ESCALATED Request ${request._id} to Level ${request.escalationLevel} (${request.currentRadiusKm}km)`);
    launchEmergencyCascade(request._id);
  } catch (err) {
    console.error('[PulseEngine handleEscalation Error]', err.message);
  }
};

// Called when a donor hits "ACCEPT" (Race-Condition Protected via Atomic Query)
const acceptEmergency = async (requestId, donorId, timeTaken = 15) => {
  try {
    // Atomic update: only succeeds if request is STILL 'Searching'
    const updatedRequest = await Request.findOneAndUpdate(
      { _id: requestId, status: 'Searching' },
      { 
        $set: { 
          status: 'Matched', 
          matchedDonor: donorId,
          'notifiedDonors.$[elem].status': 'Accepted',
          'notifiedDonors.$[elem].timeTakenSeconds': timeTaken
        } 
      },
      { 
        arrayFilters: [{ 'elem.donorId': donorId }],
        new: true 
      }
    );

    if (!updatedRequest) {
      console.log(`[PulseEngine] Request ${requestId} already matched or no longer active.`);
      return false; // Another donor already claimed it!
    }

    // Update Donor Metrics & Status
    const donorUser = await User.findById(donorId);
    if (donorUser) {
      donorUser.metrics.pingsResponded = (donorUser.metrics.pingsResponded || 0) + 1;
      donorUser.metrics.requestsAccepted = (donorUser.metrics.requestsAccepted || 0) + 1;
      const currentAvg = donorUser.metrics.avgResponseTimeSeconds || timeTaken;
      donorUser.metrics.avgResponseTimeSeconds = Math.round((currentAvg + timeTaken) / 2);
      
      // Calculate dynamic reliability score (0 - 100)
      const ratio = (donorUser.metrics.requestsAccepted / (donorUser.metrics.totalPingsReceived || 1));
      donorUser.metrics.reliabilityScore = Math.min(100, Math.max(70, Math.round(ratio * 100)));
      
      // Auto toggle offline since donor is now on active rescue mission
      donorUser.isAvailable = false;
      await donorUser.save();

      const hId = updatedRequest.hospitalId._id || updatedRequest.hospitalId;

      // Notify Hospital Command Center instantly
      if (_io) {
        _io.to(`hospital_${hId}`).emit('match_found', { 
          requestId: updatedRequest._id,
          donorId: donorUser._id, 
          name: donorUser.name, 
          phone: donorUser.phone,
          bloodGroup: donorUser.bloodGroup,
          timeTaken 
        });

        // Notify Super Admin Channel
        _io.to('admin_grid').emit('grid_activity', {
          type: 'EMERGENCY_MATCHED',
          requestId: updatedRequest._id,
          donorName: donorUser.name,
          bloodGroup: donorUser.bloodGroup,
          timestamp: new Date()
        });
      }
    }

    return true;
  } catch (err) {
    console.error('[PulseEngine acceptEmergency Error]', err.message);
    return false;
  }
};

module.exports = { 
  initEngine, 
  launchEmergencyCascade, 
  acceptEmergency, 
  BLOOD_COMPATIBILITY 
};
