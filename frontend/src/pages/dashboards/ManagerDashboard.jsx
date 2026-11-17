import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { TrendingUp, Users, DollarSign, Hotel, Star, Award, Shield, FileText, Download, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getManagerAnalytics();
      if (res.data) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const m = data.metrics;
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Total Revenue INR,${m.total_revenue_inr}\n` +
      `Total Bookings,${m.total_bookings}\n` +
      `Occupancy Rate %,${m.occupancy_rate_percentage}\n` +
      `Average Daily Rate ADR,${m.average_daily_rate}\n` +
      `RevPAR,${m.revpar}\n` +
      `Average Rating,${m.average_rating}\n` +
      `Available Rooms,${m.available_rooms}\n` +
      `Occupied Rooms,${m.occupied_rooms}\n` +
      `Dirty Rooms,${m.dirty_rooms}\n` +
      `Under Maintenance,${m.maintenance_rooms}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StaySync_Executive_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Executive audit CSV exported successfully');
    setTimeout(() => setExportNotice(null), 3000);
  };

  if (loading || !data) {
    return (
      <div className="app-container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading StaySync executive analytics data & live metrics...
      </div>
    );
  }

  const { metrics, department_revenue, revenue_trend, room_distribution, sentiment_breakdown } = data;

  return (
    <div className="app-container" style={{ padding: '3rem 0 5rem 0' }}>
      
      {/* Header Banner */}
      <div className="luxury-panel" style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Executive Hospitality Intelligence
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '4px 0 6px 0', fontFamily: 'var(--font-serif)' }}>
            StaySync General Manager Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Logged in as <strong>Marcus Sterling (General Manager & System Admin)</strong> • Multi-property performance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            <Download size={16} /> Export Audit Report (CSV)
          </button>
          <button onClick={loadAnalytics} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.88rem' }}>
            <RefreshCw size={15} /> Refresh Metrics
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="badge-available" style={{ width: '100%', padding: '12px 18px', marginBottom: '1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
          ✓ {exportNotice}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-sage-dark)', margin: '4px 0' }}>
            {formatCurrency(metrics.total_revenue_inr)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-available-text)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={14} /> +18.4% vs last period
          </div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Occupancy Rate</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-champagne-dark)', margin: '4px 0' }}>
            {metrics.occupancy_rate_percentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {metrics.occupied_rooms} of {metrics.available_rooms + metrics.occupied_rooms} Suites Occupied
          </div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Average Daily Rate (ADR)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
            {formatCurrency(metrics.average_daily_rate)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            RevPAR: {formatCurrency(metrics.revpar)}
          </div>
        </div>

        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Guest Satisfaction</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={24} fill="#8DA58B" color="#8DA58B" /> {metrics.average_rating}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Aspect sentiment: 98% positive
          </div>
        </div>

      </div>

      {/* Charts & Distribution Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* 7-Day Revenue Trend Chart */}
        <div className="luxury-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)' }}>
                7-Day Revenue & Demand Velocity
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily revenue capture in Indian Rupees (₹)</div>
            </div>
            <span className="badge-sand">Peak: Weekend (Fri/Sat)</span>
          </div>

          {/* Clean CSS/SVG Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
            {revenue_trend.map((item, idx) => {
              const maxRev = 80000;
              const barHeight = Math.min(100, Math.round((item.revenue / maxRev) * 100));

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-sage-dark)' }}>
                    ₹{(item.revenue / 1000).toFixed(0)}k
                  </div>
                  <div
                    style={{
                      width: '36px',
                      height: `${barHeight * 1.6}px`,
                      backgroundColor: idx >= 4 ? 'var(--accent-sage-dark)' : 'var(--accent-champagne)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease'
                    }}
                    title={`${item.day}: ₹${item.revenue.toLocaleString('en-IN')} (${item.occupancy}% Occupancy)`}
                  />
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.day}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span>Weekday Baseline</span>
            <span>Surge Rate Trigger Active</span>
          </div>
        </div>

        {/* Department Revenue Breakdown */}
        <div className="luxury-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
              Departmental Revenue
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Revenue contribution by division</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Room Accommodation</span>
                  <strong>{formatCurrency(department_revenue.room_tariffs)} (96%)</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '96%', height: '100%', background: 'var(--accent-sage-dark)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Fine Dining & In-Room Bar</span>
                  <strong>{formatCurrency(department_revenue.in_room_dining)}</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', background: 'var(--accent-champagne-dark)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Ayurvedic Wellness Spa</span>
                  <strong>{formatCurrency(department_revenue.spa_wellness)}</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', background: 'var(--status-available-text)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Valet & Express Laundry</span>
                  <strong>{formatCurrency(department_revenue.laundry_valet)}</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '20%', height: '100%', background: 'var(--status-pending-text)' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginTop: '1.5rem', border: '1px solid var(--border-light)' }}>
            Integrated with automated guest folio checkout settling.
          </div>
        </div>

      </div>

      {/* Aspect Sentiment Insights */}
      <div className="luxury-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
          Guest Review Aspect Sentiment Breakdown (NLP Analysis)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Extracted aspect scores across reviews for Cleanliness, Staff Quality, Rooms, Dining, and Wi-Fi.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cleanliness & Hygiene</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-available-text)', margin: '4px 0' }}>{sentiment_breakdown.aspects.cleanliness}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Turnover protocol compliance</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Staff Courtesy</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-sage-dark)', margin: '4px 0' }}>{sentiment_breakdown.aspects.staff}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Front desk & butler feedback</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Suite & Bed Quality</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-champagne-dark)', margin: '4px 0' }}>{sentiment_breakdown.aspects.room_quality}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Acoustic comfort & views</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Culinary Excellence</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{sentiment_breakdown.aspects.food}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Breakfast & in-room bar</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gigabit Wi-Fi</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-sage-dark)', margin: '4px 0' }}>{sentiment_breakdown.aspects.wifi}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Bandwidth & reliability</div>
          </div>
        </div>
      </div>

    </div>
  );
}
