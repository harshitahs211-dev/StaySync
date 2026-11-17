import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Search, User, LogOut, Sparkles, Key, Compass, MessageSquareCode, ShieldCheck } from 'lucide-react';
import ArchitectureModal from './ArchitectureModal';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showArchModal, setShowArchModal] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const fastLoginRole = async (email, rolePath) => {
    try {
      setSwitchingRole(true);
      await login(email, 'StaySync@2026');
      navigate(rolePath);
    } catch (err) {
      console.error('Fast login failed:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'GUEST': return '/guest/dashboard';
      case 'RECEPTIONIST': return '/receptionist/dashboard';
      case 'MANAGER': return '/admin/dashboard';
      case 'HOUSEKEEPING': return '/housekeeping/dashboard';
      case 'MAINTENANCE': return '/maintenance/dashboard';
      case 'RESTAURANT': return '/services/dashboard';
      default: return '/guest/dashboard';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(250, 249, 246, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.75rem 0',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {/* Top Evaluation Quick-Role Switcher Bar */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          padding: '4px 1.5rem',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent-sage-dark)' }}>DEMO ACCESS:</span>
            <button onClick={() => fastLoginRole('guest@staysync.com', '/guest/dashboard')} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>Guest</button>
            <button onClick={() => fastLoginRole('reception@staysync.com', '/receptionist/dashboard')} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>Receptionist</button>
            <button onClick={() => fastLoginRole('manager@staysync.com', '/admin/dashboard')} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>Admin / Manager</button>
            <button onClick={() => fastLoginRole('housekeeping@staysync.com', '/housekeeping/dashboard')} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>Housekeeping</button>
            <button onClick={() => fastLoginRole('maintenance@staysync.com', '/maintenance/dashboard')} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>Maintenance</button>
            <button onClick={() => fastLoginRole('service@staysync.com', '/services/dashboard')} className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>Service Staff</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
            <span>🇮🇳 INR (₹) Enforced</span>
            <span>•</span>
            <span>Enterprise Hospitality Management Platform</span>
          </div>
        </div>

        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
          
          {/* Brand Logo */}
          <Link to={user ? getDashboardLink() : "/login"} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-sage-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)'
            }}>
              <Hotel size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.1', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                StaySync
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-champagne-dark)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                Grand Resorts & Spa • India
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <Link
              to={user ? getDashboardLink() : "/login"}
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: (isActive('/') || isActive('/login')) ? 'var(--accent-sage-dark)' : 'var(--text-secondary)',
                transition: 'color 0.2s ease'
              }}
            >
              {user ? 'Dashboard' : 'Portal Login'}
            </Link>

            <Link
              to="/search"
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: isActive('/search') ? 'var(--accent-sage-dark)' : 'var(--text-secondary)',
                transition: 'color 0.2s ease'
              }}
            >
              Hotels & Suites
            </Link>

            <button
              onClick={() => setShowArchModal(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Compass size={16} /> Architecture
            </button>
          </nav>

          {/* User Auth Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to={getDashboardLink()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <User size={16} color="var(--accent-sage-dark)" />
                  <span>{user.name}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'var(--accent-sage-light)',
                    color: 'var(--accent-sage-dark)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {showArchModal && <ArchitectureModal onClose={() => setShowArchModal(false)} />}
    </>
  );
}
