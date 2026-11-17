import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RoomCard from './RoomCard';
import AmenityBadge from './AmenityBadge';
import DatePickerField from './DatePickerField';
import SmartConcierge from './SmartConcierge';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Search, Calendar, Users, ShieldCheck, Star, ArrowRight, Award, Key, MapPin, Sparkles, Coffee, Waves, Wifi, Utensils, Hotel, Check, Compass, CreditCard, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(nextWeekStr);
  const [guests, setGuests] = useState(2);
  const [destination, setDestination] = useState('');
  const [roomType, setRoomType] = useState('');
  const [hotels, setHotels] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [hotelsRes, roomsRes] = await Promise.all([
          api.getHotels(),
          api.getRooms()
        ]);
        if (hotelsRes.data?.hotels) setHotels(hotelsRes.data.hotels);
        if (roomsRes.data?.rooms) setFeaturedRooms(roomsRes.data.rooms.slice(0, 4));
      } catch (err) {
        console.error('Landing page load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [dateError, setDateError] = useState(null);

  const minCheckOutDate = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : todayStr;

  const handleCheckInChange = (newDate) => {
    setCheckIn(newDate);
    setDateError(null);
    if (!checkOut || new Date(checkOut) <= new Date(newDate)) {
      const nextDay = new Date(new Date(newDate).getTime() + 86400000).toISOString().split('T')[0];
      setCheckOut(nextDay);
    }
  };

  const handleCheckOutChange = (newDate) => {
    setCheckOut(newDate);
    if (new Date(newDate) <= new Date(checkIn)) {
      setDateError('Check-out must be at least 1 day after check-in');
    } else {
      setDateError(null);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  const handleSearch = (e) => {
    e.preventDefault();
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be strictly after check-in date');
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests
    });
    if (destination) params.set('city', destination);
    if (roomType) params.set('roomTypeId', roomType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Hero Section with Light Luxury Aesthetic */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 6rem 0',
        background: 'linear-gradient(180deg, #FAF9F6 0%, #F4F0E8 100%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="app-container">
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-champagne-light)',
            border: '1px solid var(--accent-champagne)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.85rem',
            color: 'var(--accent-champagne-dark)',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Intelligent Hospitality Platform • Distributed System Architecture
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-serif)'
          }}>
            Your Stay, Seamlessly Connected.
          </h1>

          <p style={{
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}>
            From AI-powered room discovery and distributed concurrency locks to digital NFC keys and in-stay service fulfillment — experience India’s premier luxury hospitality technology.
          </p>

          {/* Search Engine Widget */}
          <form onSubmit={handleSearch} className="luxury-panel" style={{
            maxWidth: '1060px',
            margin: '0 auto',
            padding: '1.75rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
            textAlign: 'left'
          }}>
            
            <div>
              <label className="input-label"><MapPin size={14} color="var(--accent-sage-dark)" /> Destination</label>
              <select className="select-field" value={destination} onChange={e => setDestination(e.target.value)}>
                <option value="">All Destinations</option>
                <option value="Mumbai">Mumbai (Marine Drive)</option>
                <option value="Udaipur">Udaipur (Lake Pichola)</option>
                <option value="Goa">North Goa (Vagator Beach)</option>
              </select>
            </div>

            <div>
              <DatePickerField
                label="Check-In"
                value={checkIn}
                onChange={handleCheckInChange}
                minDate={todayStr}
              />
            </div>

            <div>
              <DatePickerField
                label={`Check-Out (${nights} Night${nights > 1 ? 's' : ''})`}
                value={checkOut}
                onChange={handleCheckOutChange}
                minDate={minCheckOutDate}
                error={dateError}
              />
            </div>

            <div>
              <label className="input-label"><Users size={14} color="var(--accent-sage-dark)" /> Guests</label>
              <select className="select-field" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests (Couples)</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests (Family)</option>
              </select>
            </div>

            <div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}>
                <Search size={18} /> Search Suites
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* Explore Flagship Properties */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-champagne-dark)', fontWeight: 700, marginBottom: '6px' }}>
              Iconic Locations
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
              Explore Flagship Hotel Sanctuaries
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {hotels.map((h) => (
              <div key={h.id} className="luxury-card" style={{ overflow: 'hidden' }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img src={h.image_url} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.92)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#D8B16C" color="#D8B16C" /> {h.rating}
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={14} /> {h.city}, {h.state}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{h.name}</h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {h.description}
                  </p>
                  <Link to={`/search?city=${h.city}`} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    Explore Suites in {h.city} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Luxury Suites */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-champagne-dark)', fontWeight: 700, marginBottom: '6px' }}>
                Handcrafted Accommodations
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: 0 }}>
                Featured Suites & Penthouses
              </h2>
            </div>
            <Link to="/search" className="btn-outline">
              View All Suites ({featuredRooms.length}+) <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-cards">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose StaySync (Distributed Architecture Showcase) */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Why Choose StaySync
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Built from scratch with modern distributed architecture to guarantee seamless, zero-conflict hotel management for guests and operators.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            
            <div className="luxury-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-sage-light)', color: 'var(--accent-sage-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Concurrency-Safe Locks</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Redis distributed locking with 5-minute TTL holds prevents double-booking races under simultaneous high-volume checkout attempts.
              </p>
            </div>

            <div className="luxury-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-champagne-light)', color: 'var(--accent-champagne-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>AI-Weighted Matching</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Smart recommendation scoring correlates guest budget, amenity priorities, and occupancy constraints into tailored room choices.
              </p>
            </div>

            <div className="luxury-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--status-available-bg)', color: 'var(--status-available-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Key size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Digital QR & NFC Keys</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Express online KYC verification unlocks digital passes with active validity windows, automated door lock simulation, and checkout revocation.
              </p>
            </div>

            <div className="luxury-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-sand)', color: 'var(--accent-champagne-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CreditCard size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Running In-Stay Folio</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Room dining, laundry, and spa charges aggregate live into an automated checkout invoice with luxury GST taxation and loyalty rewards.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Guest Reviews & Aspect Sentiment */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Guest Feedback & Aspect Sentiment
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Live NLP sentiment analysis tagged across cleanliness, food, staff, room, and Wi-Fi</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            <div className="luxury-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#D8B16C" color="#D8B16C" />)}
              </div>
              <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                "Exceptional beachfront elegance. The digital NFC room key and online check-in saved us 20 minutes at the front desk. Food was world class."
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <strong>Alexander Wright</strong>
                <span className="badge-available">Sentiment: Positive (98%)</span>
              </div>
            </div>

            <div className="luxury-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#D8B16C" color="#D8B16C" />)}
              </div>
              <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                "Unmatched hospitality and breathtaking views over Marine Drive. The smart room controls and concierge made our weekend getaway effortless."
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <strong>Dr. Siddharth Mehta</strong>
                <span className="badge-available">Sentiment: Positive (95%)</span>
              </div>
            </div>

            <div className="luxury-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#D8B16C" color="#D8B16C" />)}
              </div>
              <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                "Like living in a dream. The Lake Pichola arrival boat and royal butler service were simply unforgettable. Worth every rupee."
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <strong>Lady Catherine Spencer</strong>
                <span className="badge-available">Sentiment: Positive (99%)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Smart Concierge Bot */}
      <SmartConcierge />

    </div>
  );
}
