const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Item = require('../models/Item');
const VendingMachine = require('../models/VendingMachine');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vending_system');
    
    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await VendingMachine.deleteMany({});
    
    // Create sample items
    const items = await Item.create([
      {
        name: 'Coca Cola',
        description: 'Refreshing cola drink 330ml',
        price: 25,
        category: 'beverages'
      },
      {
        name: 'Lays Chips',
        description: 'Classic salted potato chips 50g',
        price: 20,
        category: 'snacks'
      },
      {
        name: 'KitKat',
        description: 'Chocolate wafer bar 45g',
        price: 30,
        category: 'snacks'
      },
      {
        name: 'Maggi Noodles',
        description: 'Instant noodles 70g',
        price: 15,
        category: 'instant_food'
      },
      {
        name: 'Pepsi',
        description: 'Cola soft drink 330ml',
        price: 25,
        category: 'beverages'
      },
      {
        name: 'Oreo Cookies',
        description: 'Chocolate sandwich cookies 120g',
        price: 35,
        category: 'snacks'
      }
    ]);
    
    // Create sample vending machines
    const machines = await VendingMachine.create([
      {
        machineId: 'VM001',
        location: 'Ground Floor',
        hostelName: 'Hostel A',
        inventory: [
          { item: items[0]._id, quantity: 10, reservedQuantity: 0 },
          { item: items[1]._id, quantity: 15, reservedQuantity: 0 },
          { item: items[2]._id, quantity: 8, reservedQuantity: 0 },
          { item: items[3]._id, quantity: 12, reservedQuantity: 0 }
        ]
      },
      {
        machineId: 'VM002',
        location: 'First Floor',
        hostelName: 'Hostel A',
        inventory: [
          { item: items[4]._id, quantity: 12, reservedQuantity: 0 },
          { item: items[5]._id, quantity: 6, reservedQuantity: 0 },
          { item: items[0]._id, quantity: 8, reservedQuantity: 0 },
          { item: items[2]._id, quantity: 10, reservedQuantity: 0 }
        ]
      },
      {
        machineId: 'VM003',
        location: 'Ground Floor',
        hostelName: 'Hostel B',
        inventory: [
          { item: items[1]._id, quantity: 20, reservedQuantity: 0 },
          { item: items[3]._id, quantity: 15, reservedQuantity: 0 },
          { item: items[4]._id, quantity: 10, reservedQuantity: 0 },
          { item: items[5]._id, quantity: 8, reservedQuantity: 0 }
        ]
      }
    ]);
    
    // Create sample admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@smail.com',
      password: 'admin123',
      role: 'admin',
      hostelId: 'Admin'
    });
    
    // Create sample student users
    const studentUsers = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'student123',
        role: 'student',
        hostelId: 'Hostel A'
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        password: 'student123',
        role: 'student',
        hostelId: 'Hostel B'
      }
    ]);
    
    console.log('Seed data created successfully!');
    console.log(`Created ${items.length} items`);
    console.log(`Created ${machines.length} vending machines`);
    console.log(`Created ${studentUsers.length + 1} users`);
    console.log('\nLogin credentials:');
    console.log('Admin: admin@smail.com / admin123');
    console.log('Student 1: john@example.com / student123');
    console.log('Student 2: sarah@example.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
