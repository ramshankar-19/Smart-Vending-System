// src/components/MyReservations.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MyReservations.css';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my-reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await api.delete(`/reservations/${reservationId}`);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'redeemed': return 'blue';
      case 'expired': return 'red';
      case 'cancelled': return 'gray';
      default: return 'black';
    }
  };

  if (loading) {
    return <div className="loading">Loading reservations...</div>;
  }

  return (
    <div className="my-reservations">
      <h1>My Reservations</h1>
      
      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>You have no reservations yet.</p>
        </div>
      ) : (
        <div className="reservations-list">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-header">
                <h3>{reservation.itemId.name}</h3>
                <span 
                  className="status-badge"
                  style={{ color: getStatusColor(reservation.status) }}
                >
                  {reservation.status.toUpperCase()}
                </span>
              </div>
              
              <div className="reservation-details">
                <p><strong>Location:</strong> {reservation.vendingMachineId.hostelName} - {reservation.vendingMachineId.location}</p>
                <p><strong>Quantity:</strong> {reservation.quantity}</p>
                <p><strong>Total Price:</strong> ₹{reservation.totalPrice}</p>
                <p><strong>Reserved:</strong> {new Date(reservation.reservationTime).toLocaleString()}</p>
                <p><strong>Expires:</strong> {new Date(reservation.expirationTime).toLocaleString()}</p>
                
                {reservation.status === 'active' && (
                  <>
                    <p><strong>PIN:</strong> <span className="pin-display">{reservation.pin}</span></p>
                    <div className="reservation-actions">
                      <button 
                        onClick={() => handleCancelReservation(reservation._id)}
                        className="cancel-button"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservations;
