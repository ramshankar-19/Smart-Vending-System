// routes/reservations.js
const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const Reservation = require('../models/Reservation');
const VendingMachine = require('../models/VendingMachine');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// Create reservation
router.post('/', auth, async (req, res) => {
  try {
    const { vendingMachineId, itemId, quantity } = req.body;
    
    // Check if item is available
    const machine = await VendingMachine.findById(vendingMachineId);
    if (!machine) {
      return res.status(404).json({ message: 'Vending machine not found' });
    }
    
    const inventoryItem = machine.inventory.find(
      inv => inv.item.toString() === itemId
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Item not found in this machine' });
    }
    
    const availableQuantity = inventoryItem.quantity - inventoryItem.reservedQuantity;
    if (availableQuantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient quantity available',
        available: availableQuantity
      });
    }
    
    // Get item details for pricing
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Generate QR code and PIN
    const qrCode = crypto.randomBytes(16).toString('hex');
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration time (30 minutes from now)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30);
    
    // Create reservation
    const reservation = new Reservation({
      userId: req.userId,
      vendingMachineId,
      itemId,
      quantity,
      expirationTime,
      qrCode,
      pin,
      totalPrice: item.price * quantity
    });
    
    await reservation.save();
    
    // Update reserved quantity
    inventoryItem.reservedQuantity += quantity;
    await machine.save();
    
    // Generate QR code image
    const qrCodeDataURL = await QRCode.toDataURL(qrCode);
    
    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(machine.hostelName).emit('inventory_updated', {
      machineId: vendingMachineId,
      itemId,
      newAvailableQuantity: availableQuantity - quantity
    });
    
    res.status(201).json({
      reservation: {
        id: reservation._id,
        qrCode: qrCodeDataURL,
        pin: reservation.pin,
        expirationTime: reservation.expirationTime,
        totalPrice: reservation.totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.userId })
      .populate('itemId')
      .populate('vendingMachineId')
      .sort({ createdAt: -1 });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel reservation
router.delete('/:reservationId', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.reservationId,
      userId: req.userId,
      status: 'active'
    });
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Update machine inventory
    const machine = await VendingMachine.findById(reservation.vendingMachineId);
    const inventoryItem = machine.inventory.find(
      inv => inv.item.toString() === reservation.itemId.toString()
    );
    
    if (inventoryItem) {
      inventoryItem.reservedQuantity -= reservation.quantity;
      await machine.save();
    }
    
    // Update reservation status
    reservation.status = 'cancelled';
    await reservation.save();
    
    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(machine.hostelName).emit('inventory_updated', {
      machineId: reservation.vendingMachineId,
      itemId: reservation.itemId,
      newAvailableQuantity: inventoryItem.quantity - inventoryItem.reservedQuantity
    });
    
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
