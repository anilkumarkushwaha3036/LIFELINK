const mongoose = require('mongoose');

const notifiedDonorSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  timeTakenSeconds: {
    type: Number,
    default: null,
  },
});

const requestSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroupRequired: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    status: {
      type: String,
      enum: ['Searching', 'Matched', 'Failed', 'Fulfilled'],
      default: 'Searching',
    },
    urgency: {
      type: String,
      enum: ['Normal', 'High', 'Critical'],
      default: 'High',
    },
    escalationLevel: {
      type: Number,
      default: 1, // 1 = 3km, 2 = 10km radius
    },
    currentRadiusKm: {
      type: Number,
      default: 3,
    },
    timeConstraintMinutes: {
      type: Number,
      default: 2,
    },
    notifiedDonors: [notifiedDonorSchema],
    matchedDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // The donor who accepted
    },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;
