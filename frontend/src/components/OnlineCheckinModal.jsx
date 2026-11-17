import React, { useState } from 'react';
import { X, ShieldCheck, Upload, FileText, CheckCircle, Clock, Key } from 'lucide-react';
import { api } from '../services/api';

export default function OnlineCheckinModal({ booking, onClose, onSuccess }) {
  const [docType, setDocType] = useState('PASSPORT');
  const [docNumber, setDocNumber] = useState('');
  const [arrivalTime, setArrivalTime] = useState('14:00 IST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [keyData, setKeyData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      setError('Please provide document / identity number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.performOnlineCheckin({
        bookingReference: booking.booking_reference,
        documentType: docType,
        documentNumber: docNumber,
        arrivalTime
      });

      setVerifiedSuccess(true);
      setKeyData(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.message || 'Check-in verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-sage-light)',
              color: 'var(--accent-sage-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Express Online Check-In</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ref: {booking.booking_reference} • Room {booking.room_number}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {!verifiedSuccess ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div style={{ background: 'var(--status-occupied-bg)', color: 'var(--status-occupied-text)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div>
              <label className="input-label">Government ID Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="select-field"
              >
                <option value="PASSPORT">Passport (International & Indian)</option>
                <option value="AADHAAR">Aadhaar Card (UIDAI Verified)</option>
                <option value="DRIVING_LICENSE">Driver's License</option>
                <option value="VOTER_ID">Voter Identity Card</option>
              </select>
            </div>

            <div>
              <label className="input-label">Document Identification Number</label>
              <input
                type="text"
                placeholder={docType === 'AADHAAR' ? 'XXXX-XXXX-XXXX' : 'e.g. Z9821455'}
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Expected Arrival Time</label>
              <select
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="select-field"
              >
                <option value="12:00 IST (Early)">12:00 PM IST (Early Arrival Request)</option>
                <option value="14:00 IST (Standard)">14:00 PM IST (Standard Check-in)</option>
                <option value="16:00 IST">16:00 PM IST</option>
                <option value="18:00 IST">18:00 PM IST (Late Arrival)</option>
                <option value="20:00+ IST">After 20:00 PM IST</option>
              </select>
            </div>

            {/* Simulated Document Upload Box */}
            <div style={{
              border: '2px dashed var(--border-light)',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              cursor: 'pointer'
            }}>
              <Upload size={24} color="var(--accent-sage-dark)" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Upload Document Scan (Optional for Demo)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>JPG, PNG or PDF up to 10MB • Auto-encrypted</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2 }}>
                {loading ? 'Verifying Identity...' : 'Confirm & Issue Digital Key'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle size={32} />
            </div>

            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 6px 0', fontFamily: 'var(--font-serif)' }}>
              Identity Verified & Checked In!
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Your reservation is officially active. Room <strong>{booking.room_number}</strong> is prepared. Your digital NFC & QR key pass is now active on your dashboard.
            </p>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div>Digital Pass Token: <strong>{keyData?.digital_key_token || 'KEY_NFC_772910'}</strong></div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Key Validity: Today through checkout at 11:00 AM
              </div>
            </div>

            <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
              View Digital Key on Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
