import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { 
    Calendar, Clock, User, Stethoscope, Activity, ChevronRight, 
    Bell, Settings, HelpCircle, TrendingUp, CheckCircle, 
    Clock as ClockIcon, XCircle, FileText, Heart, Pill, Video, Search 
} from 'lucide-react';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        upcoming: [],
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const statsResponse = await api.get('/patient/dashboard/stats');
            console.log('Dashboard stats:', statsResponse.data);

            const upcomingResponse = await api.get('/patient/appointments/upcoming');
            console.log('Upcoming appointments:', upcomingResponse.data);

            const activityResponse = await api.get('/patient/recent-activity');
            console.log('Recent activity:', activityResponse.data);

            setStats({
                ...statsResponse.data,
                upcoming: upcomingResponse.data || [],
                recent_activity: activityResponse.data || []
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
            completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <ClockIcon className="w-3 h-3" />,
            confirmed: <CheckCircle className="w-3 h-3" />,
            completed: <CheckCircle className="w-3 h-3" />,
            cancelled: <XCircle className="w-3 h-3" />
        };
        return icons[status] || null;
    };

    // The API nests the doctor under `service.doctor` (same shape used in
    // PatientBookings.jsx: `booking.service?.doctor?.name`), not as a
    // top-level `appointment.doctor`. Fall back to a top-level `doctor`
    // field too, in case a different endpoint ever returns it flattened.
    const getDoctorName = (appointment) => {
        return appointment?.service?.doctor?.name || appointment?.doctor?.name || null;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const totalPercent = Math.min((stats.total / 10) * 100, 100);
    const pendingPercent = Math.min((stats.pending / 10) * 100, 100);
    const confirmedPercent = Math.min((stats.confirmed / 10) * 100, 100);
    const completedPercent = Math.min((stats.completed / 10) * 100, 100);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[500px]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-slate-700 font-medium">{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Welcome Banner with Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Welcome back, {user?.name || 'Patient'}!</h3>
                        <p className="text-blue-100 mt-1">Here's what you can do today.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-6 bg-white/10 rounded-xl px-6 py-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{stats.total || 0}</p>
                            <p className="text-xs text-blue-100">Total</p>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{stats.pending || 0}</p>
                            <p className="text-xs text-blue-100">Pending</p>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{stats.confirmed || 0}</p>
                            <p className="text-xs text-blue-100">Confirmed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.total || 0}</p>
                            <p className="text-sm text-slate-500 mt-1">Total Appointments</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: totalPercent + '%' }}></div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
                            <p className="text-sm text-slate-500 mt-1">Pending</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ClockIcon className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: pendingPercent + '%' }}></div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{stats.confirmed || 0}</p>
                            <p className="text-sm text-slate-500 mt-1">Confirmed</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: confirmedPercent + '%' }}></div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.completed || 0}</p>
                            <p className="text-sm text-slate-500 mt-1">Completed</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-slate-600" />
                        </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-600 rounded-full transition-all duration-500" style={{ width: completedPercent + '%' }}></div>
                    </div>
                </div>
            </div>

            {/* Main Actions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link to="/patient/services" className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm group-hover:scale-110 transition-transform">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">Medical Services</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-5 flex-1">Explore available services from our doctors and book an appointment that fits your needs.</p>
                    <span className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        Browse Services →
                    </span>
                </Link>

                <Link to="/patient/my-bookings" className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">My Bookings</h3>
                        <span className="ml-auto text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">{stats.total || 0} total</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-5 flex-1">View, track, and manage the status of all your booked appointments in one place.</p>
                    <span className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        View Bookings →
                    </span>
                </Link>

                <Link to="/patient/profile" className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm group-hover:scale-110 transition-transform">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">My Profile</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-5 flex-1">Update your personal information, contact details, and medical preferences.</p>
                    <span className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        View Profile →
                    </span>
                </Link>
            </div>

            {/* Upcoming Appointments Section */}
            {stats.upcoming && stats.upcoming.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Upcoming Appointments
                        </h3>
                        <Link to="/patient/my-bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            View all
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats.upcoming.map((appointment, index) => {
                            const doctorName = getDoctorName(appointment);
                            return (
                                <div key={index} className="px-6 py-4 hover:bg-slate-50 transition group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-800">{appointment.service?.name || appointment.service || 'Service'}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {doctorName ? `Dr. ${doctorName}` : 'Doctor not assigned'}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span>{formatDate(appointment.date)}</span>
                                                <span>•</span>
                                                <span>{formatTime(appointment.time)}</span>
                                            </div>
                                        </div>
                                        <Link to="/patient/my-bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Activity Section */}
            {stats.recent_activity && stats.recent_activity.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Recent Activity
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats.recent_activity.slice(0, 5).map((activity, index) => (
                            <div key={index} className="px-6 py-3 hover:bg-slate-50 transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-700">{activity.action}</p>
                                        <p className="text-xs text-slate-400">{formatDate(activity.date)} at {activity.time}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Help Section */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800">Need help?</h4>
                            <p className="text-sm text-slate-500">Contact our support team for assistance with bookings or services.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <a href="#" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
                            Help Center
                        </a>
                        <a href="#" className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;