import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, RefreshCw, BellOff, Check, Filter } from 'lucide-react';

export default function HousekeepingDashboard() {
  const [tasks, setTasks] = useState([]);
  const [roomMatrix, setRoomMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getHousekeepingTasks();
      if (res.data?.tasks) setTasks(res.data.tasks);
      if (res.data?.roomMatrix) setRoomMatrix(res.data.roomMatrix);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.updateHousekeepingTaskStatus(taskId, { status: newStatus });
      setActionSuccess(`Task status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPriority === 'ALL') return true;
    return t.priority === filterPriority;
  });

  const dirtyCount = roomMatrix.filter(r => r.status === 'DIRTY').length;
  const cleanCount = roomMatrix.filter(r => r.status === 'AVAILABLE').length;
  const occupiedCount = roomMatrix.filter(r => r.status === 'OCCUPIED').length;

  return (
    <div className="app-container" style={{ padding: '3rem 0 5rem 0' }}>
      
      {/* Header Banner */}
      <div className="luxury-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Housekeeping & Room Readiness Console
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 6px 0', fontFamily: 'var(--font-serif)' }}>
            Turnover & Sanitation Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Logged in as <strong>Sarah Jenkins (Head of Housekeeping)</strong> • Real-time room turnover tracking
          </p>
        </div>

        <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Refresh Tasks
        </button>
      </div>

      {actionSuccess && (
        <div className="badge-available" style={{ width: '100%', padding: '12px 18px', marginBottom: '1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
          <Check size={16} /> {actionSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Awaiting Cleaning</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-occupied-text)', margin: '4px 0' }}>{dirtyCount} Rooms</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prioritized checkout cleans</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Clean & Available</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '4px 0' }}>{cleanCount} Rooms</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inspected & certified ready</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Currently Occupied</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{occupiedCount} Rooms</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Daily turndown scheduled</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Task Queue</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-sage-dark)', margin: '4px 0' }}>{tasks.length} Tasks</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Housekeeping team assigned</div>
        </div>
      </div>

      {/* Main Cleaning Tasks Table */}
      <div className="luxury-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)' }}>
              Assigned Cleaning & Turnover Tasks
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Checkout cleans automatically release rooms to AVAILABLE status upon inspection.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'HIGH', 'NORMAL'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-light)',
                  background: filterPriority === p ? 'var(--accent-sage-dark)' : '#FFFFFF',
                  color: filterPriority === p ? '#FFFFFF' : 'var(--text-primary)'
                }}
              >
                {p} Priority
              </button>
            ))}
          </div>
        </div>

        <table className="luxury-table">
          <thead>
            <tr>
              <th>Suite #</th>
              <th>Category</th>
              <th>Task Type</th>
              <th>Priority</th>
              <th>DND Status</th>
              <th>Current Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 700 }}>Suite #{t.room_number}</td>
                <td>{t.room_type_name || 'Deluxe Suite'}</td>
                <td>
                  <span className="badge-sand">{t.task_type}</span>
                </td>
                <td>
                  {t.priority === 'HIGH' ? (
                    <span className="badge-occupied">HIGH PRIORITY</span>
                  ) : (
                    <span className="badge-available">NORMAL</span>
                  )}
                </td>
                <td>
                  {t.dnd_enabled ? (
                    <span className="badge-occupied" style={{ fontSize: '0.72rem' }}>
                      <BellOff size={12} /> DND ACTIVE
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Normal Access</span>
                  )}
                </td>
                <td>
                  <span className={t.status === 'CLEAN' ? 'badge-available' : t.status === 'IN_PROGRESS' ? 'badge-pending' : 'badge-dirty'}>
                    {t.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {t.status === 'PENDING' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        Start Clean
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'INSPECTED')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        Inspect
                      </button>
                    )}
                    {t.status !== 'CLEAN' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'CLEAN')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        Mark Clean & Release
                      </button>
                    )}
                    {t.status === 'CLEAN' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--status-available-text)', fontWeight: 600 }}>✓ Released to Inventory</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Room Matrix Overview */}
      <div className="luxury-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
          Physical Suites Readiness Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {roomMatrix.map((rm) => (
            <div
              key={rm.id}
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
                background: rm.status === 'AVAILABLE' ? 'var(--status-available-bg)' : rm.status === 'DIRTY' ? 'var(--status-dirty-bg)' : '#FFFFFF'
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>#{rm.room_number}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Floor {rm.floor}</div>
              <div style={{ marginTop: '6px' }}>
                <span className={rm.status === 'AVAILABLE' ? 'badge-available' : rm.status === 'DIRTY' ? 'badge-dirty' : 'badge-occupied'} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                  {rm.status}
                </span>
              </div>
              {rm.dnd_enabled === 1 && (
                <div style={{ fontSize: '0.65rem', color: 'var(--error)', marginTop: '4px', fontWeight: 700 }}>
                  DND ON
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
