const Reservation = require('../models/Reservation');
const VendingMachine = require('../models/VendingMachine');

const cleanupExpiredReservations = async () => {
  try {
    const now = new Date();
    
    // Find all active reservations that have expired
    const expiredReservations = await Reservation.find({
      status: 'active',
      expirationTime: { $lt: now }
    });

    for (const reservation of expiredReservations) {
      // Update reservation status to expired
      reservation.status = 'expired';
      await reservation.save();

      // Release reserved quantity back to available inventory
      const machine = await VendingMachine.findById(reservation.vendingMachineId);
      if (machine) {
        const inventoryItem = machine.inventory.find(
          inv => inv.item.toString() === reservation.itemId.toString()
        );
        
        if (inventoryItem) {
          inventoryItem.reservedQuantity = Math.max(
            0, 
            inventoryItem.reservedQuantity - reservation.quantity
          );
          await machine.save();
        }
      }
    }

    if (expiredReservations.length > 0) {
      console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
    }
  } catch (error) {
    console.error('Error cleaning up expired reservations:', error);
  }
};

// Run cleanup every minute
const startCleanupService = () => {
  setInterval(cleanupExpiredReservations, 60000); // 60 seconds
  console.log('Cleanup service started - running every 60 seconds');
};

module.exports = { startCleanupService, cleanupExpiredReservations };
