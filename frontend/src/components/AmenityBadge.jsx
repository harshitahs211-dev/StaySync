import React from 'react';
import { Wifi, Sparkles, Sun, Key, Coffee, Droplet, UserCheck, Waves } from 'lucide-react';

const iconMap = {
  wifi: Wifi,
  pool: Waves,
  spa: Sparkles,
  sun: Sun,
  key: Key,
  coffee: Coffee,
  droplet: Droplet,
  'user-check': UserCheck
};

export default function AmenityBadge({ name, icon }) {
  const IconComponent = iconMap[icon] || Sparkles;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '0.35rem 0.75rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      color: 'var(--text-secondary)'
    }}>
      <IconComponent size={14} color="#f59e0b" />
      {name}
    </span>
  );
}
