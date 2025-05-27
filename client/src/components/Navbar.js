import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
            Smart Vending System
          </Link>
        </div>
        
        <div className="navbar-menu">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" className="navbar-item">Admin Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-item">Dashboard</Link>
              <Link to="/reservations" className="navbar-item">My Reservations</Link>
            </>
          )}
          
          <div className="navbar-user">
            <span className="user-info">
              <span className="user-name">Welcome, {user?.name}</span>
              <span className="user-role">({user?.role})</span>
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
