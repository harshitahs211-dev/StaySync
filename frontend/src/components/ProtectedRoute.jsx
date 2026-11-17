import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Hotel, LogOut, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAF9F6'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: '#5B6A53',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          marginBottom: '1rem',
          boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)'
        }}>
          <Hotel size={28} />
        </div>
        <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#343B36', marginBottom: '0.25rem' }}>
          StaySync
        </div>
        <div style={{ fontSize: '0.85rem', color: '#8C754E', fontStyle: 'italic' }}>
          Verifying security session...
        </div>
      </div>
    );
  }

  // If user is not authenticated, strictly redirect to /login with history replacement
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not authorized for this specific protected route
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const getRoleDashboard = (role) => {
      switch (role) {
        case 'GUEST': return '/guest/dashboard';
        case 'RECEPTIONIST': return '/receptionist/dashboard';
        case 'MANAGER': return '/admin/dashboard';
        case 'HOUSEKEEPING': return '/housekeeping/dashboard';
        case 'MAINTENANCE': return '/maintenance/dashboard';
        case 'RESTAURANT': return '/services/dashboard';
        default: return '/guest/dashboard';
      }
    };

    return (
      <div className="app-container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '540px',
          margin: '0 auto',
          padding: '3rem 2rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E8E4DC',
          boxShadow: '0 10px 30px rgba(52, 59, 54, 0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#FBF0EE',
            border: '1px solid #F1C3BA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: '#B34A3A'
          }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#343B36', fontFamily: 'Playfair Display, Georgia, serif', marginBottom: '0.5rem' }}>
            Access Restricted (403 Forbidden)
          </h2>
          <p style={{ color: '#6E7770', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your active session is signed in as <strong>{user.name}</strong> with role <strong>{user.role}</strong>. This protected route is restricted to {allowedRoles.join(', ')}.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={getRoleDashboard(user.role)}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#5B6A53',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> Return to Your {user.role} Dashboard
            </Link>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8E4DC',
                color: '#B34A3A',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} /> Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
