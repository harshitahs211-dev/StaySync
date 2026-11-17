import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Wrench, CheckCircle, AlertCircle, Clock, Plus, RefreshCw, Check } from 'lucide-react';

export default function MaintenanceDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRoom, setNewRoom] = useState('402');
  const [newIssue, setNewIssue] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [actionNotice, setActionNotice] = useState(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.getMaintenanceTickets();
      if (res.data?.tickets) setTickets(res.data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newIssue.trim()) return;
    try {
      await api.createMaintenanceTicket({
        roomNumber: newRoom,
        issueType: newIssue,
        priority: newPriority,
        technician: 'David Miller'
      });
      setShowNewModal(false);
      setNewIssue('');
      setActionNotice('New maintenance ticket logged');
      setTimeout(() => setActionNotice(null), 3000);
      loadTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.updateMaintenanceTicket(ticketId, {
        status: newStatus,
        resolutionNotes: newStatus === 'RESOLVED' ? 'Inspected and certified operational by engineering team.' : null
      });
      setActionNotice(`Ticket status changed to ${newStatus}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="app-container" style={{ padding: '3rem 0 5rem 0' }}>
      
      {/* Header Banner */}
      <div className="luxury-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Engineering & Facility Maintenance
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 6px 0', fontFamily: 'var(--font-serif)' }}>
            Maintenance & Work Order Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Logged in as <strong>David Miller (Chief Maintenance Engineer)</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowNewModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} /> Log New Ticket
          </button>
          <button onClick={loadTickets} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="badge-available" style={{ width: '100%', padding: '12px 18px', marginBottom: '1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
          <Check size={16} /> {actionNotice}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Open Tickets</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-occupied-text)', margin: '4px 0' }}>{openCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending technician review</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-pending-text)', margin: '4px 0' }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Under repair / testing</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resolved & Certified</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '4px 0' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room restored to service</div>
        </div>
      </div>

      {/* Tickets Master Table */}
      <div className="luxury-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>
          Active Maintenance Ticket Queue
        </h2>

        <table className="luxury-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Suite #</th>
              <th>Issue Description</th>
              <th>Priority</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 700, color: 'var(--accent-sage-dark)' }}>{t.id}</td>
                <td><strong>Suite #{t.room_number}</strong></td>
                <td>
                  <div>{t.issue_type}</div>
                  {t.resolution_notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--status-available-text)', marginTop: '2px' }}>
                      Notes: {t.resolution_notes}
                    </div>
                  )}
                </td>
                <td>
                  {t.priority === 'HIGH' ? (
                    <span className="badge-occupied">HIGH</span>
                  ) : t.priority === 'MEDIUM' ? (
                    <span className="badge-pending">MEDIUM</span>
                  ) : (
                    <span className="badge-available">LOW</span>
                  )}
                </td>
                <td>{t.technician || 'David Miller'}</td>
                <td>
                  <span className={t.status === 'RESOLVED' ? 'badge-available' : t.status === 'IN_PROGRESS' ? 'badge-pending' : 'badge-dirty'}>
                    {t.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {t.status === 'OPEN' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        Start Work
                      </button>
                    )}
                    {t.status !== 'RESOLVED' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'RESOLVED')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        Resolve & Certify
                      </button>
                    )}
                    {t.status === 'RESOLVED' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--status-available-text)', fontWeight: 600 }}>✓ Closed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Log Engineering Work Order</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Room Number</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="input-label">Issue Description</label>
                <textarea
                  value={newIssue}
                  onChange={e => setNewIssue(e.target.value)}
                  placeholder="e.g. AC thermostat sensor replacement or shower water pressure..."
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="input-label">Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="select-field">
                  <option value="HIGH">High Priority (Immediate Guest Impact)</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low (Preventative / Scheduled)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
