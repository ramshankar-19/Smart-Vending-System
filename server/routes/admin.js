const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const VendingMachine = require('../models/VendingMachine');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reservations (admin only)
router.get('/reservations', auth, adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('userId', 'name email')
      .populate('itemId', 'name price')
      .populate('vendingMachineId', 'hostelName location')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all machines for admin
router.get('/machines', auth, adminAuth, async (req, res) => {
  try {
    const machines = await VendingMachine.find()
      .populate('inventory.item')
      .sort({ createdAt: -1 });
    res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all items
router.get('/items', auth, adminAuth, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new item
router.post('/items', auth, adminAuth, async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new machine
router.post('/machines', auth, adminAuth, async (req, res) => {
  try {
    const machine = new VendingMachine(req.body);
    await machine.save();
    res.status(201).json(machine);
  } catch (error) {
    console.error('Error creating machine:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from machine inventory
router.delete('/machines/:machineId/inventory/:itemId', auth, adminAuth, async (req, res) => {
  try {
    const { machineId, itemId } = req.params;
    const machine = await VendingMachine.findById(machineId);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Remove item from inventory
    machine.inventory = machine.inventory.filter(
      inv => inv.item.toString() !== itemId
    );
    
    await machine.save();
    res.json({ message: 'Item removed from machine successfully' });
  } catch (error) {
    console.error('Error removing item from machine:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle machine maintenance status
router.put('/machines/:machineId/maintenance', auth, adminAuth, async (req, res) => {
  try {
    const { machineId } = req.params;
    const { isActive } = req.body;
    
    const machine = await VendingMachine.findByIdAndUpdate(
      machineId,
      { isActive },
      { new: true }
    );
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('socketio');
    io.emit('machine_status_updated', {
      machineId,
      isActive,
      hostelName: machine.hostelName
    });
    
    res.json({ 
      message: `Machine ${isActive ? 'activated' : 'set to maintenance'} successfully`,
      machine 
    });
  } catch (error) {
    console.error('Error updating machine status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update existing inventory endpoint to handle adding new items
router.put('/machines/:machineId/inventory', auth, adminAuth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const machine = await VendingMachine.findById(req.params.machineId);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    const inventoryItem = machine.inventory.find(
      inv => inv.item.toString() === itemId
    );
    
    if (inventoryItem) {
      // Update existing item quantity
      inventoryItem.quantity = quantity;
    } else {
      // Add new item to machine
      machine.inventory.push({ 
        item: itemId, 
        quantity, 
        reservedQuantity: 0 
      });
    }
    
    await machine.save();
    
    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(machine.hostelName).emit('inventory_updated', {
      machineId: machine._id,
      itemId,
      newQuantity: quantity
    });
    
    res.json({ message: 'Inventory updated successfully', machine });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manual cleanup of expired reservations
router.post('/cleanup-expired', auth, adminAuth, async (req, res) => {
  try {
    const { cleanupExpiredReservations } = require('../services/cleanupService');
    await cleanupExpiredReservations();
    res.json({ message: 'Expired reservations cleaned up successfully' });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get analytics (Fixed version)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Get basic counts with error handling
    const [totalUsers, totalMachines, totalReservations] = await Promise.all([
      User.countDocuments({ role: 'student' }).catch(() => 0),
      VendingMachine.countDocuments().catch(() => 0),
      Reservation.countDocuments().catch(() => 0)
    ]);

    // Get reservations for revenue calculation
    let reservations = [];
    try {
      reservations = await Reservation.find({ status: 'redeemed' })
        .populate('itemId', 'name')
        .lean();
    } catch (error) {
      console.error('Error fetching reservations for analytics:', error);
    }

    const totalRevenue = reservations.reduce((sum, res) => {
      return sum + (res.totalPrice || 0);
    }, 0);
    
    // Popular items calculation with error handling
    const itemCounts = {};
    reservations.forEach(res => {
      if (res.itemId && res.itemId.name) {
        const itemName = res.itemId.name;
        itemCounts[itemName] = (itemCounts[itemName] || 0) + (res.quantity || 0);
      }
    });
    
    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity with error handling
    let recentActivity = [];
    try {
      const recentReservations = await Reservation.find()
        .populate('userId', 'name')
        .populate('itemId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      recentActivity = recentReservations.map(res => ({
        timestamp: res.createdAt,
        description: `${res.userId?.name || 'Unknown User'} ${res.status || 'unknown'} ${res.itemId?.name || 'unknown item'}`
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }

    res.json({
      totalUsers,
      totalMachines,
      totalReservations,
      totalRevenue,
      popularItems,
      recentActivity
    });
  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      totalUsers: 0,
      totalMachines: 0,
      totalReservations: 0,
      totalRevenue: 0,
      popularItems: [],
      recentActivity: []
    });
  }
});

module.exports = router;
