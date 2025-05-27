import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminReservations.css';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setError('');
      const response = await api.get('/admin/reservations');
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to fetch reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    return reservation?.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'redeemed': return '#007bff';
      case 'expired': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#333';
    }
  };

  if (loading) return <div className="loading">Loading reservations...</div>;

  if (error) {
    return (
      <div className="admin-reservations">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchReservations} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reservations">
      <div className="reservations-header">
        <h2>Reservation Management</h2>
        <div className="filter-container">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Reservations</option>
            <option value="active">Active</option>
            <option value="redeemed">Redeemed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="no-reservations">
          <p>No reservations found.</p>
        </div>
      ) : (
        <div className="reservations-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Item</th>
                <th>Machine</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => (
                <tr key={reservation._id}>
                  <td>{reservation?.userId?.name || 'Unknown User'}</td>
                  <td>{reservation?.itemId?.name || 'Unknown Item'}</td>
                  <td>
                    {reservation?.vendingMachineId?.hostelName || 'Unknown'} - {reservation?.vendingMachineId?.location || 'Unknown'}
                  </td>
                  <td>{reservation?.quantity || 0}</td>
                  <td>₹{reservation?.totalPrice || 0}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ color: getStatusColor(reservation?.status) }}
                    >
                      {(reservation?.status || 'unknown').toUpperCase()}
                    </span>
                  </td>
                  <td>{reservation?.createdAt ? new Date(reservation.createdAt).toLocaleString() : 'Unknown'}</td>
                  <td>{reservation?.expirationTime ? new Date(reservation.expirationTime).toLocaleString() : 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
