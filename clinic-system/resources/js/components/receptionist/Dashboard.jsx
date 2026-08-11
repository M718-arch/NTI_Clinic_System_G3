// resources/js/components/receptionist/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useAuth } from '../../context/AuthContext';

/**
 * Receptionist Dashboard
 * 
 * Displays key metrics and today's overview:
 * - Pending patient registrations
 * - Today's appointments count
 * - Doctors on duty
 * - Pending billings (Phase 6)
 * - Today's schedule highlights with check-in
 * - Doctor availability status
 * 
 * Uses glassmorphism theme with Material Symbols icons.
 */
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        pending_patient_registrations: 0,
        todays_appointments: 0,
        doctors_on_duty: 0,
        pending_billings: 0,
        outstanding_amount: 0,
        billing_summary: null
    });
    const [schedule, setSchedule] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkingIn, setCheckingIn] = useState(null);

    // ===== LOAD DATA =====
    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        setError(null);

        try {
            const [statsRes, scheduleRes, doctorsRes] = await Promise.all([
                receptionistApi.getDashboardStats(),
                receptionistApi.getTodaySchedule(),
                receptionistApi.getDoctorAvailability()
            ]);

            // Extract data from responses (handle both axios and fetch)
            const statsData = statsRes.data || statsRes;
            const scheduleData = scheduleRes.data || scheduleRes;
            const doctorsData = doctorsRes.data || doctorsRes;

            // Process doctors availability
            const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
            const availableDoctors = doctorsList.filter(d => d.is_available || d.available).length;

            setStats({
                pending_patient_registrations: statsData.pending_patient_registrations || 0,
                todays_appointments: statsData.todays_appointments || 0,
                doctors_on_duty: availableDoctors,
                pending_billings: statsData.pending_billings || 0,
                outstanding_amount: statsData.outstanding_amount || 0,
                billing_summary: statsData.billing_summary || null
            });

            setSchedule(Array.isArray(scheduleData) ? scheduleData.slice(0, 4) : []);
            setDoctors(doctorsList.slice(0, 5));

        } catch (err) {
            console.error('Dashboard load error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // ===== HANDLERS =====
    const handleCheckIn = async (bookingId) => {
        setCheckingIn(bookingId);
        try {
            await receptionistApi.checkInAppointment(bookingId);
            setSchedule(prev =>
                prev.map(b => 
                    b.id === bookingId 
                        ? { ...b, checked_in_at: new Date().toISOString() } 
                        : b
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to check in patient');
        } finally {
            setCheckingIn(null);
        }
    };

    const formatTime = (time) => {
        if (!time) return '--';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const hour12 = ((hour + 11) % 12) + 1;
        return `${hour12}:${minutes} ${suffix}`;
    };

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return `$${num.toLocaleString(undefined, { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        })}`;
    };

    // ===== LOADING =====
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="mg-spinner" />
            </div>
        );
    }

    // ===== RENDER =====
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                    Receptionist Dashboard
                </h2>
                <p className="text-[#424752] mt-1">
                    Good morning, {user?.name || 'there'}. Here is today's overview.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pending Registrations */}
                <StatCard
                    icon="person_add"
                    iconBg="#d9e4f0"
                    iconColor="#00478d"
                    label="Pending Registrations"
                    value={stats.pending_patient_registrations}
                    badge="Urgent: 2"
                    badgeColor="#e0e3e5"
                    onClick={() => navigate('/receptionist/patients?tab=pending')}
                />

                {/* Today's Appointments */}
                <StatCard
                    icon="event"
                    iconBg="rgba(0,71,141,0.15)"
                    iconColor="#00478d"
                    label="Today's Appointments"
                    value={stats.todays_appointments}
                    onClick={() => navigate('/receptionist/schedule')}
                />

                {/* Doctors on Duty */}
                <StatCard
                    icon="stethoscope"
                    iconBg="#e0e3e5"
                    iconColor="#00478d"
                    label="Doctors on Duty"
                    value={stats.doctors_on_duty}
                    badge={<span className="flex items-center text-[#00478d] text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00478d] mr-1 animate-pulse"></span>
                        Active
                    </span>}
                />

                {/* Pending Billings - Phase 6 */}
                <StatCard
                    icon="receipt_long"
                    iconBg="#ffdad6"
                    iconColor="#ba1a1a"
                    label="Pending Billings"
                    value={formatCurrency(stats.outstanding_amount || stats.pending_billings)}
                    badge={`${stats.pending_billings} unpaid`}
                    badgeColor="#ffdad6"
                    onClick={() => navigate('/receptionist/invoices')}
                />
            </div>

            {/* Schedule & Doctors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 glass-panel rounded-xl p-5">
                    <div className="flex justify-between items-center border-b border-black/5 pb-3 mb-4">
                        <h3 className="text-base font-semibold text-[#191c1e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#00478d]">schedule</span>
                            Today's Schedule Highlights
                            <span className="text-xs font-normal text-[#424752]">
                                ({schedule.length} appointments)
                            </span>
                        </h3>
                        <button 
                            className="text-[#00478d] text-sm hover:underline font-medium transition"
                            onClick={() => navigate('/receptionist/schedule')}
                        >
                            View All →
                        </button>
                    </div>

                    <div className="space-y-3">
                        {schedule.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-[#424752]/30">event_available</span>
                                <p className="text-[#424752] mt-2">No appointments scheduled for today.</p>
                                <button
                                    className="mt-3 text-sm text-[#00478d] hover:underline"
                                    onClick={() => navigate('/receptionist/appointments/book')}
                                >
                                    Book an appointment →
                                </button>
                            </div>
                        ) : (
                            schedule.map((booking) => (
                                <div 
                                    key={booking.id} 
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-white/40 hover:bg-white/80 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-1 h-10 rounded-full shrink-0 ${
                                            booking.checked_in_at 
                                                ? 'bg-[#10b981]' 
                                                : 'bg-[#00478d]'
                                        }`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-[#191c1e] truncate">
                                                {booking.patient?.user?.name || booking.patient?.name || 'Patient'}
                                            </p>
                                            <p className="text-xs text-[#424752] truncate flex items-center gap-2">
                                                <span>{formatTime(booking.time)}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#424752]/30" />
                                                <span>Dr. {booking.service?.doctor?.user?.name || 'Doctor'}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#424752]/30" />
                                                <span>{booking.service?.name || 'Consultation'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 ml-2">
                                        {booking.checked_in_at ? (
                                            <span className="px-3 py-1 bg-[#10b981]/10 text-[#059669] rounded-full text-xs font-medium border border-[#10b981]/20 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Checked In
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckIn(booking.id)}
                                                disabled={checkingIn === booking.id}
                                                className="px-4 py-1.5 bg-[#00478d] text-white rounded-full text-sm hover:bg-[#00366e] transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                                            >
                                                {checkingIn === booking.id ? (
                                                    <>
                                                        <span className="animate-spin">⟳</span>
                                                        ...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[16px]">check_in</span>
                                                        Check-In
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Doctor Availability */}
                <div className="glass-panel rounded-xl p-5">
                    <h3 className="text-base font-semibold text-[#191c1e] flex items-center gap-2 border-b border-black/5 pb-3 mb-4">
                        <span className="material-symbols-outlined text-[#00478d]">medical_services</span>
                        Doctor Availability
                        <span className="text-xs font-normal text-[#424752]">
                            ({stats.doctors_on_duty} on duty)
                        </span>
                    </h3>

                    <div className="space-y-3">
                        {doctors.length === 0 ? (
                            <div className="text-center py-6">
                                <span className="material-symbols-outlined text-4xl text-[#424752]/30">person_off</span>
                                <p className="text-[#424752] text-sm mt-2">No doctors available</p>
                            </div>
                        ) : (
                            doctors.map((doc) => {
                                const isAvailable = doc.is_available !== undefined ? doc.is_available : doc.available;
                                return (
                                    <div key={doc.id} className="flex items-center justify-between group hover:bg-white/50 p-2 rounded-lg transition">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-[#e0e3e5] overflow-hidden flex items-center justify-center shrink-0">
                                                {doc.avatar || doc.image_url ? (
                                                    <img 
                                                        src={doc.avatar || doc.image_url} 
                                                        alt={doc.name} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined text-[#424752]">person</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-[#191c1e] truncate">
                                                    {doc.name || doc.user?.name}
                                                </p>
                                                <p className="text-xs text-[#424752] truncate">
                                                    {doc.specialization || 'General Practice'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2 flex items-center gap-1 ${
                                            isAvailable 
                                                ? 'bg-[#00478d]/10 text-[#00478d]' 
                                                : 'bg-[#e0e3e5] text-[#424752]'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                isAvailable ? 'bg-[#00478d]' : 'bg-[#424752]'
                                            }`} />
                                            {isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {doctors.length > 0 && (
                        <button
                            className="w-full mt-4 text-center text-sm text-[#00478d] hover:underline font-medium transition"
                            onClick={() => navigate('/receptionist/doctors')}
                        >
                            View all doctors →
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Actions - Phase 6 Billing */}
            <div className="glass-panel rounded-xl p-5">
                <h3 className="text-base font-semibold text-[#191c1e] flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#00478d]">quick_reference</span>
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <QuickAction
                        icon="add"
                        label="Book Appointment"
                        onClick={() => navigate('/receptionist/appointments/book')}
                    />
                    <QuickAction
                        icon="person_add"
                        label="Register Patient"
                        onClick={() => navigate('/receptionist/patients/walk-in')}
                    />
                    <QuickAction
                        icon="receipt"
                        label="Create Invoice"
                        onClick={() => navigate('/receptionist/invoices/create')}
                    />
                    <QuickAction
                        icon="payments"
                        label="Billing Overview"
                        onClick={() => navigate('/receptionist/invoices')}
                        badge={stats.pending_billings > 0 ? `${stats.pending_billings} pending` : null}
                    />
                </div>
            </div>
        </div>
    );
};

// ===== SUB-COMPONENTS =====

/**
 * Stat Card Component
 */
const StatCard = ({ 
    icon, 
    iconBg, 
    iconColor, 
    label, 
    value, 
    badge, 
    badgeColor = '#e0e3e5',
    onClick 
}) => {
    return (
        <div 
            className={`glass-panel rounded-xl p-5 hover:shadow-md transition-all cursor-${onClick ? 'pointer' : 'default'}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="flex justify-between items-start mb-3">
                <div 
                    className="p-2.5 rounded-lg"
                    style={{ background: iconBg, color: iconColor }}
                >
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
                {badge && (
                    <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: badgeColor, color: '#424752' }}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs text-[#424752] uppercase tracking-wider font-medium">{label}</p>
                <p className="text-3xl font-bold text-[#00478d] mt-1">{value}</p>
            </div>
        </div>
    );
};

/**
 * Quick Action Component
 */
const QuickAction = ({ icon, label, onClick, badge }) => {
    return (
        <button
            onClick={onClick}
            className="glass-panel rounded-lg p-4 hover:bg-white/80 transition text-center group"
        >
            <div className="flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-2xl text-[#00478d] group-hover:scale-110 transition">
                    {icon}
                </span>
            </div>
            <p className="text-sm font-medium text-[#191c1e]">{label}</p>
            {badge && (
                <span className="text-xs text-[#00478d] font-medium block mt-1">{badge}</span>
            )}
        </button>
    );
};

export default Dashboard;