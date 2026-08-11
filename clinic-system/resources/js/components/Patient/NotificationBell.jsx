// resources/js/components/patient/NotificationBell.jsx - Updated

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPatientPhase8Api } from '../../api/patientapi';
import '../../../css/receptionist-theme.css';

export default function PatientNotifications({ token, onError, onNotificationClick }) {
  const api = createPatientPhase8Api(token);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setItems(await api.listNotifications());
    } catch (e) {
      onError?.(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  async function handleMarkRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch (e) {
      onError?.(e.message);
      load();
    }
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (e) {
      onError?.(e.message);
      load();
    }
  }

  // Handle notification click - navigate to patient chart
  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    setOpen(false);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'prescription_ready': '💊',
      'lab_result_ready': '🔬',
      'radiology_ready': '📊',
      'appointment_booked': '📅',
      'appointment_approved': '✅',
      'appointment_cancelled': '❌',
      'new_message': '💬',
      'treatment_plan': '📋',
    };
    return icons[type] || '📋';
  };

  return (
    <div className="mg-app" style={{ minHeight: 'auto', display: 'inline-block' }} ref={containerRef}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          className="mg-icon-btn"
          aria-label="Notifications"
          onClick={() => setOpen((v) => !v)}
          style={{ position: 'relative' }}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8,
                background: 'var(--mg-error)', color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            className="mg-card"
            style={{
              position: 'absolute', right: 0, top: 48, width: 380, maxHeight: 420, overflowY: 'auto',
              background: '#fff', zIndex: 80, padding: 0, boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div className="mg-flex mg-justify-between mg-items-center" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
              {unreadCount > 0 && (
                <button 
                  type="button" 
                  onClick={handleMarkAllRead} 
                  style={{ background: 'none', border: 'none', color: 'var(--mg-primary)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {loading ? (
              <div className="mg-spinner" />
            ) : items.length === 0 ? (
              <div className="mg-muted mg-text-sm" style={{ padding: 20, textAlign: 'center' }}>No notifications yet.</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 16px', 
                    borderBottom: '1px solid rgba(0,0,0,0.05)', 
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(59,130,246,0.06)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(59,130,246,0.06)'}
                >
                  <div className="mg-flex mg-items-center mg-gap-sm">
                    <span style={{ fontSize: 18 }}>{getNotificationIcon(n.type)}</span>
                    <div style={{ fontSize: 13, lineHeight: 1.4, flex: 1 }}>
                      <span>{n.message}</span>
                      {n.patient_name && (
                        <span style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          👤 {n.patient_name}
                        </span>
                      )}
                      {!n.read && (
                        <span style={{ 
                          display: 'inline-block', 
                          fontSize: 9, 
                          color: '#3b82f6', 
                          marginTop: 2,
                          fontWeight: 600
                        }}>
                          ● New
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mg-muted mg-text-sm" style={{ marginTop: 4, fontSize: 10 }}>
                    {n.time || 'Just now'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" strokeLinejoin="round" />
      <path d="M10 18a2 2 0 004 0" strokeLinecap="round" />
    </svg>
  );
}