// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import InventoryList from './InventoryList';
import ReservationModal from './ReservationModal';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('inventory_updated', handleInventoryUpdate);
      
      return () => {
        socket.off('inventory_updated');
      };
    }
  }, [socket]);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = (update) => {
    setMachines(prevMachines => 
      prevMachines.map(machine => {
        if (machine._id === update.machineId) {
          return {
            ...machine,
            inventory: machine.inventory.map(inv => {
              if (inv.item._id === update.itemId) {
                return {
                  ...inv,
                  quantity: inv.quantity,
                  reservedQuantity: inv.quantity - update.newAvailableQuantity
                };
              }
              return inv;
            })
          };
        }
        return machine;
      })
    );
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleReserveItem = (item, machine) => {
    setSelectedItem({ item, machine });
    setShowReservationModal(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationModal(false);
    setSelectedItem(null);
    fetchInventory(); // Refresh inventory
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Smart Vending Machine System</h1>
        <SearchBar onSearch={handleSearch} />
      </div>
      
      <div className="dashboard-content">
        {machines.length === 0 ? (
          <div className="no-machines">
            <p>No vending machines available at the moment.</p>
          </div>
        ) : (
          machines.map(machine => (
            <div key={machine._id} className="machine-section">
              <h2>{machine.hostelName} - {machine.location}</h2>
              <InventoryList 
                inventory={machine.inventory}
                onReserve={(item) => handleReserveItem(item, machine)}
              />
            </div>
          ))
        )}
      </div>

      {showReservationModal && selectedItem && (
        <ReservationModal
          item={selectedItem.item}
          machine={selectedItem.machine}
          onClose={() => setShowReservationModal(false)}
          onSuccess={handleReservationSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
