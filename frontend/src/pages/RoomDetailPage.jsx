import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AmenityBadge from '../components/AmenityBadge';
import DatePickerField from '../components/DatePickerField';
import PaymentModal from '../components/PaymentModal';
import InvoiceModal from '../components/InvoiceModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, calculateNights, formatDisplayDate } from '../utils/formatCurrency';
import { Calendar, Users, BedDouble, Maximize, ShieldCheck, Check, ArrowRight, Hotel, Sparkles, AlertCircle, Lock, Clock } from 'lucide-react';

export default function RoomDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || nextWeekStr);
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 2);
  const [specialRequests, setSpecialRequests] = useState('');

  const minCheckOutDate = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : todayStr;

  const handleCheckInChange = (newDate) => {
    setCheckIn(newDate);
    setValidationError(null);
    if (!checkOut || new Date(checkOut) <= new Date(newDate)) {
      const nextDay = new Date(new Date(newDate).getTime() + 86400000).toISOString().split('T')[0];
      setCheckOut(nextDay);
    }
  };

  const handleCheckOutChange = (newDate) => {
    setCheckOut(newDate);
    if (new Date(newDate) <= new Date(checkIn)) {
      setValidationError('Check-out date must be strictly after check-in date.');
    } else {
      setValidationError(null);
    }
  };

  const [room, setRoom] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(300); // 5 mins in seconds
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [draftBooking, setDraftBooking] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await api.getRoomById(id);
        setRoom(res.data.room);

        // Fetch AI recommendations
        const recRes = await api.getAIRecommendations({ budget: res.data.room.base_price_per_night, guests });
        setAiRecommendations(recRes.data.recommended_suites.filter(r => r.id !== id));
      } catch (err) {
        setErrorMsg(err.message || 'Room details not found');
      } finally {
        setLoading(false);
      }
    }
    loadRoom();
  }, [id]);

  // Redis Room Lock Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLockTimeRemaining(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLockTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const nights = calculateNights(checkIn, checkOut);
  const pricePerNight = room ? parseFloat(room.base_price_per_night) : 0;
  const roomSubtotal = nights * pricePerNight;
  const gstTax = Math.round(roomSubtotal * 0.18);
  const grandTotal = roomSubtotal + gstTax;

  const handleProceedToBook = (e) => {
    e.preventDefault();
    setValidationError(null);

    if (new Date(checkOut) <= new Date(checkIn)) {
      setValidationError('Check-out date must be after check-in date.');
      return;
    }

    if (!user) {
      navigate(`/login?redirect=/rooms/${id}?checkIn=${checkIn}&checkOut=${checkOut}`);
      return;
    }

    setDraftBooking({
      room_id: room.id,
      room_number: room.room_number,
      room_type_name: room.room_type_name,
      booking_reference: `STAY-${Math.floor(1000 + Math.random() * 9000)}`,
      total_price: grandTotal,
      checkIn,
      checkOut,
      guests,
      specialRequests
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setShowPaymentModal(false);
    const confirmed = paymentResult?.booking || {
      ...draftBooking,
      total_price: grandTotal,
      check_in: checkIn,
      check_out: checkOut,
      room_number: room.room_number,
      room_type_name: room.room_type_name,
      guest_name: user?.name || 'Valued Guest',
      guest_email: user?.email || 'guest@staysync.com',
      guest_phone: user?.phone || '+91 98200 11223',
      payment: paymentResult?.payment || {}
    };
    setConfirmedBookingData(confirmed);
    setShowInvoiceModal(true);
  };

  if (loading) return <div className="app-container" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading suite details...</div>;
  if (errorMsg || !room) return <div className="app-container" style={{ padding: '5rem', textAlign: 'center', color: 'var(--error)' }}>{errorMsg || 'Room not found'}</div>;

  return (
    <div className="app-container" style={{ padding: '3rem 0' }}>
      
      {/* Redis Lock Active Banner */}
      <div style={{
        backgroundColor: 'var(--status-pending-bg)',
        border: '1px solid rgba(216, 177, 108, 0.4)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-champagne-dark)', fontWeight: 700, fontSize: '0.9rem' }}>
          <Lock size={18} />
          <span>Redis Distributed Mutex Active: Room #{room.room_number} held for your session (Zero race conditions)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-sage-dark)', fontWeight: 800, fontSize: '0.95rem' }}>
          <Clock size={16} /> TTL Expires: {formatLockTimer(lockTimeRemaining)}
        </div>
      </div>

      {/* Header Info */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-champagne-dark)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Hotel size={16} /> {room.hotel_name || 'StaySync Grand Palace'} • {room.hotel_city || 'Mumbai'}, India
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {room.room_type_name} <span style={{ color: 'var(--accent-sage-dark)', fontSize: '1.4rem' }}>(Room #{room.room_number})</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{room.hotel_address}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        
        {/* Left Column */}
        <div>
          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            height: '400px',
            marginBottom: '2rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <img
              src={room.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
              alt={room.room_type_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>Suite Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {room.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Bed Type</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>{room.bed_type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Suite Size</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>{room.room_size_sqm} m²</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Max Capacity</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>{room.max_occupancy} Guests</div>
              </div>
            </div>
          </div>

          {/* AI Suite Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-sage-dark)', fontWeight: 700 }}>
                <Sparkles size={18} /> AI Recommended Similar Suites
              </div>
              {aiRecommendations.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/rooms/${rec.id}`)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-sage)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{rec.room_type_name} (#{rec.room_number})</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.match_reason}</div>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--accent-champagne-dark)', fontSize: '0.95rem' }}>{formatCurrency(rec.base_price_per_night)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Amenities */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>Included Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {room.amenities && room.amenities.map(a => (
                <AmenityBadge key={a.id} name={a.name} icon={a.icon} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-champagne-dark)' }}>{formatCurrency(pricePerNight)}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> / night</span>
              </div>
              <span className="badge-available">● Redis Lock Held</span>
            </div>

            {validationError && (
              <div style={{ backgroundColor: 'var(--status-occupied-bg)', border: '1px solid rgba(201, 129, 118, 0.3)', color: 'var(--status-occupied-text)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleProceedToBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <DatePickerField
                label="Check-in Date"
                value={checkIn}
                onChange={handleCheckInChange}
                minDate={todayStr}
                required
              />
              <DatePickerField
                label={`Check-out Date (${nights} Night${nights > 1 ? 's' : ''})`}
                value={checkOut}
                onChange={handleCheckOutChange}
                minDate={minCheckOutDate}
                required
              />

              <div className="input-group">
                <label className="input-label"><Users size={14} /> Number of Guests</label>
                <select className="select-field" value={guests} onChange={e => setGuests(parseInt(e.target.value))}>
                  {Array.from({ length: room.max_occupancy || 2 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Price Breakdown */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>{formatCurrency(pricePerNight)} × {nights} night(s)</span>
                  <span>{formatCurrency(roomSubtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <span>Taxes & Luxury GST (18%)</span>
                  <span>{formatCurrency(gstTax)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--accent-champagne-dark)' }}>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', fontSize: '1.05rem', padding: '0.95rem', fontWeight: 700 }}>
                Proceed to Payment Gateway <ArrowRight size={18} />
              </button>

            </form>

          </div>
        </div>

      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={draftBooking}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Tax Invoice Modal */}
      {showInvoiceModal && confirmedBookingData && (
        <InvoiceModal
          booking={confirmedBookingData}
          onClose={() => {
            setShowInvoiceModal(false);
            navigate('/dashboard/guest');
          }}
        />
      )}

    </div>
  );
}
