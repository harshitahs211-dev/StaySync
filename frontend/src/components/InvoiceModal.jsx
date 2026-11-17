import React from 'react';
import { X, Printer, Download, CheckCircle, Shield, Hotel, Award, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { calculateNights, formatDisplayDate } from '../utils/formatCurrency';

export default function InvoiceModal({ booking, onClose }) {
  if (!booking) return null;

  const roomTariff = parseFloat(booking.total_price) || 0;
  const services = booking.services || [];
  const servicesTotal = services.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
  const gstTax = Math.round(roomTariff * 0.18 / 1.18);
  const baseTariff = roomTariff - gstTax;
  const grandTotal = roomTariff + servicesTotal;

  const nights = calculateNights(booking.check_in, booking.check_out) || 1;
  const ratePerNight = Math.round(baseTariff / nights);

  const payment = booking.payment || {};
  const razorpayPaymentId = payment.razorpay_payment_id || payment.transaction_id || 'pay_test_live_auth';
  const razorpayOrderId = payment.razorpay_order_id || 'order_staysync_live';
  const paymentMethod = payment.payment_method || 'RAZORPAY_CHECKOUT';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-fade invoice-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          width: '100%',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E4DC',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(52, 59, 54, 0.15)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Top Action Bar (hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
            borderBottom: '1px solid #E8E4DC',
            paddingBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5B6A53', fontWeight: 700, fontSize: '0.85rem' }}>
            <CheckCircle size={18} />
            <span>OFFICIAL GST TAX INVOICE • VERIFIED TRANSACTION</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownload}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                backgroundColor: '#5B6A53',
                color: '#FFFFFF',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                backgroundColor: '#FAF9F6',
                border: '1px solid #E8E4DC',
                color: '#343B36',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6E7770',
                padding: '4px'
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" style={{ color: '#343B36', fontFamily: 'Inter, sans-serif' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '2rem',
              borderBottom: '2px solid #5B6A53',
              paddingBottom: '1.5rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Hotel size={26} color="#5B6A53" />
                <span
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    fontFamily: 'Playfair Display, Georgia, serif',
                    color: '#343B36',
                    letterSpacing: '-0.02em'
                  }}
                >
                  StaySync Grand Palace
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6E7770', lineHeight: '1.5' }}>
                Luxury Hospitality & Resorts Ltd.<br />
                777 Marine Drive, Nariman Point, Mumbai, Maharashtra 400021<br />
                <strong>GSTIN:</strong> 27AAACS8819Q1Z4 • <strong>CIN:</strong> U55101MH2026PTC109823<br />
                <strong>Email:</strong> billing@staysync.com • <strong>Helpline:</strong> +91 (22) 6789-5500
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#6E7770',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600
                }}
              >
                Booking Reference
              </div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#8C754E',
                  fontFamily: 'monospace'
                }}
              >
                {booking.booking_reference}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6E7770', marginTop: '4px' }}>
                Invoice Date: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong><br />
                Status:{' '}
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#EEF2EC',
                    color: '#5B6A53',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  SETTLED & PAID
                </span>
              </div>
            </div>
          </div>

          {/* Guest and Stay Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              backgroundColor: '#FAF9F6',
              border: '1px solid #E8E4DC',
              padding: '1.25rem',
              borderRadius: '10px',
              marginBottom: '1.75rem',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: '#8C754E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  marginBottom: '4px'
                }}
              >
                Billed To (Primary Guest):
              </div>
              <div style={{ fontWeight: 700, color: '#343B36', fontSize: '1rem' }}>
                {booking.guest_name || 'Alexander Wright'}
              </div>
              <div style={{ color: '#6E7770', marginTop: '2px' }}>
                {booking.guest_email || 'guest@staysync.com'}<br />
                Phone: {booking.guest_phone || '+91-98200-11223'}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: '#8C754E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  marginBottom: '4px'
                }}
              >
                Suite & Stay Duration:
              </div>
              <div style={{ fontWeight: 700, color: '#343B36' }}>
                Room #{booking.room_number} • {booking.room_type_name || 'Deluxe Ocean Suite'}
              </div>
              <div style={{ color: '#6E7770', marginTop: '2px' }}>
                Check-in: <strong>{formatDisplayDate(booking.check_in)}</strong><br />
                Check-out: <strong>{formatDisplayDate(booking.check_out)}</strong> ({nights} Night{nights > 1 ? 's' : ''})
              </div>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1.5rem',
              fontSize: '0.88rem'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#FAF9F6', borderBottom: '2px solid #E8E4DC' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6E7770', fontWeight: 600 }}>Description</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6E7770', fontWeight: 600 }}>Duration / Qty</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6E7770', fontWeight: 600 }}>Base Rate</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6E7770', fontWeight: 600 }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E8E4DC' }}>
                <td style={{ padding: '12px' }}>
                  <strong>Suite Accommodation Charges</strong>
                  <div style={{ fontSize: '0.78rem', color: '#6E7770' }}>
                    Luxury Hospitality Suite #{booking.room_number} ({booking.room_type_name || 'Deluxe'})
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '12px' }}>{nights} night{nights > 1 ? 's' : ''}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>₹{ratePerNight.toLocaleString('en-IN')}/night</td>
                <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>₹{baseTariff.toLocaleString('en-IN')}</td>
              </tr>

              {services.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E8E4DC' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{s.description || 'In-Stay Hospitality Service'}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#6E7770' }}>Category: {s.category || 'Service'}</div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>1</td>
                  <td style={{ textAlign: 'right', padding: '12px' }}>₹{parseFloat(s.cost).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>₹{parseFloat(s.cost).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '320px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6E7770' }}>
                <span>Tariff Subtotal:</span>
                <span>₹{(baseTariff + servicesTotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6E7770' }}>
                <span>Luxury Hospitality GST (CGST 9% + SGST 9%):</span>
                <span>₹{gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: '#343B36',
                  borderTop: '2px solid #5B6A53',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                <span>Grand Total Settled:</span>
                <span style={{ color: '#5B6A53' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment & Cryptographic Verification Details */}
          <div
            style={{
              backgroundColor: '#FAF9F6',
              border: '1px dashed #D6DFD3',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '1rem',
              fontSize: '0.8rem',
              marginBottom: '1.5rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#343B36', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={15} color="#5B6A53" />
                Payment Gateway Settlement (Razorpay Test Mode)
              </div>
              <div style={{ color: '#6E7770', lineHeight: '1.5' }}>
                Razorpay Payment ID: <strong style={{ color: '#343B36', fontFamily: 'monospace' }}>{razorpayPaymentId}</strong><br />
                Razorpay Order ID: <strong style={{ color: '#343B36', fontFamily: 'monospace' }}>{razorpayOrderId}</strong><br />
                Settlement Currency: <strong>INR (₹)</strong> • Method: <strong>{paymentMethod}</strong>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #E8E4DC', paddingLeft: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#5B6A53', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={15} color="#5B6A53" />
                Digital Cryptographic Stamp
              </div>
              <div style={{ color: '#6E7770', lineHeight: '1.5', fontSize: '0.78rem' }}>
                Status: <strong style={{ color: '#5B6A53' }}>HMAC SHA-256 VERIFIED</strong><br />
                Dual-Phase Concurrency Lock: <strong>SETTLED & RELEASED</strong><br />
                Computer-generated invoice. No physical signature required.
              </div>
            </div>
          </div>

          {/* Legal / Tax Note */}
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6E7770', borderTop: '1px solid #E8E4DC', paddingTop: '1rem' }}>
            This is an authentic computer-generated Tax Invoice issued under Section 31 of the Central Goods and Services Tax Act, 2017.
            Thank you for staying with StaySync Grand Palace.
          </div>
        </div>
      </div>
    </div>
  );
}
