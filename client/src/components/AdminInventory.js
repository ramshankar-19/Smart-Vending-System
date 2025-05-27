import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminInventory.css';

const AdminInventory = () => {
  const [machines, setMachines] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAddToMachine, setShowAddToMachine] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesRes, itemsRes] = await Promise.all([
        api.get('/admin/machines'),
        api.get('/admin/items')
      ]);
      setMachines(machinesRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (machineId, itemId, quantity) => {
    try {
      await api.put(`/admin/machines/${machineId}/inventory`, {
        itemId,
        quantity: parseInt(quantity)
      });
      fetchData();
      setEditingInventory(null);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const handleRemoveFromInventory = async (machineId, itemId) => {
    if (window.confirm('Are you sure you want to remove this item from the machine?')) {
      try {
        await api.delete(`/admin/machines/${machineId}/inventory/${itemId}`);
        fetchData();
      } catch (error) {
        console.error('Error removing item from inventory:', error);
      }
    }
  };

  const handleToggleMaintenance = async (machineId, currentStatus) => {
    try {
      await api.put(`/admin/machines/${machineId}/maintenance`, {
        isActive: !currentStatus
      });
      fetchData();
    } catch (error) {
      console.error('Error updating machine status:', error);
    }
  };

  const handleAddToMachine = (machine) => {
    setSelectedMachine(machine);
    setShowAddToMachine(true);
  };

  if (loading) return <div className="loading">Loading inventory...</div>;

  return (
    <div className="admin-inventory">
      <div className="inventory-header">
          <h2>Inventory Management</h2>
            <div className="header-actions">
                <button 
                className="btn btn-success"
                onClick={() => setShowAddItem(true)}
                title="Create a new item and optionally add to all machines"
                >
                + Create & Distribute Item
                </button>
                <button 
                className="btn btn-secondary"
                onClick={() => setShowAddMachine(true)}
                >
                + Add New Machine
                </button>
            </div>
       </div>



      <div className="machines-grid">
        {machines.map(machine => (
          <div key={machine._id} className="machine-card">
            <div className="machine-header">
              <div className="machine-info">
                <h3>{machine.hostelName}</h3>
                <p>{machine.location}</p>
                <span className="machine-id">ID: {machine.machineId}</span>
              </div>
              <div className="machine-controls">
                <span className={`status ${machine.isActive ? 'active' : 'maintenance'}`}>
                  {machine.isActive ? 'Active' : 'Maintenance'}
                </span>
                <button
                  className={`maintenance-btn ${machine.isActive ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => handleToggleMaintenance(machine._id, machine.isActive)}
                >
                  {machine.isActive ? 'Set Maintenance' : 'Activate'}
                </button>
              </div>
            </div>

            <div className="machine-inventory">
              <div className="inventory-header-section">
                <h4>Inventory ({machine.inventory.length} items)</h4>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddToMachine(machine)}
                >
                  + Add Item
                </button>
              </div>

              {machine.inventory.length === 0 ? (
                <div className="empty-inventory">
                  <p>No items in this machine</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToMachine(machine)}
                  >
                    Add First Item
                  </button>
                </div>
              ) : (
                machine.inventory.map(inv => (
                  <div key={inv.item._id} className="inventory-item">
                    <div className="item-info">
                      <span className="item-name">{inv.item.name}</span>
                      <span className="item-price">₹{inv.item.price}</span>
                      <span className="item-category">{inv.item.category}</span>
                    </div>
                    <div className="quantity-info">
                      {editingInventory === `${machine._id}-${inv.item._id}` ? (
                        <div className="edit-quantity">
                          <input
                            type="number"
                            defaultValue={inv.quantity}
                            min="0"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateInventory(
                                  machine._id,
                                  inv.item._id,
                                  e.target.value
                                );
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingInventory(null)}
                            className="cancel-edit"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="quantity-display">
                          <span>Stock: {inv.quantity}</span>
                          <span>Reserved: {inv.reservedQuantity}</span>
                          <span>Available: {inv.quantity - inv.reservedQuantity}</span>
                          <div className="item-actions">
                            <button
                              onClick={() => setEditingInventory(`${machine._id}-${inv.item._id}`)}
                              className="edit-btn"
                              title="Edit Quantity"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleRemoveFromInventory(machine._id, inv.item._id)}
                              className="remove-btn"
                              title="Remove from Machine"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create New Item Modal */}
      {showAddItem && (
        <CreateItemModal
          onClose={() => setShowAddItem(false)}
          onSuccess={() => {
            setShowAddItem(false);
            fetchData();
          }}
        />
      )}

      {/* Add New Machine Modal */}
      {showAddMachine && (
        <AddMachineModal
          onClose={() => setShowAddMachine(false)}
          onSuccess={() => {
            setShowAddMachine(false);
            fetchData();
          }}
        />
      )}

      {/* Add Item to Machine Modal */}
      {showAddToMachine && selectedMachine && (
        <AddToMachineModal
          machine={selectedMachine}
          availableItems={items}
          onClose={() => {
            setShowAddToMachine(false);
            setSelectedMachine(null);
          }}
          onSuccess={() => {
            setShowAddToMachine(false);
            setSelectedMachine(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Create New Item Modal
// Enhanced Create New Item Modal that adds to all machines
const CreateItemModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'snacks',
    initialQuantity: 10,
    addToAllMachines: true
  });
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    // Fetch machines for the checkbox option
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await api.get('/admin/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First create the item
      const itemResponse = await api.post('/admin/items', {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category
      });

      const newItem = itemResponse.data;

      // If addToAllMachines is checked, add to all active machines
      if (formData.addToAllMachines) {
        const addToMachinePromises = machines
          .filter(machine => machine.isActive) // Only add to active machines
          .map(machine => 
            api.put(`/admin/machines/${machine._id}/inventory`, {
              itemId: newItem._id,
              quantity: parseInt(formData.initialQuantity)
            }).catch(error => {
              console.error(`Error adding item to machine ${machine.machineId}:`, error);
              return null; // Continue with other machines even if one fails
            })
          );

        await Promise.all(addToMachinePromises);
      }

      alert(`Item "${newItem.name}" created successfully${formData.addToAllMachines ? ' and added to all active machines' : ''}!`);
      onSuccess();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Item</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                placeholder="e.g., Coca Cola"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
                <option value="instant_food">Instant Food</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Brief description of the item"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Initial Quantity per Machine</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.initialQuantity}
                onChange={(e) => setFormData({...formData, initialQuantity: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.addToAllMachines}
                onChange={(e) => setFormData({...formData, addToAllMachines: e.target.checked})}
              />
              <span className="checkmark"></span>
              Add this item to all active vending machines ({machines.filter(m => m.isActive).length} machines)
            </label>
          </div>

          {formData.addToAllMachines && (
            <div className="machines-preview">
              <h4>Will be added to:</h4>
              <div className="machines-list">
                {machines.filter(m => m.isActive).map(machine => (
                  <div key={machine._id} className="machine-preview">
                    <span className="machine-name">{machine.hostelName} - {machine.location}</span>
                    <span className="machine-quantity">{formData.initialQuantity} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : `Create Item${formData.addToAllMachines ? ' & Add to Machines' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Item to Machine Modal
const AddToMachineModal = ({ machine, availableItems, onClose, onSuccess }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter out items already in the machine
  const machineItemIds = machine.inventory.map(inv => inv.item._id);
  const filteredItems = availableItems.filter(item => !machineItemIds.includes(item._id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select an item');
      return;
    }
    
    setLoading(true);
    try {
      await api.put(`/admin/machines/${machine._id}/inventory`, {
        itemId: selectedItem,
        quantity: parseInt(quantity)
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding item to machine:', error);
      alert('Error adding item to machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Item to {machine.hostelName} - {machine.location}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="no-items-available">
            <p>All available items are already in this machine.</p>
            <div className="modal-actions">
              <button onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Item *</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                required
              >
                <option value="">Choose an item...</option>
                {filteredItems.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} - ₹{item.price} ({item.category})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Initial Quantity *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Adding...' : 'Add to Machine'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Add Machine Modal
const AddMachineModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    machineId: '',
    location: '',
    hostelName: ''
  });
  const [loading, setLoading] = useState(false);

  const hostels = ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/machines', {
        ...formData,
        inventory: []
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding machine:', error);
      alert('Error creating machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Vending Machine</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Machine ID *</label>
            <input
              type="text"
              placeholder="e.g., VM001"
              value={formData.machineId}
              onChange={(e) => setFormData({...formData, machineId: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Hostel *</label>
            <select
              value={formData.hostelName}
              onChange={(e) => setFormData({...formData, hostelName: e.target.value})}
              required
            >
              <option value="">Select Hostel</option>
              {hostels.map(hostel => (
                <option key={hostel} value={hostel}>{hostel}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              placeholder="e.g., Ground Floor, Near Entrance"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInventory;
