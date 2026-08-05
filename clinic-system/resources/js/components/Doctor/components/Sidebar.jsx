import React, { useState, useEffect } from 'react';
import { HelpCircle, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../data';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

/* ------------------------------------------------------------------ */
/* CLINICAL CLARITY GLASS — Glacier (dark) variant                    */
/* Same tokens as Calendar.jsx, so the sidebar and main content read  */
/* as one cohesive surface instead of two different apps.             */
/* ------------------------------------------------------------------ */

const COLOR = {
    bg: '#0a0e1a',
    surfaceContainer: '#141c2e',
    onSurface: '#e0e8f0',
    onSurfaceVariant: '#a0b4c4',
    primary: '#7dd3fc',
    onPrimary: '#001f2e',
    error: '#ff6b6b',
};

const glassHover = 'hover:bg-[rgba(125,211,252,0.08)]';

export const Sidebar = ({ active, onNavigate }) => {
  const { user, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Clear the badge immediately when the Messages tab becomes active,
  // so the user isn't left staring at a stale unread count while reading.
  // The 30s poll above will re-sync it if new messages arrive later.
  useEffect(() => {
    if (active === 'messages') {
      setUnreadMessages(0);
    }
  }, [active]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/conversations');
      const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      // Don't stomp the "just opened messages" state with a stale poll result:
      // if the user is currently on the messages tab, keep the badge cleared
      // rather than briefly flashing an old count before the backend catches up.
      setUnreadMessages(active === 'messages' ? 0 : totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-full font-['Inter'] border-r border-[rgba(125,211,252,0.1)]"
      style={{ backgroundColor: COLOR.surfaceContainer }}
    >
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[rgba(125,211,252,0.1)] shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7dd3fc 0%, #c8a0f0 100%)',
            color: COLOR.onPrimary,
          }}
        >
          {user?.name?.charAt(0) || 'D'}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold leading-tight truncate" style={{ color: COLOR.onSurface }}>
            {user?.name || 'Doctor'}
          </div>
          <div className="text-[10px] leading-tight truncate" style={{ color: COLOR.onSurfaceVariant }}>
            Cabut gigi tanpa sakit
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          const isMessages = item.key === 'messages';

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(125,211,252,0.15)',
                      color: COLOR.primary,
                      borderLeft: `3px solid ${COLOR.primary}`,
                      boxShadow: 'inset 0 0 20px rgba(125,211,252,0.05)',
                    }
                  : { color: COLOR.onSurfaceVariant, borderLeft: '3px solid transparent' }
              }
              className={`w-full flex items-center gap-3 pl-[17px] pr-5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? '' : `${glassHover} hover:text-[#e0e8f0]`
              }`}
            >
              <div className="relative">
                <Icon size={17} strokeWidth={2} />
                {isMessages && unreadMessages > 0 && (
                  <span
                    className="absolute -top-1 -right-2 text-white text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-[0_0_6px_rgba(255,107,107,0.6)]"
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

      <div className="px-5 py-3 border-t border-[rgba(125,211,252,0.1)] shrink-0 space-y-2">
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
          className="flex items-center gap-2 text-sm w-full px-2 py-1.5 rounded-lg transition hover:bg-[rgba(255,107,107,0.1)]"
          style={{ color: COLOR.error }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};