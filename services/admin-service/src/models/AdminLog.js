const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'BAN_USER',
      'UNBAN_USER',
      'DELETE_USER',
      'DELETE_PROPERTY',
      'DELETE_REVIEW',
      'DELETE_RESERVATION',
      'UPDATE_PASSWORD'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['user', 'property', 'review', 'reservation', 'admin']
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
adminLogSchema.index({ adminId: 1 });
adminLogSchema.index({ action: 1 });
adminLogSchema.index({ createdAt: -1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
