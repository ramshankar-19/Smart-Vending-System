import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalMachines: 0,
    totalReservations: 0,
    totalRevenue: 0,
    popularItems: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError('');
      const response = await api.get('/admin/analytics');
      setAnalytics({
        totalUsers: response.data?.totalUsers || 0,
        totalMachines: response.data?.totalMachines || 0,
        totalReservations: response.data?.totalReservations || 0,
        totalRevenue: response.data?.totalRevenue || 0,
        popularItems: response.data?.popularItems || [],
        recentActivity: response.data?.recentActivity || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  if (error) {
    return (
      <div className="admin-analytics">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <h2>System Analytics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{analytics.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <h3>{analytics.totalMachines}</h3>
            <p>Vending Machines</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-info">
            <h3>{analytics.totalReservations}</h3>
            <p>Total Reservations</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{analytics.totalRevenue}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h3>Popular Items</h3>
          <div className="popular-items">
            {analytics.popularItems.length === 0 ? (
              <p>No data available</p>
            ) : (
              analytics.popularItems.map((item, index) => (
                <div key={item?._id || index} className="popular-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="item-name">{item?.name || 'Unknown Item'}</span>
                  <span className="item-count">{item?.count || 0} sold</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Recent Activity</h3>
          <div className="recent-activity">
            {analytics.recentActivity.length === 0 ? (
              <p>No recent activity</p>
            ) : (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-time">
                    {activity?.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time'}
                  </span>
                  <span className="activity-description">{activity?.description || 'No description'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
