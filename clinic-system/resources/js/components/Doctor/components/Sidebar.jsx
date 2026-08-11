// resources/js/components/Doctor/components/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { HelpCircle, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../data';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

/* ------------------------------------------------------------------ */
/* CLINICAL CLARITY GLASS — Light variant                             */
/* Tokens sourced 1:1 from DESIGN.md ("Clinical Clarity Glass").      */
/* Same tokens as Calendar.jsx, so the sidebar and main content read  */
/* as one cohesive surface instead of two different apps.             */
/* ------------------------------------------------------------------ */

const COLOR = {
    surfaceContainerLowest: '#ffffff',
    surfaceContainer: '#eceef0',
    onSurface: '#191c1e',
    onSurfaceVariant: '#424752',
    outlineVariant: '#c2c6d4',
    primary: '#00478d',
    primaryContainer: '#005eb8',
    onPrimary: '#ffffff',
    secondaryContainer: '#d9e4f0',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
};

const glassHover = 'hover:bg-[rgba(0,71,141,0.06)]';

export const Sidebar = ({ active, onNavigate }) => {
  const { user, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchQueueCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchQueueCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Clear the badge immediately when the Messages tab becomes active
  useEffect(() => {
    if (active === 'messages') {
      setUnreadMessages(0);
    }
  }, [active]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/conversations');
      const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      setUnreadMessages(active === 'messages' ? 0 : totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // ✅ Phase 8: Fetch queue count for badge
  const fetchQueueCount = async () => {
    try {
      const response = await api.get('/doctor/queue');
      const waitingCount = response.data?.waiting?.length || 0;
      setQueueCount(waitingCount);
    } catch (error) {
      console.error('Error fetching queue count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-full font-['Inter'] border-r border-[rgba(0,0,0,0.06)]"
      style={{ backgroundColor: COLOR.surfaceContainerLowest }}
    >
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[rgba(0,0,0,0.06)] shrink-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 font-['Plus_Jakarta_Sans']"
          style={{
            background: 'linear-gradient(135deg, #005eb8 0%, #00478d 100%)',
            color: COLOR.onPrimary,
          }}
        >
          {user?.name?.charAt(0) || 'D'}
        </div>
        <div className="min-w-0">
          <div
            className="text-[15px] font-bold leading-tight truncate font-['Plus_Jakarta_Sans']"
            style={{ color: COLOR.onSurface }}
          >
            {user?.name || 'Doctor'}
          </div>
          <div className="text-[10px] leading-tight truncate" style={{ color: COLOR.onSurfaceVariant }}>
            Doctor Portal
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          const isMessages = item.key === 'messages';
          const isQueue = item.key === 'queue';

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={
                isActive
                  ? {
                      backgroundColor: COLOR.secondaryContainer,
                      color: COLOR.primary,
                      borderLeft: `3px solid ${COLOR.primary}`,
                    }
                  : { color: COLOR.onSurfaceVariant, borderLeft: '3px solid transparent' }
              }
              className={`w-full flex items-center gap-3 pl-[17px] pr-5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? '' : `${glassHover} hover:text-[${COLOR.onSurface}]`
              }`}
            >
              <div className="relative">
                <Icon size={17} strokeWidth={2} />
                {/* ✅ Phase 8: Queue badge */}
                {isQueue && queueCount > 0 && (
                  <span
                    className="absolute -top-1 -right-2 text-white text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm"
                    style={{ backgroundColor: COLOR.primary, color: COLOR.onPrimary }}
                  >
                    {queueCount > 99 ? '99+' : queueCount}
                  </span>
                )}
                {/* Messages badge */}
                {isMessages && unreadMessages > 0 && (
                  <span
                    className="absolute -top-1 -right-2 text-white text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm"
                    style={{ backgroundColor: COLOR.error }}
                  >
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t border-[rgba(0,0,0,0.06)] shrink-0 space-y-2">
        <button
          className={`flex items-center gap-2 text-sm w-full transition rounded-lg px-2 py-1.5 ${glassHover}`}
          style={{ color: COLOR.onSurfaceVariant }}
        >
          <HelpCircle size={16} />
          Help ?
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm w-full px-2 py-1.5 rounded-lg transition hover:bg-[rgba(186,26,26,0.08)]"
          style={{ color: COLOR.error }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};