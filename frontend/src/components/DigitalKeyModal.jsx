import React, { useState } from 'react';
import { X, Key, Wifi, CheckCircle2, Shield, Radio, Lock, Unlock } from 'lucide-react';
import { api } from '../services/api';

export default function DigitalKeyModal({ booking, onClose }) {
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedState, setUnlockedState] = useState(false);
  const [error, setError] = useState(null);

  const roomNumber = booking?.room_number || '304';
  const bookingRef = booking?.booking_reference || 'STAY-8821';
  const keyToken = booking?.digital_key?.key_token || 'KEY_NFC_772910';

  const handleSimulateUnlock = async () => {
    try {
      setUnlocking(true);
      setError(null);
      await api.validateNFCKey({
        keyToken,
        roomNumber
      });
      setUnlockedState(true);
      setTimeout(() => {
        setUnlockedState(false);
      }, 4000);
    } catch (err) {
      setError(err.message || 'Key validation error');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px', padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--accent-sage-dark)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Digital Room Pass</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Digital Luxury Key Card UI */}
        <div style={{
          background: 'linear-gradient(135deg, #FAF9F6 0%, #E8DDCC 100%)',
          border: '2px solid var(--accent-champagne)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-card)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          {/* Top Brand & NFC chip icon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>StaySync</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-champagne-dark)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Smart Room Access
              </div>
            </div>
            <Radio size={24} color="var(--accent-sage-dark)" />
          </div>

          {/* Room Number Big Display */}
          <div style={{ margin: '1rem 0' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Assigned Suite
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', lineHeight: 1 }}>
              {roomNumber}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-sage-dark)', marginTop: '4px' }}>
              {booking?.room_type_name || 'Deluxe Oceanfront Suite'}
            </div>
          </div>

          {/* Simulated QR Code Box */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '12px',
            display: 'inline-block',
            margin: '0.75rem auto'
          }}>
            {/* Visual SVG QR Representation */}
            <svg width="120" height="120" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#FFFFFF"/>
              {/* Corner position markers */}
              <rect x="10" y="10" width="24" height="24" fill="#343B36"/>
              <rect x="14" y="14" width="16" height="16" fill="#FFFFFF"/>
              <rect x="18" y="18" width="8" height="8" fill="#343B36"/>
              
              <rect x="66" y="10" width="24" height="24" fill="#343B36"/>
              <rect x="70" y="14" width="16" height="16" fill="#FFFFFF"/>
              <rect x="74" y="18" width="8" height="8" fill="#343B36"/>

              <rect x="10" y="66" width="24" height="24" fill="#343B36"/>
              <rect x="14" y="70" width="16" height="16" fill="#FFFFFF"/>
              <rect x="18" y="74" width="8" height="8" fill="#343B36"/>

              {/* Data modules */}
              <rect x="42" y="14" width="6" height="6" fill="#343B36"/>
              <rect x="52" y="24" width="6" height="6" fill="#343B36"/>
              <rect x="42" y="38" width="8" height="8" fill="#343B36"/>
              <rect x="62" y="46" width="6" height="6" fill="#343B36"/>
              <rect x="44" y="58" width="8" height="8" fill="#343B36"/>
              <rect x="74" y="68" width="6" height="6" fill="#343B36"/>
              <rect x="58" y="78" width="8" height="8" fill="#343B36"/>
            </svg>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {keyToken}
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Active for: <strong>{bookingRef}</strong> • NFC Tap Supported
          </div>
        </div>

        {/* Lock Unlock Simulation */}
        <div style={{ textAlign: 'center' }}>
          {error && (
            <div style={{ color: 'var(--error)', fontSize: '0.82rem', marginBottom: '8px' }}>{error}</div>
          )}

          <button
            onClick={handleSimulateUnlock}
            disabled={unlocking}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              backgroundColor: unlockedState ? 'var(--status-available-text)' : 'var(--accent-sage-dark)'
            }}
          >
            {unlocking ? (
              <span>Reading NFC Signal...</span>
            ) : unlockedState ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Unlock size={18} /> Room Door Unlocked (Welcome!)
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} /> Simulate NFC Door Unlock
              </span>
            )}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Simulates IoT RFID door reader interaction in production hotel.
          </div>
        </div>

      </div>
    </div>
  );
}
