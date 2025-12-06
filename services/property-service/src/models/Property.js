const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true
  },
  surface: {
    type: Number,
    required: [true, 'La surface est obligatoire'],
    min: [1, 'La surface doit être supérieure à 0']
  },
  rooms: {
    type: Number,
    required: [true, 'Le nombre de pièces est obligatoire'],
    min: [1, 'Le nombre de pièces doit être supérieur à 0']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  address: {
    street: {
      type: String,
      required: [true, 'La rue est obligatoire'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'La ville est obligatoire'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Le code postal est obligatoire'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Le pays est obligatoire'],
      trim: true,
      default: 'France'
    }
  },
  features: {
    hasElevator: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasBalcony: { type: Boolean, default: false },
    isFurnished: { type: Boolean, default: false },
    hasAirConditioning: { type: Boolean, default: false },
    hasHeating: { type: Boolean, default: false },
    hasInternet: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'under_contract'],
    default: 'available'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le propriétaire est obligatoire']
  },
  images: [{
    type: String,
    trim: true
  }],
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

// Index pour les recherches
propertySchema.index({ 'address.city': 'text', 'address.postalCode': 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ surface: 1 });
propertySchema.index({ status: 1 });

// Middleware pour mettre à jour la date de modification
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
