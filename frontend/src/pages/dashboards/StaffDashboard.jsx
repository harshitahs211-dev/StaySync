import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import HousekeepingDashboard from './HousekeepingDashboard';
import MaintenanceDashboard from './MaintenanceDashboard';
import RestaurantDashboard from './RestaurantDashboard';
import { Sparkles, Wrench, Utensils } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'HOUSEKEEPING' ? 'housekeeping' :
    user?.role === 'MAINTENANCE' ? 'maintenance' :
    user?.role === 'RESTAURANT' ? 'restaurant' : 'housekeeping'
  );

  return (
    <div>
      {/* Supervisor Department Tab Switcher */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: '0.75rem 0' }}>
        <div className="app-container" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>
            Operations Consoles:
          </span>
          <button
            onClick={() => setActiveTab('housekeeping')}
            className={activeTab === 'housekeeping' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} /> Housekeeping
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <Wrench size={16} /> Engineering Maintenance
          </button>
          <button
            onClick={() => setActiveTab('restaurant')}
            className={activeTab === 'restaurant' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <Utensils size={16} /> F&B In-Stay Dining
          </button>
        </div>
      </div>

      {/* Render Active Console */}
      {activeTab === 'housekeeping' && <HousekeepingDashboard />}
      {activeTab === 'maintenance' && <MaintenanceDashboard />}
      {activeTab === 'restaurant' && <RestaurantDashboard />}
    </div>
  );
}
