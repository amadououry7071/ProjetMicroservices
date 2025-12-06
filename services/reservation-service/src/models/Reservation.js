const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
      trim: true,
    },
    tenantId: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ propertyId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
