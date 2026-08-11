// resources/js/components/receptionist/TodaySchedule.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

/**
 * Today's Schedule Component
 * 
 * Features:
 * - View today's appointments with filtering
 * - Check-in patients
 * - Cancel appointments
 * - Filter by doctor
 * - Status badges (Pending, Confirmed, Checked In, Cancelled)
 * - Phase 6: Quick invoice creation from schedule
 * - Glassmorphism design
 */
const TodaySchedule = () => {
    const api = receptionistApi;
    const navigate = useNavigate();
    const toast = useToast();

    // ===== STATE =====
    const [bookings, setBookings] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [doctorFilter, setDoctorFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actioningId, setActioningId] = useState(null);

    // ===== LOAD DATA =====
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [bookingsRes, doctorsRes] = await Promise.all([
                api.getTodaySchedule(doctorFilter || undefined),
                api.getDoctorAvailability(),
            ]);

            const bookingsData = bookingsRes.data || bookingsRes || [];
            const doctorsData = doctorsRes.data || doctorsRes || [];

            setBookings(bookingsData);
            setDoctors(doctorsData);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load schedule';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [doctorFilter, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ===== HANDLERS =====
    const handleCheckIn = async (booking) => {
        setActioningId(booking.id);
        try {
            await api.checkInAppointment(booking.id);
            setBookings(prev =>
                prev.map(b =>
                    b.id === booking.id 
                        ? { ...b, checked_in_at: new Date().toISOString() } 
                        : b
                )
            );
            toast.success(`${booking.patient?.user?.name || 'Patient'} checked in successfully`);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to check in patient';
            toast.error(message);
        } finally {
            setActioningId(null);
        }
    };

    const handleCancel = async (booking) => {
        if (!window.confirm(`Cancel ${booking.patient?.user?.name || 'Patient'}'s appointment?`)) return;
        
        setActioningId(booking.id);
        try {
            await api.cancelAppointment(booking.id);
            setBookings(prev =>
                prev.map(b =>
                    b.id === booking.id 
                        ? { ...b, status: 'cancelled' } 
                        : b
                )
            );
            toast.success('Appointment cancelled successfully');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to cancel appointment';
            toast.error(message);
        } finally {
            setActioningId(null);
        }
    };

    const handleCreateInvoice = (booking) => {
        navigate(`/receptionist/invoices/create?booking_id=${booking.id}`);
    };

    const handleViewPatient = (patientId) => {
        if (patientId) {
            navigate(`/receptionist/patients/${patientId}`);
        }
    };

    // ===== COMPUTED =====
    const today = new Date().toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    });

    const filteredBookings = bookings.filter(booking => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'waiting') {
            return !booking.checked_in_at && booking.status !== 'cancelled';
        }
        if (statusFilter === 'checked-in') {
            return booking.checked_in_at;
        }
        if (statusFilter === 'cancelled') {
            return booking.status === 'cancelled';
        }
        return booking.status === statusFilter;
    });

    const waitingCount = bookings.filter(b => !b.checked_in_at && b.status !== 'cancelled').length;
    const checkedInCount = bookings.filter(b => b.checked_in_at).length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

    // ===== RENDER =====
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="mg-spinner" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                        Today's Appointments
                    </h2>
                    <p className="text-[#424752] mt-1">{today}</p>
                    <p className="text-sm text-[#424752] mt-0.5">
                        {bookings.length} appointments scheduled
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        className="bg-[#00478d] text-white px-4 py-2 rounded-lg hover:bg-[#00366e] transition flex items-center gap-2 shadow-sm text-sm"
                        onClick={() => navigate('/receptionist/appointments/book')}
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Book Appointment
                    </button>
                    <button 
                        className="border border-[#00478d] text-[#00478d] px-4 py-2 rounded-lg hover:bg-[#00478d]/5 transition flex items-center gap-2 text-sm"
                        onClick={loadData}
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-64">
                    <select
                        className="w-full glass-input rounded-lg px-4 py-2 text-sm appearance-none"
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                    >
                        <option value="">All Doctors</option>
                        {doctors.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name || d.user?.name}
                            </option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#424752] text-[18px]">
                        expand_more
                    </span>
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <FilterChip
                        label={`All (${bookings.length})`}
                        active={statusFilter === 'all'}
                        onClick={() => setStatusFilter('all')}
                    />
                    <FilterChip
                        label={`Waiting (${waitingCount})`}
                        active={statusFilter === 'waiting'}
                        onClick={() => setStatusFilter('waiting')}
                        color="yellow"
                    />
                    <FilterChip
                        label={`Checked In (${checkedInCount})`}
                        active={statusFilter === 'checked-in'}
                        onClick={() => setStatusFilter('checked-in')}
                        color="green"
                    />
                    <FilterChip
                        label={`Cancelled (${cancelledCount})`}
                        active={statusFilter === 'cancelled'}
                        onClick={() => setStatusFilter('cancelled')}
                        color="red"
                    />
                </div>

                <div className="flex-1" />

                {bookings.length > 0 && (
                    <span className="text-xs text-[#424752] whitespace-nowrap">
                        {filteredBookings.length} shown
                    </span>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="glass-panel rounded-xl overflow-hidden">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-4xl text-[#424752]/30 block mb-2">
                            event_available
                        </span>
                        <p className="text-[#424752]">
                            {bookings.length === 0 
                                ? 'No appointments scheduled for today.' 
                                : 'No appointments match the current filters.'}
                        </p>
                        {bookings.length > 0 && statusFilter !== 'all' && (
                            <button
                                className="mt-2 text-sm text-[#00478d] hover:underline"
                                onClick={() => setStatusFilter('all')}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-black/5 bg-[#f2f4f6]/50">
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Time</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Patient</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 hidden md:table-cell">Doctor</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 hidden lg:table-cell">Service</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Status</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => (
                                    <tr 
                                        key={booking.id} 
                                        className={`border-b border-black/5 hover:bg-[#e0e3e5]/30 transition-colors ${
                                            booking.status === 'cancelled' ? 'opacity-60' : ''
                                        }`}
                                    >
                                        {/* Time */}
                                        <td className="py-3 px-4 font-semibold text-[#191c1e] whitespace-nowrap">
                                            {formatTime(booking.time)}
                                            <span className="block text-xs font-normal text-[#424752]">
                                                {booking.duration || '30 min'}
                                            </span>
                                        </td>

                                        {/* Patient */}
                                        <td className="py-3 px-4">
                                            <div 
                                                className="font-medium text-[#191c1e] hover:text-[#00478d] cursor-pointer"
                                                onClick={() => handleViewPatient(booking.patient_id)}
                                            >
                                                {booking.patient?.user?.name || booking.patient?.name || 'Patient'}
                                            </div>
                                            <div className="text-xs text-[#424752]">
                                                {booking.patient?.phone || '—'}
                                            </div>
                                        </td>

                                        {/* Doctor */}
                                        <td className="py-3 px-4 text-[#424752] hidden md:table-cell">
                                            <div className="font-medium">
                                                Dr. {booking.service?.doctor?.user?.name || booking.doctor?.name || '—'}
                                            </div>
                                        </td>

                                        {/* Service */}
                                        <td className="py-3 px-4 text-[#424752] hidden lg:table-cell">
                                            {booking.service?.name || 'Consultation'}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4">
                                            <StatusBadge booking={booking} />
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-4 text-right">
                                            {booking.status !== 'cancelled' ? (
                                                <div className="flex justify-end gap-2 flex-wrap">
                                                    {!booking.checked_in_at && booking.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleCheckIn(booking)}
                                                            disabled={actioningId === booking.id}
                                                            className="px-3 py-1 bg-[#00478d] text-white rounded-lg text-sm hover:bg-[#00366e] transition disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {actioningId === booking.id ? (
                                                                <span className="animate-spin">⟳</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[16px]">check_in</span>
                                                            )}
                                                            Check-In
                                                        </button>
                                                    )}
                                                    
                                                    {!booking.checked_in_at && (
                                                        <button
                                                            onClick={() => handleCancel(booking)}
                                                            disabled={actioningId === booking.id}
                                                            className="px-3 py-1 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    {booking.checked_in_at && (
                                                        <button
                                                            onClick={() => handleCreateInvoice(booking)}
                                                            className="px-3 py-1 bg-[#10b981] text-white rounded-lg text-sm hover:bg-[#059669] transition flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">receipt</span>
                                                            Invoice
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[#424752]">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {bookings.length > 0 && (
                <div className="mt-4 flex justify-between items-center text-sm text-[#424752]">
                    <div>
                        <span className="font-medium">{bookings.length}</span> total appointments
                    </div>
                    <div className="flex gap-4">
                        <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b] mr-1" />
                            {waitingCount} waiting
                        </span>
                        <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] mr-1" />
                            {checkedInCount} checked in
                        </span>
                        <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-[#ef4444] mr-1" />
                            {cancelledCount} cancelled
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== SUB-COMPONENTS =====

/**
 * Filter Chip Component
 */
const FilterChip = ({ label, active, onClick, color = 'default' }) => {
    const colors = {
        default: active ? 'bg-[#00478d] text-white' : 'bg-[#e0e3e5] text-[#424752] hover:bg-[#d0d3d5]',
        yellow: active ? 'bg-[#f59e0b] text-white' : 'bg-[#fef3c7] text-[#d97706] hover:bg-[#fde68a]',
        green: active ? 'bg-[#10b981] text-white' : 'bg-[#d1fae5] text-[#059669] hover:bg-[#a7f3d0]',
        red: active ? 'bg-[#ef4444] text-white' : 'bg-[#fee2e2] text-[#dc2626] hover:bg-[#fca5a5]',
    };

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                colors[color]
            }`}
        >
            {label}
        </button>
    );
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ booking }) => {
    if (booking.status === 'cancelled') {
        return (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#fee2e2] text-[#dc2626]">
                <span className="material-symbols-outlined text-[14px]">cancel</span>
                Cancelled
            </span>
        );
    }
    
    if (booking.checked_in_at) {
        return (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#d1fae5] text-[#059669]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Checked In
            </span>
        );
    }
    
    if (booking.status === 'confirmed') {
        return (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#d9e4f0] text-[#00478d]">
                <span className="material-symbols-outlined text-[14px]">event_available</span>
                Confirmed
            </span>
        );
    }
    
    return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#fef3c7] text-[#d97706]">
            <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
            Pending
        </span>
    );
};

/**
 * Format time helper
 */
const formatTime = (time) => {
    if (!time) return '—';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minutes} ${suffix}`;
};

export default TodaySchedule;