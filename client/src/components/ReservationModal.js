// src/components/ReservationModal.js
import React, { useState } from 'react';
import api from '../services/api';
import './ReservationModal.css';

const ReservationModal = ({ item, machine, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');

  const handleReserve = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/reservations', {
        vendingMachineId: machine._id,
        itemId: item._id,
        quantity: parseInt(quantity)
      });
      
      setReservation(response.data.reservation);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (reservation) {
      onSuccess();
    } else {
      onClose();
    }
  };

  const totalPrice = item.price * quantity;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{reservation ? 'Reservation Confirmed!' : 'Reserve Item'}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          {!reservation ? (
            <>
              <div className="item-summary">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Price:</strong> ₹{item.price}</p>
                <p><strong>Location:</strong> {machine.hostelName} - {machine.location}</p>
              </div>
              
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              
              <div className="total-price">
                <strong>Total: ₹{totalPrice}</strong>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="modal-actions">
                <button onClick={onClose} className="cancel-button">
                  Cancel
                </button>
                <button 
                  onClick={handleReserve} 
                  className="confirm-button"
                  disabled={loading}
                >
                  {loading ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            </>
          ) : (
            <div className="reservation-details">
              <div className="success-message">
                <p>Your item has been reserved successfully!</p>
              </div>
              
              <div className="qr-code-section">
                <h4>QR Code:</h4>
                <img src={reservation.qrCode} alt="QR Code" className="qr-code" />
              </div>
              
              <div className="pin-section">
                <h4>PIN: <span className="pin-code">{reservation.pin}</span></h4>
              </div>
              
              <div className="expiration-info">
                <p><strong>Expires at:</strong> {new Date(reservation.expirationTime).toLocaleString()}</p>
                <p><strong>Total Paid:</strong> ₹{reservation.totalPrice}</p>
              </div>
              
              <div className="instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>Go to the vending machine at {machine.hostelName} - {machine.location}</li>
                  <li>Scan the QR code or enter the PIN</li>
                  <li>Collect your item(s)</li>
                  <li>Reservation expires in 30 minutes</li>
                </ol>
              </div>
              
              <button onClick={handleClose} className="done-button">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
