import React, { useState } from 'react';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { formatDisplayDate } from '../utils/formatCurrency';

export default function DatePickerField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  required = false,
  error = null,
  helperText = null
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Enforce minimum date format (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveMinDate = minDate || todayStr;

  const displayDateStr = value ? formatDisplayDate(value) : 'Select Date';

  const handleContainerClick = (e) => {
    const inputEl = e.currentTarget.querySelector('input[type="date"]');
    if (inputEl) {
      try {
        if (inputEl.showPicker) {
          inputEl.showPicker();
        } else {
          inputEl.focus();
        }
      } catch (err) {
        inputEl.focus();
      }
    }
  };

  return (
    <div className="input-group" style={{ position: 'relative', marginBottom: '0.25rem' }}>
      {label && (
        <label
          className="input-label"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px'
          }}
        >
          <CalendarIcon size={14} color="var(--accent-sage-dark)" />
          {label}
        </label>
      )}

      <div
        className="date-picker-wrapper"
        onClick={handleContainerClick}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${error ? 'var(--error)' : isFocused ? 'var(--accent-sage)' : 'var(--border-light)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          cursor: 'pointer',
          boxShadow: isFocused ? '0 0 0 3px rgba(168, 181, 160, 0.25)' : 'var(--shadow-subtle)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isFocused && !error) {
            e.currentTarget.style.borderColor = 'var(--accent-champagne)';
            e.currentTarget.style.backgroundColor = '#FAF9F6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isFocused && !error) {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }
        }}
      >
        <CalendarIcon
          size={18}
          color="var(--accent-sage-dark)"
          style={{ marginRight: '0.65rem', flexShrink: 0 }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.92rem',
              fontWeight: value ? 700 : 500,
              color: value ? 'var(--text-primary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {displayDateStr}
          </div>
        </div>

        {/* Real Native HTML5 Date Input overlay with color-scheme light */}
        <input
          type="date"
          value={value || ''}
          min={effectiveMinDate}
          max={maxDate}
          required={required}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            colorScheme: 'light',
            zIndex: 2
          }}
        />
      </div>

      {error ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
