const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'L\'ID de la propriété est obligatoire']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID de l\'utilisateur est obligatoire']
  },
  userName: {
    type: String,
    required: [true, 'Le nom de l\'utilisateur est obligatoire'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'La note est obligatoire'],
    min: [1, 'La note minimum est 1'],
    max: [5, 'La note maximum est 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index unique: un utilisateur ne peut laisser qu'un seul avis par propriété
reviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });

// Index pour les recherches
reviewSchema.index({ propertyId: 1 });
reviewSchema.index({ userId: 1 });

// Middleware pour mettre à jour la date de modification
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
