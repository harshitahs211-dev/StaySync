import React from 'react';
import { Link } from 'react-router-dom';
import AmenityBadge from './AmenityBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { Users, Maximize, BedDouble, ArrowRight, MapPin, Sparkles } from 'lucide-react';

export default function RoomCard({ room, checkIn, checkOut }) {
  const price = room.base_price_per_night || room.price;
  const status = room.status || 'AVAILABLE';

  const getStatusBadge = () => {
    switch (status) {
      case 'AVAILABLE': return <span className="badge-available">● Available</span>;
      case 'OCCUPIED': return <span className="badge-occupied">● Reserved</span>;
      case 'DIRTY': return <span className="badge-dirty">● Turnover Clean</span>;
      case 'MAINTENANCE': return <span className="badge-pending">● Maintenance</span>;
      default: return <span className="badge-available">● Available</span>;
    }
  };

  const detailUrl = checkIn && checkOut
    ? `/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}`
    : `/rooms/${room.id}`;

  const bookingUrl = checkIn && checkOut
    ? `/booking?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`
    : `/rooms/${room.id}`;

  return (
    <div className="luxury-card animate-fade" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Suite Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={room.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
          alt={room.room_type_name || room.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {getStatusBadge()}
        </div>
        
        {/* Price Tag in Indian Rupees */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-light)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontSize: '1.15rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          {formatCurrency(price)} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ night</span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {room.room_type_name || room.name}
              </h3>
              {room.hotel_name && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 500 }}>
                  <MapPin size={13} /> {room.hotel_name} ({room.hotel_city})
                </div>
              )}
            </div>

            {room.room_number && (
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-sage-dark)', fontWeight: 700, background: 'var(--accent-sage-light)', padding: '3px 8px', borderRadius: '4px' }}>
                Suite #{room.room_number}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {room.description || 'Luxury boutique suite featuring floor-to-ceiling vistas, touch controls, and marble rain bath.'}
          </p>

          {/* Features */}
          <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} color="var(--accent-champagne-dark)" /> {room.max_occupancy || 2} Guests
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BedDouble size={14} color="var(--accent-champagne-dark)" /> {room.bed_type || 'King Bed'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Maximize size={14} color="var(--accent-champagne-dark)" /> {room.room_size_sqm || 45} m²
            </div>
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
              {room.amenities.slice(0, 3).map((a, i) => (
                <AmenityBadge key={i} name={a.name} icon={a.icon} />
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <Link to={detailUrl} className="btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}>
            Details
          </Link>
          <Link
            to={bookingUrl}
            className="btn-primary"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', opacity: status === 'MAINTENANCE' ? 0.5 : 1 }}
          >
            Book Now <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
