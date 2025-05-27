// routes/inventory.js
const express = require('express');
const VendingMachine = require('../models/VendingMachine');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all vending machines with inventory
router.get('/', async (req, res) => {
  try {
    const { search, hostel } = req.query;
    let query = { isActive: true };
    
    if (hostel) {
      query.hostelName = hostel;
    }
    
    const machines = await VendingMachine.find(query)
      .populate('inventory.item')
      .lean();
    
    if (search) {
      machines.forEach(machine => {
        machine.inventory = machine.inventory.filter(inv => 
          inv.item.name.toLowerCase().includes(search.toLowerCase()) ||
          inv.item.category.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search items across all machines
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const machines = await VendingMachine.find({ isActive: true })
      .populate('inventory.item')
      .lean();
    
    const results = [];
    
    machines.forEach(machine => {
      machine.inventory.forEach(inv => {
        if (inv.item.name.toLowerCase().includes(q.toLowerCase()) && 
            inv.quantity > inv.reservedQuantity) {
          results.push({
            item: inv.item,
            availableQuantity: inv.quantity - inv.reservedQuantity,
            machine: {
              id: machine._id,
              location: machine.location,
              hostelName: machine.hostelName
            }
          });
        }
      });
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get inventory for specific machine
router.get('/machine/:machineId', async (req, res) => {
  try {
    const machine = await VendingMachine.findById(req.params.machineId)
      .populate('inventory.item');
    
    if (!machine) {
      return res.status(404).json({ message: 'Vending machine not found' });
    }
    
    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
