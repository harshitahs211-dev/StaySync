import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import SmartRoomControls from '../../components/SmartRoomControls';
import DigitalKeyModal from '../../components/DigitalKeyModal';
import OnlineCheckinModal from '../../components/OnlineCheckinModal';
import InvoiceModal from '../../components/InvoiceModal';
import SmartConcierge from '../../components/SmartConcierge';
import { formatCurrency, formatDisplayDate } from '../../utils/formatCurrency';
import { 
  Key, ShieldCheck, Award, Utensils, Sparkles, Star, Clock, CheckCircle2, 
  LogOut, Plus, RefreshCw, ChevronRight, BedDouble, FileText, Bell, Check, 
  Waves, AlertCircle, ShoppingBag, X, Calendar 
} from 'lucide-react';

export default function GuestDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  // In-stay service ordering modal
  const [activeTab, setActiveTab] = useState('CURRENT_STAY'); // CURRENT_STAY, SERVICES, UPCOMING, PAST, LOYALTY
  const [cart, setCart] = useState([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('DINING');
  const [serviceDescription, setServiceDescription] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [cleanlinessScore, setCleanlinessScore] = useState(5);
  const [foodScore, setFoodScore] = useState(5);
  const [staffScore, setStaffScore] = useState(5);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      const [bkRes, srvRes, loyRes, menuRes] = await Promise.all([
        api.getBookings(),
        api.getServices(),
        api.getLoyalty(),
        api.getRestaurantMenu()
      ]);

      const bks = bkRes.data?.bookings || [];
      setBookings(bks);

      // Find current in-stay active booking (e.g. room 304 or first confirmed)
      const current = bks.find(b => b.status === 'CONFIRMED' || b.status === 'HELD') || bks[0];
      if (current) {
        // Fetch detailed booking with running folio
        try {
          const detailRes = await api.getBookingById(current.id);
          setActiveBooking(detailRes.data.booking);
        } catch (e) {
          setActiveBooking(current);
        }
      }

      if (srvRes.data?.requests) setServices(srvRes.data.requests);
      if (loyRes.data?.account) setLoyalty(loyRes.data);
      if (menuRes.data?.menu) setMenu(menuRes.data.menu);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuestData();
  }, []);

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: (i.qty || 1) + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setToastNotice(`Added ${item.name} to suite order`);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !activeBooking) return;
    try {
      await api.placeRestaurantOrder({
        roomNumber: activeBooking.room_number,
        bookingId: activeBooking.id,
        items: cart
      });
      setCart([]);
      setToastNotice('Order dispatched to Executive Chef & posted to room folio!');
      setTimeout(() => setToastNotice(null), 4000);
      loadGuestData();
    } catch (err) {
      alert(err.message || 'Order failed');
    }
  };

  const handleCreateServiceRequest = async (e) => {
    e.preventDefault();
    if (!serviceDescription.trim() || !activeBooking) return;
    try {
      await api.createService({
        bookingId: activeBooking.id,
        roomNumber: activeBooking.room_number,
        category: selectedServiceCategory,
        description: serviceDescription,
        cost: selectedServiceCategory === 'SPA' ? 4500 : selectedServiceCategory === 'LAUNDRY' ? 850 : 0
      });
      setServiceDescription('');
      setToastNotice(`${selectedServiceCategory} request dispatched to staff`);
      setTimeout(() => setToastNotice(null), 3500);
      loadGuestData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAutomatedCheckout = async () => {
    if (!activeBooking) return;
    if (window.confirm(`Execute automated checkout for Suite #${activeBooking.room_number}? This will settle all in-stay charges and generate your tax invoice.`)) {
      try {
        const res = await api.checkoutBooking(activeBooking.id);
        setCheckoutResult(res.data);
        setToastNotice('Checkout completed! Final bill settled and key revoked.');
        setTimeout(() => setToastNotice(null), 4500);
        loadGuestData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.submitReview({
        hotelId: reviewBooking?.hotel_id || 'htl_mumbai_1',
        bookingId: reviewBooking?.id,
        rating: reviewRating,
        comment: reviewComment,
        cleanlinessRating: cleanlinessScore,
        foodRating: foodScore,
        staffRating: staffScore
      });
      setShowReviewModal(false);
      setReviewComment('');
      setToastNotice('Thank you! Your feedback and aspect ratings were saved.');
      setTimeout(() => setToastNotice(null), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && !activeBooking) {
    return (
      <div className="app-container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading your luxury guest suite portal...
      </div>
    );
  }

  const runningFolioTotal = activeBooking?.running_folio?.grand_total || (activeBooking?.total_price || 0);

  return (
    <div className="app-container" style={{ padding: '3rem 0 5rem 0' }}>
      
      {/* Toast Notice */}
      {toastNotice && (
        <div className="badge-available" style={{ width: '100%', padding: '12px 18px', marginBottom: '1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
          ✓ {toastNotice}
        </div>
      )}

      {/* Guest Welcome Banner */}
      <div className="luxury-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Guest Experience & Digital Concierge Portal
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '4px 0 6px 0', fontFamily: 'var(--font-serif)' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {activeBooking ? `Currently staying at ${activeBooking.hotel_name || 'StaySync Grand Resort, Mumbai'}` : 'Manage your luxury hotel stays, digital passes, and rewards.'}
          </p>
        </div>

        {/* Loyalty Tier Summary */}
        <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rewards Balance</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-champagne-dark)' }}>
              {loyalty?.account?.points_balance?.toLocaleString('en-IN') || '3,450'} Pts
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status Tier</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-sage-dark)' }}>
              {loyalty?.account?.tier || 'GOLD'} Member
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { key: 'CURRENT_STAY', label: 'Active In-Stay Suite' },
          { key: 'SERVICES', label: 'In-Stay Services & Dining' },
          { key: 'UPCOMING', label: 'Upcoming Stays' },
          { key: 'PAST', label: 'Stay History & Reviews' },
          { key: 'LOYALTY', label: 'Loyalty Rewards' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: activeTab === tab.key ? '1px solid var(--accent-sage-dark)' : '1px solid var(--border-light)',
              background: activeTab === tab.key ? 'var(--accent-sage-dark)' : '#FFFFFF',
              color: activeTab === tab.key ? '#FFFFFF' : 'var(--text-primary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CURRENT ACTIVE STAY */}
      {activeTab === 'CURRENT_STAY' && (
        <div>
          {activeBooking ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              
              {/* Left Column: Suite Overview & Digital Key Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="luxury-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <span className="badge-available" style={{ marginBottom: '6px' }}>● In-Stay Guest Active</span>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-serif)', margin: '4px 0 2px 0' }}>
                        Suite #{activeBooking.room_number} – {activeBooking.room_type_name}
                      </h2>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Booking Reference: <strong>{activeBooking.booking_reference}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Running Folio Balance</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-sage-dark)' }}>
                        {formatCurrency(runningFolioTotal)}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Capacity */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Check-In:</div>
                      <strong>{formatDisplayDate(activeBooking.check_in)} (From 14:00)</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Check-Out:</div>
                      <strong>{formatDisplayDate(activeBooking.check_out)} (Until 11:00)</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Occupancy:</div>
                      <strong>{activeBooking.total_guests || 2} Guests</strong>
                    </div>
                  </div>

                  {/* Key Actions Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
                    <button onClick={() => setShowKeyModal(true)} className="btn-primary" style={{ padding: '10px', fontSize: '0.85rem' }}>
                      <Key size={16} /> Digital Room Pass
                    </button>

                    <button onClick={() => setShowCheckinModal(true)} className="btn-secondary" style={{ padding: '10px', fontSize: '0.85rem' }}>
                      <ShieldCheck size={16} /> KYC Verification
                    </button>

                    <button
                      onClick={() => {
                        setSelectedInvoiceBooking(activeBooking);
                        setShowInvoiceModal(true);
                      }}
                      className="btn-secondary"
                      style={{ padding: '10px', fontSize: '0.85rem' }}
                    >
                      <FileText size={16} /> View Tax Invoice
                    </button>

                    <button
                      onClick={handleAutomatedCheckout}
                      className="btn-secondary"
                      style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--error)' }}
                    >
                      <LogOut size={16} /> Express Checkout
                    </button>
                  </div>

                  {checkoutResult && (
                    <div style={{ background: 'var(--bg-sand)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <strong>Automated Checkout Success!</strong> Total Settled: {formatCurrency(checkoutResult.final_bill?.grand_total)}. Digital key revoked & Housekeeping dispatched.
                    </div>
                  )}
                </div>

                {/* Embedded IoT Controls */}
                <SmartRoomControls roomNumber={activeBooking.room_number} />
              </div>

              {/* Right Column: Running Folio Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="luxury-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                    Itemized Running Folio
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                      <span>Suite Accommodation Base</span>
                      <strong>{formatCurrency(activeBooking.total_price)}</strong>
                    </div>

                    {services.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '8px 0' }}>
                        No in-stay services charged yet.
                      </div>
                    ) : (
                      services.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                          <div>
                            <div>{s.description}</div>
                            <span className="badge-sand" style={{ fontSize: '0.68rem' }}>{s.category} • {s.status}</span>
                          </div>
                          <strong>{formatCurrency(s.cost)}</strong>
                        </div>
                      ))
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-sage-dark)', paddingTop: '10px' }}>
                      <span>Consolidated Folio Total:</span>
                      <span>{formatCurrency(runningFolioTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('SERVICES')}
                    className="btn-secondary"
                    style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }}
                  >
                    <Plus size={15} /> Order In-Room Dining or Spa
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <BedDouble size={36} color="var(--accent-champagne-dark)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>No Active In-Stay Reservation</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                You do not have a checked-in reservation today. Browse our luxury suites across Mumbai, Udaipur, and Goa.
              </p>
              <Link to="/search" className="btn-primary">
                Book a Suite Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IN-STAY SERVICES & DINING MENU */}
      {activeTab === 'SERVICES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Menu Catalog */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>
              24/7 In-Room Dining & Wellness Menu
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {menu.map((item) => (
                <div key={item.id} className="luxury-card" style={{ overflow: 'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-sage-dark)' }}>{formatCurrency(item.price)}</span>
                      <span className="badge-sand" style={{ fontSize: '0.72rem' }}>{item.prep_time}</span>
                    </div>
                    <button onClick={() => handleAddToCart(item)} className="btn-secondary" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}>
                      + Add to Room Order
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Other Hotel Services */}
            <div className="luxury-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                Request Hotel Housekeeping, Spa or Maintenance
              </h3>
              <form onSubmit={handleCreateServiceRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label">Service Division</label>
                    <select
                      value={selectedServiceCategory}
                      onChange={e => setSelectedServiceCategory(e.target.value)}
                      className="select-field"
                    >
                      <option value="DINING">In-Room Dining</option>
                      <option value="HOUSEKEEPING">Housekeeping (Towels, Turndown)</option>
                      <option value="SPA">Ayurvedic Wellness Spa Booking (₹4,500)</option>
                      <option value="LAUNDRY">Express Valet Laundry (₹850)</option>
                      <option value="MAINTENANCE">Maintenance / AC Repair</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Suite Destination</label>
                    <input type="text" value={`Suite #${activeBooking?.room_number || '304'}`} disabled className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="input-label">Detailed Request Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Please provide 2 extra bath towels and aroma diffuser refill..."
                    value={serviceDescription}
                    onChange={e => setServiceDescription(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Submit Request to Staff
                </button>
              </form>
            </div>
          </div>

          {/* Cart & Running Orders */}
          <div>
            <div className="luxury-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Room Service Cart</h3>
                <span className="badge-sand">{cart.reduce((s, i) => s + (i.qty || 1), 0)} Items</span>
              </div>

              {cart.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1.5rem 0', textAlign: 'center' }}>
                  Cart is empty. Add culinary delights from the menu.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{item.qty}x {item.name}</span>
                      <strong>{formatCurrency(item.price * item.qty)}</strong>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Total Amount:</span>
                    <span style={{ color: 'var(--accent-sage-dark)' }}>
                      {formatCurrency(cart.reduce((s, i) => s + (i.price * i.qty), 0))}
                    </span>
                  </div>
                  <button onClick={handlePlaceOrder} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Dispatch to Suite #{activeBooking?.room_number || '304'}
                  </button>
                </div>
              )}
            </div>

            {/* Active Service Requests Queue */}
            <div className="luxury-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Active In-Stay Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {services.map((s) => (
                  <div key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600 }}>{s.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>{s.category}</span>
                      <span className={s.status === 'COMPLETED' ? 'badge-available' : 'badge-pending'} style={{ fontSize: '0.68rem' }}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: UPCOMING STAYS */}
      {activeTab === 'UPCOMING' && (
        <div className="luxury-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
            Upcoming Confirmed Reservations
          </h2>
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Suite & Hotel</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Tariff</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.status === 'CONFIRMED' && b.id !== activeBooking?.id).map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-sage-dark)' }}>{b.booking_reference}</td>
                  <td>
                    <strong>Suite #{b.room_number}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.room_type_name}</div>
                  </td>
                  <td>{formatDisplayDate(b.check_in)}</td>
                  <td>{formatDisplayDate(b.check_out)}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(b.total_price)}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedInvoiceBooking(b);
                        setShowInvoiceModal(true);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <FileText size={14} /> Tax Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PAST STAYS & REVIEWS */}
      {activeTab === 'PAST' && (
        <div className="luxury-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
            Completed Past Stays & Guest Reviews
          </h2>
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Suite Description</th>
                <th>Stay Dates</th>
                <th>Total Settled</th>
                <th>Status</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.status === 'COMPLETED').map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700 }}>{b.booking_reference}</td>
                  <td>Suite #{b.room_number} – {b.room_type_name}</td>
                  <td>{formatDisplayDate(b.check_in)} to {formatDisplayDate(b.check_out)}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(b.total_price)}</td>
                  <td><span className="badge-available">COMPLETED</span></td>
                  <td>
                    <button
                      onClick={() => {
                        setReviewBooking(b);
                        setShowReviewModal(true);
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <Star size={13} /> Leave Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: LOYALTY REWARDS */}
      {activeTab === 'LOYALTY' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="luxury-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <Award size={48} color="var(--accent-champagne-dark)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-serif)', margin: '0 0 6px 0' }}>
              StaySync Prestige
            </h3>
            <span className="badge-available" style={{ fontSize: '0.85rem' }}>GOLD MEMBER</span>

            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-sage-dark)', margin: '1.5rem 0 0.5rem 0' }}>
              {loyalty?.account?.points_balance?.toLocaleString('en-IN') || '3,450'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Reward points available • 10 pts per ₹100 spent
            </div>
          </div>

          <div className="luxury-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
              Reward Point Transactions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(loyalty?.history || []).map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', fontSize: '0.88rem' }}>
                  <div>
                    <div>{t.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDisplayDate(t.created_at)}</div>
                  </div>
                  <strong style={{ color: t.type === 'EARNED' ? 'var(--status-available-text)' : 'var(--error)' }}>
                    {t.type === 'EARNED' ? '+' : '-'}{t.points} Pts
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showKeyModal && activeBooking && (
        <DigitalKeyModal booking={activeBooking} onClose={() => setShowKeyModal(false)} />
      )}

      {showCheckinModal && activeBooking && (
        <OnlineCheckinModal booking={activeBooking} onClose={() => setShowCheckinModal(false)} onSuccess={() => loadGuestData()} />
      )}

      {showInvoiceModal && selectedInvoiceBooking && (
        <InvoiceModal booking={selectedInvoiceBooking} onClose={() => setShowInvoiceModal(false)} />
      )}

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Review Your Stay</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="input-label">Overall Star Rating</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {[1,2,3,4,5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={28} fill={star <= reviewRating ? '#D8B16C' : '#E8E4DC'} color="#D8B16C" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Aspect Ratings</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div>
                    <span>Cleanliness</span>
                    <select value={cleanlinessScore} onChange={e => setCleanlinessScore(Number(e.target.value))} className="select-field" style={{ padding: '4px' }}>
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Fair</option>
                    </select>
                  </div>
                  <div>
                    <span>Food & Dining</span>
                    <select value={foodScore} onChange={e => setFoodScore(Number(e.target.value))} className="select-field" style={{ padding: '4px' }}>
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Fair</option>
                    </select>
                  </div>
                  <div>
                    <span>Staff Service</span>
                    <select value={staffScore} onChange={e => setStaffScore(Number(e.target.value))} className="select-field" style={{ padding: '4px' }}>
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Fair</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Your Review & Feedback</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience with cleanliness, staff, and food..."
                  className="input-field"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Submit Review (Analyzed via NLP)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Smart Concierge Bot Widget */}
      <SmartConcierge />

    </div>
  );
}
