import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await register({ name, email, password, phone, role: 'GUEST' });
      navigate('/guest/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check details.');
    } finally {
      setSubmitting(false);
    }
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
            Create Guest Account
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Join StaySync for Instant Digital NFC Keys & Gold Loyalty Tier
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="input-group">
            <label className="input-label"><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="input-label"><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Contact Phone (India)</label>
            <input
              type="tel"
              className="input-field"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label"><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.9rem', marginTop: '0.5rem', fontWeight: 700 }}
          >
            {submitting ? 'Creating Guest Account...' : 'Register Account'} <ArrowRight size={16} />
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-sage-dark)', fontWeight: 700 }}>Sign In</Link>
        </div>

      </div>

    </div>
  );
}
