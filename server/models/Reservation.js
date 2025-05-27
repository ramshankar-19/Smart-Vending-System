const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendingMachineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendingMachine',
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reservationTime: {
    type: Date,
    default: Date.now
  },
  expirationTime: {
    type: Date,
    required: true,
    // TTL index - MongoDB will automatically delete expired documents
    //expires: 0  // This tells MongoDB to use the date value in this field
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  pin: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'cancelled'],
    default: 'active'
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// TTL index to automatically expire documents
reservationSchema.index({ expirationTime: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reservation', reservationSchema);
