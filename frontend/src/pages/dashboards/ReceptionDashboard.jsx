import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatCurrency, formatDisplayDate } from '../../utils/formatCurrency';
import { Hotel, UserCheck, Calendar, Search, LogOut, CheckCircle2, Clock, Plus, Key, RefreshCw, X, Shield, MapPin, Check } from 'lucide-react';

export default function ReceptionDashboard() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [notice, setNotice] = useState(null);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInRoomId, setWalkInRoomId] = useState('');
  const [walkInCheckIn, setWalkInCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [walkInCheckOut, setWalkInCheckOut] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [walkInGuests, setWalkInGuests] = useState(2);
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bkRes, rmRes] = await Promise.all([
        api.getBookings(),
        api.getRooms()
      ]);
      if (bkRes.data?.bookings) setBookings(bkRes.data.bookings);
      if (rmRes.data?.rooms) {
        setRooms(rmRes.data.rooms);
        const availableOne = rmRes.data.rooms.find(r => r.status === 'AVAILABLE');
        if (availableOne) setWalkInRoomId(availableOne.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingWalkIn(true);
      await api.createWalkInBooking({
        guestName: walkInName,
        guestEmail: walkInEmail,
        guestPhone: walkInPhone,
        roomId: walkInRoomId,
        checkIn: walkInCheckIn,
        checkOut: walkInCheckOut,
        totalGuests: walkInGuests,
        paymentMethod: 'ADVANCE'
      });
      setShowWalkInModal(false);
      setNotice('Walk-in booking created and confirmed successfully');
      setTimeout(() => setNotice(null), 3500);
      setWalkInName('');
      setWalkInEmail('');
      loadData();
    } catch (err) {
      alert(err.message || 'Walk-in booking failed');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  const handleCheckoutGuest = async (bookingId) => {
    if (window.confirm('Process automated checkout and settle running folio for this guest?')) {
      try {
        await api.checkoutBooking(bookingId);
        setNotice('Guest checked out. Digital key revoked and housekeeping notified.');
        setTimeout(() => setNotice(null), 3500);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredBookings = bookings.filter(b => 
    (b.guest_name && b.guest_name.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (b.booking_reference && b.booking_reference.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (b.room_number && b.room_number.includes(searchFilter))
  );

  const activeCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="app-container" style={{ padding: '3rem 0 5rem 0' }}>
      
      {/* Header Banner */}
      <div className="luxury-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Front Desk Master Console
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 6px 0', fontFamily: 'var(--font-serif)' }}>
            Receptionist Guest Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Logged in as <strong>Elena Rostova (Chief Receptionist)</strong> • Real-time guest arrivals, walk-ins & key management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowWalkInModal(true)} className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
            <Plus size={16} /> New Walk-In Booking
          </button>
          <button onClick={loadData} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.9rem' }}>
            <RefreshCw size={15} /> Refresh Roster
          </button>
        </div>
      </div>

      {notice && (
        <div className="badge-available" style={{ width: '100%', padding: '12px 18px', marginBottom: '1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
          <Check size={16} /> {notice}
        </div>
      )}

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active In-House Stays</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-sage-dark)', margin: '4px 0' }}>{activeCount} Guests</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Keys active & suites occupied</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Today's Departures</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-champagne-dark)', margin: '4px 0' }}>1 Scheduled</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automated folio checkout enabled</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completed Stays</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '4px 0' }}>{completedCount} Stays</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Folios settled & archived</div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Available Room Inventory</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
            {rooms.filter(r => r.status === 'AVAILABLE').length} Available
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ready for immediate walk-in</div>
        </div>
      </div>

      {/* Guest Master Roster */}
      <div className="luxury-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)' }}>
              Guest Reservations & Master Roster
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Search across guest name, room number, or booking reference
            </div>
          </div>

          <div style={{ width: '300px' }}>
            <input
              type="text"
              placeholder="Search guest or STAY-xxxx..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="luxury-input"
              style={{ padding: '8px 14px', fontSize: '0.88rem' }}
            />
          </div>
        </div>

        <table className="luxury-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Guest Name & Contact</th>
              <th>Suite #</th>
              <th>Dates</th>
              <th>Tariff</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 700, color: 'var(--accent-sage-dark)' }}>{b.booking_reference}</td>
                <td>
                  <div><strong>{b.guest_name}</strong></div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{b.guest_email} • {b.guest_phone}</div>
                </td>
                <td>
                  <strong>Suite #{b.room_number}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.room_type_name}</div>
                </td>
                <td>
                  <div>{formatDisplayDate(b.check_in)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>to {formatDisplayDate(b.check_out)}</div>
                </td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(b.total_price)}</td>
                <td>
                  <span className={b.status === 'CONFIRMED' ? 'badge-available' : b.status === 'COMPLETED' ? 'badge-sand' : 'badge-occupied'}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === 'CONFIRMED' ? (
                    <button onClick={() => handleCheckoutGuest(b.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      Process Checkout
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Archived</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Room Status Overview Grid */}
      <div className="luxury-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
          Hotel Room Inventory Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {rooms.map((rm) => (
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
            </div>
          ))}
        </div>
      </div>

      {/* Walk-in Booking Modal */}
      {showWalkInModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="var(--accent-sage-dark)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create Walk-In Reservation</h3>
              </div>
              <button onClick={() => setShowWalkInModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Guest Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Malhotra"
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={walkInEmail}
                    onChange={e => setWalkInEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91-98000-00000"
                    value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Select Available Suite</label>
                <select value={walkInRoomId} onChange={e => setWalkInRoomId(e.target.value)} className="select-field" required>
                  {rooms.filter(r => r.status === 'AVAILABLE').map(r => (
                    <option key={r.id} value={r.id}>
                      Suite #{r.room_number} - {r.room_type_name} ({formatCurrency(r.base_price_per_night)}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Check-In</label>
                  <input
                    type="date"
                    value={walkInCheckIn}
                    min={todayStr}
                    onChange={e => {
                      const val = e.target.value;
                      setWalkInCheckIn(val);
                      if (!walkInCheckOut || new Date(walkInCheckOut) <= new Date(val)) {
                        const next = new Date(new Date(val).getTime() + 86400000).toISOString().split('T')[0];
                        setWalkInCheckOut(next);
                      }
                    }}
                    className="input-field"
                    style={{ colorScheme: 'light', backgroundColor: '#FFFFFF', color: '#343B36', fontWeight: 600 }}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Check-Out</label>
                  <input
                    type="date"
                    value={walkInCheckOut}
                    min={walkInCheckIn ? new Date(new Date(walkInCheckIn).getTime() + 86400000).toISOString().split('T')[0] : todayStr}
                    onChange={e => setWalkInCheckOut(e.target.value)}
                    className="input-field"
                    style={{ colorScheme: 'light', backgroundColor: '#FFFFFF', color: '#343B36', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowWalkInModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingWalkIn} className="btn-primary" style={{ flex: 2 }}>
                  {submittingWalkIn ? 'Confirming...' : 'Confirm Walk-In & Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
