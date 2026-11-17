import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ArchitectureModal from './components/ArchitectureModal';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthLandingPage from './pages/AuthLandingPage';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import RoomDetailPage from './pages/RoomDetailPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboards
import GuestDashboard from './pages/dashboards/GuestDashboard';
import ReceptionDashboard from './pages/dashboards/ReceptionDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import HousekeepingDashboard from './pages/dashboards/HousekeepingDashboard';
import MaintenanceDashboard from './pages/dashboards/MaintenanceDashboard';
import RestaurantDashboard from './pages/dashboards/RestaurantDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          <Navbar />

          <main style={{ flex: 1 }}>
            <Routes>
              {/* Default Entry Point: Authentication-First Experience */}
              <Route path="/" element={<AuthLandingPage defaultTab="LOGIN" />} />
              <Route path="/login" element={<AuthLandingPage defaultTab="LOGIN" />} />
              <Route path="/register" element={<AuthLandingPage defaultTab="REGISTER" />} />

              {/* Public Exploration (Continue as Guest) */}
              <Route path="/search" element={<SearchPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Booking Flow */}
              <Route path="/booking" element={
                <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'MANAGER']}>
                  <BookingPage />
                </ProtectedRoute>
              } />

              {/* Canonical Role-Based Dashboards */}
              <Route path="/guest/dashboard" element={
                <ProtectedRoute allowedRoles={['GUEST']}>
                  <GuestDashboard />
                </ProtectedRoute>
              } />

              <Route path="/receptionist/dashboard" element={
                <ProtectedRoute allowedRoles={['RECEPTIONIST', 'MANAGER']}>
                  <ReceptionDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/housekeeping/dashboard" element={
                <ProtectedRoute allowedRoles={['HOUSEKEEPING', 'MANAGER']}>
                  <HousekeepingDashboard />
                </ProtectedRoute>
              } />

              <Route path="/maintenance/dashboard" element={
                <ProtectedRoute allowedRoles={['MAINTENANCE', 'MANAGER']}>
                  <MaintenanceDashboard />
                </ProtectedRoute>
              } />

              <Route path="/services/dashboard" element={
                <ProtectedRoute allowedRoles={['RESTAURANT', 'MANAGER']}>
                  <RestaurantDashboard />
                </ProtectedRoute>
              } />

              {/* Backward-Compatible Redirects */}
              <Route path="/dashboard/guest" element={<Navigate to="/guest/dashboard" replace />} />
              <Route path="/dashboard/reception" element={<Navigate to="/receptionist/dashboard" replace />} />
              <Route path="/dashboard/manager" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/dashboard/housekeeping" element={<Navigate to="/housekeeping/dashboard" replace />} />
              <Route path="/dashboard/maintenance" element={<Navigate to="/maintenance/dashboard" replace />} />
              <Route path="/dashboard/restaurant" element={<Navigate to="/services/dashboard" replace />} />
              <Route path="/dashboard/staff" element={<Navigate to="/services/dashboard" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>

          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}

