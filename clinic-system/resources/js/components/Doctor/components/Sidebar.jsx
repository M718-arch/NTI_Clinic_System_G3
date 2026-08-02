import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../data';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

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
    <aside className="w-56 shrink-0 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0) || 'D'}
        </div>
        <div>
          <div className="text-[15px] font-bold text-slate-800 leading-tight">{user?.name || 'Doctor'}</div>
          <div className="text-[10px] text-slate-400 leading-tight">Cabut gigi tanpa sakit</div>
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
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <div className="relative">
                <Icon size={17} strokeWidth={2} />
                {isMessages && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t border-slate-100 shrink-0 space-y-2">
        <button className="flex items-center gap-2 text-slate-400 text-sm hover:text-slate-600 w-full transition">
          <HelpCircle size={16} />
          Help ?
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 text-sm hover:text-red-700 hover:bg-red-50 w-full px-2 py-1.5 rounded-lg transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};