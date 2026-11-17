import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Award, Shield, Sparkles, MapPin, Phone, Mail, Clock, HelpCircle, FileText, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-light)',
      color: 'var(--text-secondary)',
      padding: '4.5rem 0 2rem 0',
      marginTop: 'auto'
    }}>
      <div className="app-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          
          {/* Col 1: Brand & Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-sage-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(91, 106, 83, 0.25)'
              }}>
                <Hotel size={24} />
              </div>
              <div>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                  StaySync
                </span>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-champagne-dark)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Luxury Hospitality Cloud
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.65', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
              StaySync is an enterprise hospitality platform delivering intelligent property management, real-time inventory synchronization, contactless guest journeys, and automated operational orchestration.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--accent-sage-dark)', fontWeight: 600 }}>
              <Shield size={16} /> PCI-DSS Compliant • 99.99% High Availability
            </div>
          </div>

          {/* Col 2: Explore Hotels & Flagships */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', fontFamily: 'var(--font-serif)', letterSpacing: '0.04em' }}>
              Explore Hotels
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <li>
                <Link to="/search?city=Mumbai" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}>
                  <MapPin size={15} color="var(--accent-champagne-dark)" />
                  <span>StaySync Grand Resort, Mumbai</span>
                </Link>
              </li>
              <li>
                <Link to="/search?city=Udaipur" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}>
                  <MapPin size={15} color="var(--accent-champagne-dark)" />
                  <span>StaySync Royal Palace, Udaipur</span>
                </Link>
              </li>
              <li>
                <Link to="/search?city=Goa" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}>
                  <MapPin size={15} color="var(--accent-champagne-dark)" />
                  <span>StaySync Azure Sands, North Goa</span>
                </Link>
              </li>
              <li>
                <Link to="/search" style={{ color: 'var(--accent-sage-dark)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View All Flagship Destinations <ChevronRight size={14} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Rooms & Guest Services */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', fontFamily: 'var(--font-serif)', letterSpacing: '0.04em' }}>
              Rooms & Guest Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Presidential Sea Penthouses</Link></li>
              <li><Link to="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Azure Beachfront Plunge Villas</Link></li>
              <li><Link to="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Royal Lake Heritage Chambers</Link></li>
              <li>24/7 In-Room Fine Dining & Butler Service</li>
              <li>Ayurvedic Thermal Wellness & Spa</li>
              <li>Digital NFC & QR Contactless Room Access</li>
            </ul>
          </div>

          {/* Col 4: Corporate, Legal & Support */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', fontFamily: 'var(--font-serif)', letterSpacing: '0.04em' }}>
              Support & Legal Policies
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--accent-sage-dark)" />
                <span>Concierge: +91 (22) 6789-5500</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--accent-sage-dark)" />
                <span>support@staysync.com</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={14} color="var(--accent-sage-dark)" />
                <span>Terms & Conditions</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={14} color="var(--accent-sage-dark)" />
                <span>Privacy & Data Protection Policy</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={14} color="var(--accent-sage-dark)" />
                <span>Cancellation & Refund Policy</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Copyright © {new Date().getFullYear()} StaySync. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Cancellation Policy</span>
            <span>Help & Support</span>
            <span>INR (₹) Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
