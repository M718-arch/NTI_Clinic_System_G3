import React, { useState, useEffect } from 'react';
import { LayoutGrid, Bell, TrendingUp, TrendingDown, CalendarDays, Users, UserPlus, DollarSign } from 'lucide-react';
import { SearchBox } from '../components/SearchBox';
import { Badge } from '../components/Badge';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

export const Overview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_services: 0,
    total_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    upcoming_bookings: []
  });
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTodayAppointments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const response = await api.get('/doctor/bookings');
      const bookings = response.data.bookings || [];
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
      setTodayAppointments(todayBookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Today's Appointments", 
      value: todayAppointments.length, 
      delta: "+0", 
      up: true, 
      icon: CalendarDays, 
      tint: "#eef4ff", 
      fg: "#3b7cf6" 
    },
    { 
      label: "Total Bookings", 
      value: stats.total_bookings || 0, 
      delta: "+0", 
      up: true, 
      icon: Users, 
      tint: "#f0fbf6", 
      fg: "#22b07d" 
    },
    { 
      label: "Pending", 
      value: stats.pending_bookings || 0, 
      delta: "-0", 
      up: false, 
      icon: UserPlus, 
      tint: "#fff8f1", 
      fg: "#f2994a" 
    },
    { 
      label: "Completed", 
      value: stats.completed_bookings || 0, 
      delta: "+0", 
      up: true, 
      icon: DollarSign, 
      tint: "#f2f3fa", 
      fg: "#2f3e83" 
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Welcome back, Dr. {user?.name || 'Doctor'}!</h2>
            <p className="text-sm text-slate-400 mt-0.5">Here's what's happening in your clinic today.</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchBox />
            <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <Bell size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            const Trend = s.up ? TrendingUp : TrendingDown;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.tint }}>
                    <Icon size={18} style={{ color: s.fg }} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? "text-emerald-500" : "text-red-500"}`}>
                    <Trend size={13} /> {s.delta}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800 mt-3">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Today's Schedule</h3>
              <button className="text-xs font-medium text-blue-600">View calendar</button>
            </div>
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No appointments today</p>
              ) : (
                todayAppointments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-xs font-semibold text-slate-500 w-12 shrink-0">{a.time}</div>
                      <img src={`https://i.pravatar.cc/64?img=${i + 15}`} className="w-9 h-9 rounded-full object-cover shrink-0" alt={a.patient?.name || 'Patient'} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{a.patient?.name || 'Patient'}</div>
                        <div className="text-xs text-slate-400 truncate">{a.service?.name || 'Service'}</div>
                      </div>
                    </div>
                    <Badge tone={a.status === 'confirmed' ? 'green' : a.status === 'pending' ? 'orange' : 'blue'}>
                      {a.status?.charAt(0).toUpperCase() + a.status?.slice(1) || 'N/A'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Total Services</span>
                <span className="text-sm font-semibold text-slate-800">{stats.total_services || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Total Bookings</span>
                <span className="text-sm font-semibold text-slate-800">{stats.total_bookings || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Pending</span>
                <span className="text-sm font-semibold text-amber-600">{stats.pending_bookings || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Completed</span>
                <span className="text-sm font-semibold text-emerald-600">{stats.completed_bookings || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};