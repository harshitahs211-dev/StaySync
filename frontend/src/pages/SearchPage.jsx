import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import DatePickerField from '../components/DatePickerField';
import SmartConcierge from '../components/SmartConcierge';
import { api } from '../services/api';
import { Search, Filter, Sparkles, TrendingUp, MapPin, Users, SlidersHorizontal, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || nextWeekStr);
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
      setDateError('Check-out must be after check-in');
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

  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('roomTypeId') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 60000);
  const [selectedAmenities, setSelectedAmenities] = useState(
    searchParams.get('amenities') ? searchParams.get('amenities').split(',').filter(Boolean) : []
  );
  const [sortBy, setSortBy] = useState('price_asc');

  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dynamicPricing, setDynamicPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state if searchParams change externally
  useEffect(() => {
    if (searchParams.get('city') !== null) setCity(searchParams.get('city'));
    if (searchParams.get('roomTypeId') !== null) setSelectedType(searchParams.get('roomTypeId'));
    if (searchParams.get('maxPrice') !== null) setMaxPrice(Number(searchParams.get('maxPrice')));
    if (searchParams.get('amenities') !== null) {
      setSelectedAmenities(searchParams.get('amenities').split(',').filter(Boolean));
    }
    loadSearchResults();
  }, [searchParams]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      const params = {
        checkIn,
        checkOut,
        guests
      };
      if (city) params.city = city;
      if (selectedType) params.roomTypeId = selectedType;
      if (maxPrice) params.maxPrice = maxPrice;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');

      const [availRes, typesRes, recoRes, priceRes] = await Promise.all([
        api.getAvailableRooms(params),
        api.getRoomTypes(),
        api.getAIRecommendations({ budget: maxPrice, guests, preferredAmenities: selectedAmenities.join(',') || 'wifi,pool,spa' }),
        api.getDynamicPricing()
      ]);

      if (availRes.data?.available_rooms) setRooms(availRes.data.available_rooms);
      if (typesRes.data?.room_types) setRoomTypes(typesRes.data.room_types);
      if (recoRes.data?.recommendations) setRecommendations(recoRes.data.recommendations.slice(0, 2));
      if (priceRes.data) setDynamicPricing(priceRes.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
      maxPrice: maxPrice.toString()
    });
    if (city) params.set('city', city);
    if (selectedType) params.set('roomTypeId', selectedType);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setCity('');
    setSelectedType('');
    setMaxPrice(60000);
    setSelectedAmenities([]);
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString()
    });
    setSearchParams(params);
  };

  const toggleAmenity = (amenityName) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityName) ? prev.filter(a => a !== amenityName) : [...prev, amenityName]
    );
  };

  // Strict boundary filtering on actual nightly base rate (room.base_price_per_night <= maxPrice)
  const filteredRooms = rooms.filter(room => {
    const nightlyPrice = parseFloat(room.base_price_per_night || room.price || 0);
    if (nightlyPrice > maxPrice) return false;

    if (selectedAmenities.length > 0) {
      const roomAmenityNames = (room.amenities || []).map(a => (a.name || '').toLowerCase());
      const hasAll = selectedAmenities.every(a =>
        roomAmenityNames.some(rName => rName.includes(a.toLowerCase()))
      );
      if (!hasAll) return false;
    }
    return true;
  });

  // Sorting operates strictly on the filtered set
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const priceA = parseFloat(a.base_price_per_night || a.price || 0);
    const priceB = parseFloat(b.base_price_per_night || b.price || 0);
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'occupancy') return (b.max_occupancy || 0) - (a.max_occupancy || 0);
    return 0;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '2.5rem 0 5rem 0' }}>
      <div className="app-container">
        
        {/* Dynamic Pricing Banner */}
        {dynamicPricing && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="var(--accent-sage-dark)" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Live Dynamic Surge Rate Active:</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                  {dynamicPricing.surge_reason} ({dynamicPricing.occupancy_rate}% Current Occupancy)
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', background: 'var(--accent-sage-light)', color: 'var(--accent-sage-dark)', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>
              Tariff Multiplier: {dynamicPricing.surge_multiplier}x
            </div>
          </div>
        )}

        {/* AI Recommendations Highlight */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--accent-champagne-dark)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)' }}>
                AI-Recommended Suites for Your Search
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {recommendations.map((rec) => (
                <div key={rec.room_id} className="luxury-card" style={{ padding: '1.25rem', border: '1px solid var(--accent-champagne)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge-sand" style={{ marginBottom: '4px' }}>AI Match Score: {rec.match_score}%</span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '4px 0 0 0' }}>{rec.room_name}</h4>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-sage-dark)', fontSize: '1.1rem' }}>
                      {formatCurrency(rec.base_price)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {rec.recommendation_reason}
                  </p>
                  <a href={`/booking?roomId=${rec.room_id}&checkIn=${checkIn}&checkOut=${checkOut}`} className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}>
                    Book Recommended Suite
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Search Filter & Results Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          
          {/* Left Filter Sidebar */}
          <aside>
            <form onSubmit={handleApplyFilter} className="luxury-card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <Filter size={18} color="var(--accent-sage-dark)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Filter Suites</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Destination</label>
                  <select value={city} onChange={e => setCity(e.target.value)} className="select-field">
                    <option value="">All Destinations</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Udaipur">Udaipur</option>
                    <option value="Goa">North Goa</option>
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
                  <label className="input-label">Guests</label>
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="select-field">
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Suite Category</label>
                  <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="select-field">
                    <option value="">All Categories</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Max Rate / Night</label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-sage-dark)' }}>{formatCurrency(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="60000"
                    step="1000"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-sage-dark)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>₹5,000</span>
                    <span>₹60,000</span>
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ marginBottom: '8px' }}>Suite Amenities</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                    {[
                      { id: 'wifi', label: 'High-Speed Wi-Fi' },
                      { id: 'pool', label: 'Infinity Pool' },
                      { id: 'spa', label: 'Ayurvedic Spa' },
                      { id: 'view', label: 'Ocean / Lake View' },
                      { id: 'dining', label: 'Fine Dining' },
                      { id: 'balcony', label: 'Private Balcony' }
                    ].map(am => (
                      <label key={am.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(am.id)}
                          onChange={() => toggleAmenity(am.id)}
                          style={{ accentColor: 'var(--accent-sage-dark)', width: '15px', height: '15px' }}
                        />
                        <span>{am.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '8px' }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </form>
          </aside>

          {/* Right Results Grid */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-serif)', margin: 0 }}>
                  Available Suites & Rooms
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Showing {sortedRooms.length} luxury units matching your search dates ({checkIn} to {checkOut})
                </div>
              </div>

              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="select-field"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="occupancy">Max Capacity</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                Searching real-time inventory and verifying concurrency locks...
              </div>
            ) : sortedRooms.length === 0 ? (
              <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>No Available Rooms Found</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  All suites are currently booked or locked for the selected dates. Please adjust your dates or choose alternative destinations.
                </p>
                <button onClick={handleResetFilters} className="btn-secondary">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid-cards">
                {sortedRooms.map(room => (
                  <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      <SmartConcierge />
    </div>
  );
}
