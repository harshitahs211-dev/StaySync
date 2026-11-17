import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Smartphone,
  Building,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Clock
} from 'lucide-react';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ isOpen, onClose, booking, onPaymentSuccess }) {
  if (!isOpen || !booking) return null;

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [step, setStep] = useState('IDLE'); // 'IDLE', 'ORDER_CREATED', 'VERIFYING', 'SUCCESS', 'FAILED'
  const [testModeOnly, setTestModeOnly] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    setErrorMsg(null);
    setLoading(false);
    setStep('IDLE');
    setActiveOrder(null);
  }, [isOpen]);

  const initiatePayment = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Create order on backend (acquires HELD room lock & registers with Razorpay)
      const orderPayload = {
        roomId: booking.room_id || booking.roomId,
        checkIn: booking.checkIn || booking.check_in,
        checkOut: booking.checkOut || booking.check_out,
        totalGuests: booking.guests || booking.total_guests || 1,
        specialRequests: booking.specialRequests || booking.special_requests || '',
        idempotencyKey: `idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      };

      const res = await api.createRazorpayOrder(orderPayload);
      const orderData = res.data;
      setActiveOrder(orderData);
      setStep('ORDER_CREATED');

      // 2. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();

      // If Razorpay SDK is available and key is not offline
      if (scriptLoaded && window.Razorpay && orderData.keyId && !orderData.keyId.includes('placeholder')) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount, // in paise
          currency: orderData.currency || 'INR',
          name: 'StaySync Luxury Hospitality',
          description: `Room #${orderData.roomNumber} - ${orderData.roomTypeName || 'Suite'} (${orderData.nights} Night${orderData.nights > 1 ? 's' : ''})`,
          order_id: orderData.orderId,
          handler: async function (response) {
            await verifyPayment({
              bookingReference: orderData.bookingReference,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: async function () {
              setLoading(false);
              setStep('IDLE');
              try {
                await api.cancelPaymentOrder({
                  bookingReference: orderData.bookingReference,
                  reason: 'Customer closed payment popup'
                });
              } catch (err) {
                console.warn('Hold release notice:', err.message);
              }
              setErrorMsg('Payment was abandoned. The temporary room hold has been released.');
            }
          },
          prefill: {
            name: user?.name || 'Valued Guest',
            email: user?.email || 'guest@staysync.com',
            contact: user?.phone || '9820011223'
          },
          notes: {
            bookingReference: orderData.bookingReference,
            bookingId: orderData.bookingId
          },
          theme: {
            color: '#5B6A53' // Light Luxury Sage Green
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
          setLoading(false);
          setStep('FAILED');
          setErrorMsg(response.error.description || 'Razorpay payment transaction failed.');
          try {
            await api.cancelPaymentOrder({
              bookingReference: orderData.bookingReference,
              reason: response.error.description || 'Payment failed'
            });
          } catch (e) {}
        });
        rzp.open();
        setLoading(false);
      } else {
        // Fallback to seamless test-mode checkout when in offline dev or placeholder test key
        setTestModeOnly(true);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setStep('FAILED');
      setErrorMsg(err.message || 'Failed to initiate Razorpay order. Room may be locked by another guest.');
    }
  };

  const verifyPayment = async (verificationData) => {
    setLoading(true);
    setStep('VERIFYING');
    setErrorMsg(null);

    try {
      const res = await api.verifyRazorpayPayment(verificationData);
      setStep('SUCCESS');
      setLoading(false);
      if (onPaymentSuccess) {
        onPaymentSuccess(res.data);
      }
    } catch (err) {
      setLoading(false);
      setStep('FAILED');
      setErrorMsg(err.message || 'Cryptographic HMAC SHA-256 signature verification failed.');
    }
  };

  const handleSimulateTestPayment = async () => {
    if (!activeOrder) return;
    await verifyPayment({
      bookingReference: activeOrder.bookingReference,
      razorpay_order_id: activeOrder.orderId,
      razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
      razorpay_signature: 'simulated_test_signature'
    });
  };

  const handleCancelHold = async () => {
    if (activeOrder && activeOrder.bookingReference) {
      try {
        await api.cancelPaymentOrder({
          bookingReference: activeOrder.bookingReference,
          reason: 'Customer explicitly cancelled checkout'
        });
      } catch (err) {
        console.warn('Hold release notice:', err.message);
      }
    }
    onClose();
  };

  const roomTariff = parseFloat(booking.total_price) || 0;
  const gstTax = Math.round(roomTariff * 0.18 / 1.18);
  const baseTariff = roomTariff - gstTax;

  return (
    <div className="modal-overlay" onClick={handleCancelHold}>
      <div
        className="glass-panel animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E4DC',
          borderRadius: '16px',
          boxShadow: '0 20px 45px rgba(52, 59, 54, 0.12)',
          position: 'relative'
        }}
      >
        <button
          onClick={handleCancelHold}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#6E7770',
            cursor: 'pointer',
            padding: '4px'
          }}
          title="Close and Release Room Hold"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#EEF2EC',
              color: '#5B6A53',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto',
              border: '1px solid #D6DFD3'
            }}
          >
            <CreditCard size={26} />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: 'Playfair Display, Georgia, serif',
              color: '#343B36',
              marginBottom: '0.25rem'
            }}
          >
            Razorpay Secure Checkout
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#6E7770' }}>
            Official Test Mode Gateway • Real-time HMAC-SHA256 Verification
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: '#FBF0EE',
              border: '1px solid #F1C3BA',
              color: '#B34A3A',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Stay Summary Card */}
        <div
          style={{
            backgroundColor: '#FAF9F6',
            border: '1px solid #E8E4DC',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #E8E4DC'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6E7770', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Selected Suite
              </span>
              <div style={{ fontWeight: 700, color: '#343B36', fontSize: '1rem' }}>
                {booking.room_type_name || 'Luxury Suite'} (Room #{booking.room_number})
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#6E7770', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Guests
              </span>
              <div style={{ fontWeight: 700, color: '#343B36', fontSize: '1rem' }}>
                {booking.guests || booking.total_guests || 1} Guest(s)
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', color: '#6E7770', marginBottom: '0.75rem' }}>
            <div>
              <strong>Check-in:</strong> {booking.checkIn || booking.check_in}
            </div>
            <div>
              <strong>Check-out:</strong> {booking.checkOut || booking.check_out}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: '#6E7770', borderTop: '1px solid #E8E4DC', paddingTop: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Base Accommodation Tariff:</span>
              <span>₹{baseTariff.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Luxury Hospitality GST (18%):</span>
              <span>₹{gstTax.toLocaleString('en-IN')}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#343B36',
                borderTop: '1px dashed #E8E4DC',
                paddingTop: '6px',
                marginTop: '4px'
              }}
            >
              <span>Total Payable Amount:</span>
              <span style={{ color: '#8C754E' }}>₹{roomTariff.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Security & Concurrency Badges */}
        <div
          style={{
            backgroundColor: '#EEF2EC',
            border: '1px solid #D6DFD3',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: '#5B6A53',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Temporary Room Lock Active:</strong> Inventory is held in <code>HELD</code> status during this checkout session.
          </span>
        </div>

        {/* Action Buttons */}
        {step === 'VERIFYING' ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#5B6A53', fontWeight: 600 }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
            Verifying HMAC-SHA256 Payment Signature with StaySync Server...
          </div>
        ) : testModeOnly && activeOrder ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                backgroundColor: '#FFFDF9',
                border: '1px solid #F1E5D1',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#8C754E'
              }}
            >
              <strong>Razorpay Test Mode Order Ready:</strong> <code>{activeOrder.orderId}</code>
              <br />
              Complete the verification using the StaySync secure test verification bridge.
            </div>
            <button
              type="button"
              onClick={handleSimulateTestPayment}
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.95rem',
                fontSize: '1rem',
                fontWeight: 700,
                backgroundColor: '#5B6A53',
                color: '#FFFFFF',
                borderRadius: '8px'
              }}
            >
              {loading ? 'Processing Cryptographic Verification...' : `Verify Test Payment (₹${roomTariff.toLocaleString('en-IN')})`}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={initiatePayment}
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                backgroundColor: '#5B6A53',
                color: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Initiating Razorpay Order...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Proceed to Razorpay Payment ({formatCurrency(roomTariff)})
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelHold}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#6E7770',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px'
              }}
            >
              Cancel Reservation & Release Room Hold
            </button>
          </div>
        )}

        {/* Footer Payment Methods accepted */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #E8E4DC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.75rem',
            color: '#6E7770'
          }}
        >
          <span>Accepted:</span>
          <span style={{ fontWeight: 600, color: '#343B36' }}>UPI (GPay / PhonePe / Paytm)</span> •
          <span style={{ fontWeight: 600, color: '#343B36' }}>Credit / Debit Cards</span> •
          <span style={{ fontWeight: 600, color: '#343B36' }}>Net Banking</span>
        </div>
      </div>
    </div>
  );
}
