import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import MyReservations from './components/MyReservations';
import SearchResults from './components/SearchResults';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <SocketProvider>
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                !user ? (
                  <Login />
                ) : (
                  <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !user ? (
                  <Register />
                ) : (
                  <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />
                )
              } 
            />

            {/* Student Routes */}
            <Route 
              path="/dashboard" 
              element={
                user && user.role === 'student' ? (
                  <Dashboard />
                ) : user && user.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/reservations" 
              element={
                user && user.role === 'student' ? (
                  <MyReservations />
                ) : user && user.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/search" 
              element={
                user && user.role === 'student' ? (
                  <SearchResults />
                ) : user && user.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                user && user.role === 'admin' ? (
                  <AdminDashboard />
                ) : user && user.role === 'student' ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={
                    user 
                      ? (user.role === 'admin' ? "/admin" : "/dashboard")
                      : "/login"
                  } 
                  replace 
                />
              } 
            />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <Navigate 
                  to={
                    user 
                      ? (user.role === 'admin' ? "/admin" : "/dashboard")
                      : "/login"
                  } 
                  replace 
                />
              } 
            />
          </Routes>
        </div>
      </SocketProvider>
    </>
  );
}

export default App;
