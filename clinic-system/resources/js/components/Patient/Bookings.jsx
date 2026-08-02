import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, ChevronRight, XCircle, CheckCircle, Clock as ClockIcon, FileText, Plus, Filter, Search, AlertCircle } from 'lucide-react';
import api from '../../api/client';

const PatientBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/patient/my-bookings');
            setBookings(response.data.bookings || []);
            calculateStats(response.data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    // `/patient/my-bookings` returns raw Eloquent models (service.doctor.user
    // eager-loaded), not the manually-shaped payload that `/upcoming` and
    // `/past` return. So there's no `doctor.name` field here at all — the
    // Doctor model's real columns are `full_name` (often blank) and the
    // related `user.name`. Mirror the backend's `resolveDoctorName()` logic
    // here so both pages show the same value.
    const getDoctorName = (booking) => {
        const doctor = booking?.service?.doctor;
        if (!doctor) return null;

        const fullName = (doctor.full_name || '').trim();
        if (fullName) return fullName;

        const userName = (doctor.user?.name || '').trim();
        if (userName) return userName;

        return null;
    };

    const calculateStats = (data) => {
        const now = new Date();
        const stats = {
            total: data.length,
            upcoming: data.filter(b => 
                b.status !== 'cancelled' && 
                b.status !== 'completed' && 
                new Date(b.date) >= now
            ).length,
            completed: data.filter(b => b.status === 'completed').length,
            cancelled: data.filter(b => b.status === 'cancelled').length
        };
        setStats(stats);
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await api.patch(`/bookings/${bookingId}/cancel`);
            fetchBookings();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking. Please try again.');
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
        switch(status) {
            case 'pending': return <ClockIcon className="w-3 h-3" />;
            case 'confirmed': return <CheckCircle className="w-3 h-3" />;
            case 'completed': return <CheckCircle className="w-3 h-3" />;
            case 'cancelled': return <XCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    const getFilteredBookings = () => {
        let filtered = bookings;

        // Apply status filter
        if (filter === 'upcoming') {
            filtered = filtered.filter(b => 
                b.status !== 'cancelled' && 
                b.status !== 'completed'
            );
        } else if (filter === 'past') {
            filtered = filtered.filter(b => 
                b.status === 'completed' || b.status === 'cancelled'
            );
        } else if (filter !== 'all') {
            filtered = filtered.filter(b => b.status === filter);
        }

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(b => 
                b.service?.name?.toLowerCase().includes(search) ||
                getDoctorName(b)?.toLowerCase().includes(search) ||
                b.date?.includes(search)
            );
        }

        return filtered;
    };

    const filteredBookings = getFilteredBookings();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all your appointments in one place</p>
                </div>
                <Link
                    to="/patient/services"
                    className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Book New Appointment
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total Bookings</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                    <p className="text-sm text-slate-500">Upcoming</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="text-sm text-slate-500">Cancelled</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                filter === 'all' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                filter === 'upcoming' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                filter === 'past' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Past
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                filter === 'pending' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                                filter === 'cancelled' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Cancelled
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No bookings found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {searchTerm ? 'Try adjusting your search or filters' : 'Book your first appointment today'}
                        </p>
                        <Link
                            to="/patient/services"
                            className="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            Browse Services
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredBookings.map((booking) => {
                            const doctorName = getDoctorName(booking);
                            return (
                                <div
                                    key={booking.id}
                                    className="px-6 py-5 hover:bg-slate-50 transition group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100 shrink-0">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {booking.service?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {doctorName ? `Dr. ${doctorName}` : 'Doctor not assigned'}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {booking.date || 'N/A'}
                                                    </span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {booking.time || 'N/A'}
                                                    </span>
                                                    {booking.notes && (
                                                        <>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span className="text-slate-400 truncate max-w-[150px]">
                                                                {booking.notes}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                    booking.status
                                                )} flex items-center gap-1`}
                                            >
                                                {getStatusIcon(booking.status)}
                                                {booking.status
                                                    ? booking.status.charAt(0).toUpperCase() +
                                                      booking.status.slice(1)
                                                    : 'N/A'}
                                            </span>

                                            {booking.status !== 'cancelled' &&
                                                booking.status !== 'completed' && (
                                                    <>
                                                        <Link
                                                            to={`/patient/my-bookings/${booking.id}/edit`}
                                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                cancelBooking(
                                                                    booking.id
                                                                )
                                                            }
                                                            className="text-sm text-red-600 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            
                                            {booking.status === 'completed' && (
                                                <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            {filteredBookings.length > 0 && (
                <div className="mt-4 text-sm text-slate-400 text-center">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                </div>
            )}
        </div>
    );
};

export default PatientBookings;