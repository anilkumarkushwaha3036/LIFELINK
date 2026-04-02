const mongoose = require('mongoose');

const bridgeRequestSchema = new mongoose.Schema(
  {
    fromHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Completed', 'Declined'],
      default: 'Pending',
    },
    initiatedBy: {
      type: String,
      default: 'System/Admin',
    },
  },
  { timestamps: true }
);

const BridgeRequest = mongoose.model('BridgeRequest', bridgeRequestSchema);
module.exports = BridgeRequest;
