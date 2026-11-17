import React from 'react';
import { X, Cpu, Server, Database, Zap, Lock, ShieldCheck, Activity, Award, Bell, Sparkles } from 'lucide-react';

export default function ArchitectureModal({ isOpen = true, onClose }) {
  if (isOpen === false) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-fade"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-sage-light)',
              color: 'var(--accent-sage-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-champagne-dark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Enterprise System Architecture & Engineering Blueprint
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                StaySync Service-Oriented Architecture
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Enterprise Technical Platform Banner */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <strong>StaySync Enterprise PMS v2.4:</strong> Multi-Property Cloud Hospitality Infrastructure
          </div>
          <div style={{ color: 'var(--accent-sage-dark)', fontWeight: 600 }}>
            Security: PCI-DSS Idempotency • Distributed Redis Mutex • HMAC SHA-256
          </div>
        </div>

        {/* High-Level Architecture Diagram Box (Light Theme Monospace) */}
        <div style={{
          backgroundColor: '#FAF9F6',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '0.78rem',
          color: '#343B36',
          lineHeight: '1.45',
          overflowX: 'auto',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.03)'
        }}>
          <pre style={{ margin: 0 }}>{`[ Guest Website & Role Portals (React 18 + Vite + Pure CSS Light Luxury) ]
                           │
                           ▼  HTTPS / REST APIs + JWT Auth Bearer Tokens
[ Express API Gateway & Role-Based Access Control (RBAC) Middleware ]
                           │
 ┌─────────────────────────┼─────────────────────────┬─────────────────────────┐
 ▼                         ▼                         ▼                         ▼
[ Auth & User Mgmt ]  [ Room & Inventory ]      [ Distributed Lock ]       [ Booking Engine ]
 - Bcrypt Hashing      - Real-Time SQL Query     - Redlock Mutex (5m TTL)   - Overlap Detector
 - 6-Role Hierarchy    - Dynamic Rate Rules      - Race-Condition Safety    - Folio Aggregator
 ├─────────────────────────┼─────────────────────────┼─────────────────────────┤
 ▼                         ▼                         ▼                         ▼
[ Automated Check-In ] [ Simulated IoT Room ]    [ Resilient Payment ]      [ In-Stay Operations ]
 - KYC Doc Verification- AC / Mood Lights / TV   - Idempotent API Keys      - Housekeeping Matrix
 - QR / NFC Key Pass   - Live DND Status Sync    - Auto GST Calculation     - Maintenance Queue
 ├─────────────────────────┼─────────────────────────┼─────────────────────────┤
 ▼                         ▼                         ▼                         ▼
[ F&B Dining Orders ]  [ NLP Review Sentiment ]  [ Loyalty & Rewards ]     [ Executive Analytics ]
 - Kitchen Workflow    - Aspect Tag Extraction   - 4-Tier Rewards Club      - ADR, RevPAR, Occupancy
 - Room Folio Charging - Star Rating Analysis    - Points Accrual/Redeem    - CSV Export Engine
 └─────────────────────────┴─────────────┬───────────┴─────────────────────────┘
                                         ▼
                 [ Dual-Driver Persistence: SQLite / PostgreSQL ]
                      20 Normalized Relational Tables + ACID Indexes`}</pre>
        </div>

        {/* 6 Key Architectural Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-sage-dark)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              <Lock size={16} /> Distributed Concurrency Locking
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Implements Redis Redlock pattern with a 5-minute TTL during room selection. Prevents simultaneous double-booking during peak checkout spikes with zero race conditions.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-champagne-dark)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              <Zap size={16} /> Idempotent Payment Transactions
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Every transaction generates an idempotency key before dispatch. Network timeouts or duplicate clicks are reconciled safely without duplicate guest credit card deductions.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-sage-dark)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              <ShieldCheck size={16} /> 6-Role Role-Based Access Control
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Granular JWT claims enforce least-privilege access for Guest, Receptionist, Manager/Admin, Housekeeping Staff, Maintenance Staff, and F&B Restaurant Staff.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-champagne-dark)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              <Activity size={16} /> Real-Time Room Folio Aggregator
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              In-stay room service, spa appointments, and mini-bar charges automatically append to the active stay folio, itemized with 18% Luxury GST on checkout.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-sage-dark)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              <Sparkles size={16} /> Aspect-Based Sentiment NLP Engine
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Guest reviews are analyzed across operational dimensions (Cleanliness, Dining, Room Comfort, Staff Courtesies, Wi-Fi) giving management actionable insights.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-champagne-dark)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
              <Award size={16} /> Automated Lifecycle & Loyalty
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              One-click checkout revokes digital room keys, automatically generates an urgent turnover task for Housekeeping, and credits loyalty points to the guest profile.
            </p>
          </div>

        </div>

        {/* Evaluation Demo Credentials */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ color: 'var(--accent-sage-dark)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Evaluation Credentials (All Accounts: <code>StaySync@2026</code>)
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click any role in the top bar to fast-switch</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.6rem', fontSize: '0.82rem' }}>
            <div><strong>👤 Guest:</strong> guest@staysync.com</div>
            <div><strong>🛎️ Receptionist:</strong> reception@staysync.com</div>
            <div><strong>💼 Manager / Admin:</strong> manager@staysync.com</div>
            <div><strong>🧹 Housekeeping:</strong> housekeeping@staysync.com</div>
            <div><strong>🔧 Maintenance:</strong> maintenance@staysync.com</div>
            <div><strong>🍽️ F&B Restaurant:</strong> service@staysync.com</div>
          </div>
        </div>

      </div>
    </div>
  );
}
