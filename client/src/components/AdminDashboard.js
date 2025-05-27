import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminInventory from './AdminInventory';
import AdminUsers from './AdminUsers';
import AdminReservations from './AdminReservations';
import AdminAnalytics from './AdminAnalytics';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { user } = useAuth();

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'inventory', label: 'Inventory Management', icon: '📦' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'reservations', label: 'Reservations', icon: '🎫' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AdminAnalytics />;
      case 'inventory':
        return <AdminInventory />;
      case 'users':
        return <AdminUsers />;
      case 'reservations':
        return <AdminReservations />;
      default:
        return <AdminAnalytics />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
