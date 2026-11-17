import React, { useState, useEffect } from 'react';
import { Thermometer, Sun, Moon, Tv, Volume2, BellOff, Check, RefreshCw, Power } from 'lucide-react';
import { api } from '../services/api';

export default function SmartRoomControls({ roomNumber }) {
  const [controls, setControls] = useState({
    temperature: 21,
    acPower: true,
    lightsMode: 'RELAX',
    masterLights: true,
    smartTvPower: false,
    dnd: false
  });
  const [loading, setLoading] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (roomNumber) {
      loadControls();
    }
  }, [roomNumber]);

  const loadControls = async () => {
    try {
      const res = await api.getRoomControls(roomNumber);
      if (res.data?.controls) setControls(res.data.controls);
    } catch (err) {
      console.warn('Using local controls state');
    }
  };

  const updateControl = async (updates) => {
    const newState = { ...controls, ...updates };
    setControls(newState);
    try {
      setLoading(true);
      await api.updateRoomControls(roomNumber, updates);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to sync control:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Smart Room Controls (IoT)</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room {roomNumber} Suite Automation</div>
        </div>
        {savedNotice && (
          <span className="badge-available" style={{ fontSize: '0.75rem' }}>
            <Check size={12} /> Sync Applied
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        
        {/* Thermostat */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              <Thermometer size={16} color="var(--accent-sage-dark)" /> Climate Control
            </div>
            <button
              onClick={() => updateControl({ acPower: !controls.acPower })}
              style={{
                background: controls.acPower ? 'var(--accent-sage-dark)' : 'var(--border-light)',
                color: controls.acPower ? '#FFF' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              {controls.acPower ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)', margin: '8px 0' }}>
            {controls.temperature}°C
          </div>
          <input
            type="range"
            min="18"
            max="26"
            value={controls.temperature}
            disabled={!controls.acPower}
            onChange={(e) => updateControl({ temperature: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-sage-dark)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Cool 18°C</span>
            <span>Warm 26°C</span>
          </div>
        </div>

        {/* Ambient Lighting Scenes */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sun size={16} color="var(--accent-champagne-dark)" /> Lighting Mood Scenes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['RELAX', 'READING', 'AMBIENT', 'NIGHT'].map((mode) => (
              <button
                key={mode}
                onClick={() => updateControl({ lightsMode: mode })}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: controls.lightsMode === mode ? '1px solid var(--accent-sage-dark)' : '1px solid var(--border-light)',
                  background: controls.lightsMode === mode ? 'var(--accent-sage-light)' : '#FFFFFF',
                  color: controls.lightsMode === mode ? 'var(--accent-sage-dark)' : 'var(--text-primary)'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* TV & Privacy (DND) */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tv size={16} /> 65" 4K Smart TV
            </span>
            <button
              onClick={() => updateControl({ smartTvPower: !controls.smartTvPower })}
              style={{
                background: controls.smartTvPower ? 'var(--accent-sage-dark)' : '#FFF',
                color: controls.smartTvPower ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              {controls.smartTvPower ? 'POWERED ON' : 'STANDBY'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: controls.dnd ? 'var(--error)' : 'var(--text-primary)' }}>
              <BellOff size={16} /> Do Not Disturb (DND)
            </span>
            <button
              onClick={() => updateControl({ dnd: !controls.dnd })}
              style={{
                background: controls.dnd ? 'var(--status-occupied-bg)' : '#FFF',
                color: controls.dnd ? 'var(--status-occupied-text)' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              {controls.dnd ? 'DND ACTIVE' : 'DISABLED'}
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            *Toggling DND updates the Housekeeping task board in real-time.
          </div>
        </div>

      </div>
    </div>
  );
}
