import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDisplayDate, calculateNights } from '../utils/formatCurrency';
import PaymentModal from '../components/PaymentModal';
import InvoiceModal from '../components/InvoiceModal';
import { CheckCircle2, Calendar, Users, Hotel, ShieldCheck, ArrowRight, Lock, Key, FileText, CreditCard } from 'lucide-react';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests')) || 1;
  const specialRequests = searchParams.get('specialRequests') || '';

  const [room, setRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (roomId) {
      api.getRoomById(roomId).then(res => setRoom(res.data.room)).catch(() => {});
    }
  }, [roomId]);

  const nights = calculateNights(checkIn, checkOut);
  const pricePerNight = room ? parseFloat(room.base_price_per_night) : 0;
  const roomSubtotal = nights * pricePerNight;
  const gstTax = Math.round(roomSubtotal * 0.18);
  const grandTotal = roomSubtotal + gstTax;

  const handleOpenPayment = () => {
    setErrorMsg(null);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentModal(false);
    setBookingConfirmed(paymentResult);
  };

  if (bookingConfirmed) {
    const { booking } = bookingConfirmed;
    return (
      <div className="app-container" style={{ padding: '4rem 0', maxWidth: '720px' }}>
        <div className="glass-panel animate-fade" style={{ padding: '3rem 2.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }}>
          
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-available-bg)',
            color: 'var(--status-available-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h1 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Reservation Confirmed!
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Thank you for choosing StaySync Grand Palace. Your stay is booked and verified.
          </p>

          {/* Receipt Breakdown Card */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.75rem', textAlign: 'left', marginBottom: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Booking Reference</span>
                <div style={{ fontWeight: 800, color: 'var(--accent-champagne-dark)', fontSize: '1.3rem' }}>{booking.booking_reference}</div>
              </div>
              <span className="badge-available">● Confirmed</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Suite Accommodations</span>
                <strong style={{ color: 'var(--text-primary)' }}>{booking.room_type_name} (#{booking.room_number})</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Stay Dates</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(booking.check_in)} to {formatDisplayDate(booking.check_out)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Guests</span>
                <strong style={{ color: 'var(--text-primary)' }}>{booking.total_guests} Guest(s)</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Total Paid (incl. 18% GST)</span>
                <strong style={{ color: 'var(--accent-sage-dark)', fontSize: '1.15rem' }}>{formatCurrency(booking.total_price)}</strong>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--accent-sage-light)',
              border: '1px solid rgba(168, 181, 160, 0.4)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--accent-sage-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}>
              <Key size={18} />
              <span>Digital NFC Key & Online KYC Check-in are available in your Guest Dashboard</span>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={16} /> View Official Tax Invoice
            </button>
            <Link to="/dashboard/guest" className="btn-primary">
              Go to Guest Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/search" className="btn-secondary">
              Book Another Suite
            </Link>
          </div>

        </div>

        {showInvoiceModal && (
          <InvoiceModal
            booking={{
              ...booking,
              guest_name: user?.name,
              guest_email: user?.email,
              guest_phone: user?.phone,
              payment: bookingConfirmed.payment
            }}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '3rem 0', maxWidth: '800px' }}>
      
      <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        Review & Confirm Reservation
      </h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem' }}>
        Please verify your luxury stay itinerary before final confirmation.
      </p>

      {errorMsg && (
        <div style={{
          backgroundColor: 'var(--status-occupied-bg)',
          border: '1px solid rgba(201, 129, 118, 0.3)',
          color: 'var(--status-occupied-text)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          {errorMsg}
        </div>
      )}

      {room && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          
          {/* Room Header */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <img src={room.image_url} alt={room.room_type_name} style={{ width: '130px', height: '95px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-light)' }} />
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>{room.room_type_name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent-sage-dark)', fontWeight: 600 }}>Room #{room.room_number} • Floor {room.floor}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{room.hotel_name || 'StaySync Grand Palace'} • {room.hotel_city || 'Mumbai'}, India</p>
            </div>
          </div>

          {/* Stay Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>📅 Check-in</span>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{formatDisplayDate(checkIn)}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>📅 Check-out</span>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{formatDisplayDate(checkOut)}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>👤 Primary Guest</span>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{user ? user.name : 'Guest User'}</div>
            </div>
          </div>

          {specialRequests && (
            <div style={{ marginBottom: '1.75rem', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}>
              <strong>Special Requests:</strong> {specialRequests}
            </div>
          )}

          {/* Itemized Price Breakdown */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-champagne-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RESERVATION PRICE BREAKDOWN
            </h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span>{formatCurrency(pricePerNight)} × {nights} night(s)</span>
              <span>{formatCurrency(roomSubtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              <span>Luxury Hospitality GST (18%)</span>
              <span>{formatCurrency(gstTax)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Payable Amount</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-champagne-dark)' }}>
                  {formatCurrency(grandTotal)}
                </div>
              </div>
              <span className="badge-available">● Instant Confirmation</span>
            </div>
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CreditCard size={20} />
            Proceed to Razorpay Secure Payment ({formatCurrency(grandTotal)})
          </button>

        </div>
      )}

      {/* Razorpay Payment Modal */}
      {room && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={{
            room_id: room.id,
            room_number: room.room_number,
            room_type_name: room.room_type_name,
            total_price: grandTotal,
            checkIn,
            checkOut,
            guests,
            specialRequests
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
}
