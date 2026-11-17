import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Lock, Mail, UserCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const loggedUser = await login(email, password);
      if (redirect && redirect !== '/') {
        navigate(redirect);
      } else {
        switch (loggedUser.role) {
          case 'GUEST': navigate('/guest/dashboard'); break;
          case 'RECEPTIONIST': navigate('/receptionist/dashboard'); break;
          case 'MANAGER': navigate('/admin/dashboard'); break;
          case 'HOUSEKEEPING': navigate('/housekeeping/dashboard'); break;
          case 'MAINTENANCE': navigate('/maintenance/dashboard'); break;
          case 'RESTAURANT': navigate('/services/dashboard'); break;
          default: navigate('/guest/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('StaySync@2026');
  };

  return (
    <div className="app-container" style={{ padding: '4rem 0', maxWidth: '480px' }}>
      
      <div className="glass-panel animate-fade" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-sage-dark)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)'
          }}>
            <Hotel size={28} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Sign In to StaySync
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Role-Based Access for Guests, Operations & Management
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--status-occupied-bg)',
            border: '1px solid rgba(201, 129, 118, 0.3)',
            color: 'var(--status-occupied-text)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div className="input-group">
            <label className="input-label"><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. guest@staysync.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label"><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.9rem', fontWeight: 700 }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>

        </form>

        {/* 1-Click Role Switcher for Academic Evaluator */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-champagne-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <UserCheck size={14} /> 1-Click Evaluator Accounts (Fill & Try)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button type="button" onClick={() => fillDemoAccount('guest@staysync.com')} className="btn-secondary" style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              👤 Guest
            </button>
            <button type="button" onClick={() => fillDemoAccount('reception@staysync.com')} className="btn-secondary" style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              🛎️ Receptionist
            </button>
            <button type="button" onClick={() => fillDemoAccount('manager@staysync.com')} className="btn-secondary" style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              💼 Manager / Admin
            </button>
            <button type="button" onClick={() => fillDemoAccount('housekeeping@staysync.com')} className="btn-secondary" style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              🧹 Housekeeping
            </button>
            <button type="button" onClick={() => fillDemoAccount('maintenance@staysync.com')} className="btn-secondary" style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              🔧 Maintenance
            </button>
            <button type="button" onClick={() => fillDemoAccount('service@staysync.com')} className="btn-secondary" style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}>
              🍽️ F&B Restaurant
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.6rem' }}>
            Password: <code>StaySync@2026</code>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-sage-dark)', fontWeight: 700 }}>Register Guest Account</Link>
        </div>

      </div>

    </div>
  );
}
