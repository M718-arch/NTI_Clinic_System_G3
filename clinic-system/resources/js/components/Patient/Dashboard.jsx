import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import PatientEmr from './PatientEmr';
import NotificationBell from './NotificationBell';

// ---------------------------------------------------------------------------
// Clinical Clarity Glass — tokens copied 1:1 from the reference mockup
// (code.html): same blur radii, opacities, and hex values, not approximations.
// ---------------------------------------------------------------------------
const glassPanel = 'bg-white/60 backdrop-blur-[16px] border border-white/80';
const glassPanelLow = 'bg-white/40 backdrop-blur-[4px] border border-white/40'; // Low elevation, per DESIGN.md
const ambientShadow = 'shadow-[0_8px_32px_0_rgba(0,86,179,0.05)]';
const glassButtonPrimary = 'bg-[rgba(0,86,179,0.9)] backdrop-blur-[8px] border border-white/20 shadow-[0_4px_15px_rgba(0,86,179,0.3)] hover:bg-[#0056b3] text-white';
const glassButtonSecondary = 'border border-[#003f87]/30 bg-white/40 backdrop-blur-sm text-[#003f87] hover:bg-white/80';

const MIcon = ({ name, filled = false, className = '' }) => (
    <span
        className={`material-symbols-outlined select-none ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
        {name}
    </span>
);

// Status → design-system color, matching how the mockup actually uses its
// palette (secondary/teal for a positive "Confirmed" badge, not primary blue
// — primary is reserved for brand/CTA elements there).
const STATUS_STYLE = {
    pending: { text: 'text-[#39434d]', bg: 'bg-[#39434d]/10', border: 'border-[#39434d]/25', dot: 'bg-[#39434d]' },
    confirmed: { text: 'text-[#006b5f]', bg: 'bg-[#006b5f]/10', border: 'border-[#006b5f]/25', dot: 'bg-[#006b5f]' },
    completed: { text: 'text-[#003f87]', bg: 'bg-[#003f87]/10', border: 'border-[#003f87]/25', dot: 'bg-[#003f87]' },
    cancelled: { text: 'text-[#ba1a1a]', bg: 'bg-[#ba1a1a]/10', border: 'border-[#ba1a1a]/25', dot: 'bg-[#ba1a1a]' },
};
const statusStyle = (status) => STATUS_STYLE[status] || { text: 'text-[#424752]', bg: 'bg-[#424752]/10', border: 'border-[#424752]/20', dot: 'bg-[#424752]' };
const statusIcon = (status) => ({ pending: 'schedule', confirmed: 'check_circle', completed: 'check_circle', cancelled: 'cancel' }[status] || 'help');

const PatientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
        upcoming: [], recent_activity: []
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
            const upcomingResponse = await api.get('/patient/appointments/upcoming');
            const activityResponse = await api.get('/patient/recent-activity');

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

    // The API nests the doctor under `service.doctor` (same shape used in
    // PatientBookings.jsx: `booking.service?.doctor?.name`), not as a
    // top-level `appointment.doctor`. Fall back to a top-level `doctor`
    // field too, in case a different endpoint ever returns it flattened.
    const getDoctorName = (appointment) => appointment?.service?.doctor?.name || appointment?.doctor?.name || null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[500px]">
                <div className="w-12 h-12 border-4 border-[#0056b3] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#424752]">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] p-6">
                <div className="text-center max-w-md">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${glassPanel}`}>
                        <MIcon name="cancel" className="text-[32px] text-[#ba1a1a]" />
                    </div>
                    <p className="text-[#121c28] font-medium">{error}</p>
                    <button onClick={fetchDashboardData} className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${glassButtonPrimary}`}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const nextAppointment = stats.upcoming?.[0];
    const restUpcoming = stats.upcoming?.slice(1, 4) || [];

    return (
        <div className="space-y-10 pb-10">
            {/* Welcome Section — exact type scale from the mockup: 48px/56px, -0.02em, weight 700 */}
            <section>
                <h2 className="text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-[#121c28] mb-2 drop-shadow-sm">
                    Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
                </h2>
                <p className="text-[18px] leading-[28px] text-[#424752]">Here is an overview of your health portal today.</p>
            </section>

            {/* Quick glance stats — a strip of low-elevation glass tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: 'event_note', color: '#003f87' },
                    { label: 'Pending', value: stats.pending, icon: 'schedule', color: '#39434d' },
                    { label: 'Confirmed', value: stats.confirmed, icon: 'check_circle', color: '#006b5f' },
                    { label: 'Completed', value: stats.completed, icon: 'task_alt', color: '#003f87' },
                ].map((tile) => (
                    <div key={tile.label} className={`rounded-2xl p-4 flex items-center gap-3 ${glassPanelLow}`}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${tile.color}1A` }}>
                            <MIcon name={tile.icon} className="text-[20px]" style={{ color: tile.color }} />
                        </div>
                        <div>
                            <p className="text-[24px] leading-[32px] font-semibold text-[#121c28]">{tile.value || 0}</p>
                            <p className="text-xs text-[#424752]">{tile.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Wider on Desktop) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Next / Upcoming Appointment Card */}
                    {nextAppointment ? (
                        <div className={`rounded-2xl p-6 relative overflow-hidden group hover:border-white transition-colors duration-300 ${glassPanel} ${ambientShadow}`}>
                            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#003f87]/20 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-white/60 border border-white flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md">
                                        <MIcon name="medical_services" filled className="text-[28px] text-[#003f87]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-2 h-2 rounded-full ${statusStyle(nextAppointment.status).dot}`}></span>
                                            <span className={`text-xs font-medium uppercase tracking-wider ${statusStyle(nextAppointment.status).text}`}>
                                                {nextAppointment.status || 'Scheduled'}
                                            </span>
                                        </div>
                                        <h3 className="text-[24px] leading-[32px] font-semibold text-[#121c28] mb-1">
                                            {nextAppointment.service?.name || nextAppointment.service || 'Appointment'}
                                        </h3>
                                        <p className="text-[16px] text-[#424752] flex items-center gap-1">
                                            <MIcon name="person" className="text-base" />
                                            {getDoctorName(nextAppointment) ? `Dr. ${getDoctorName(nextAppointment)}` : 'Doctor not assigned'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/50 border border-white/80 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px] self-stretch md:self-auto flex flex-col justify-center shadow-sm">
                                    <span className="text-xs font-medium text-[#424752] uppercase tracking-wider">{formatDate(nextAppointment.date)}</span>
                                    <span className="text-[24px] leading-[32px] font-semibold text-[#003f87] mt-1">{formatTime(nextAppointment.time)}</span>
                                </div>
                            </div>
                            <div className="relative z-10 mt-6 pt-4 border-t border-white/50 flex justify-end gap-3">
                                <Link to="/patient/my-bookings" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${glassButtonSecondary}`}>
                                    Reschedule
                                </Link>
                                <Link to="/patient/my-bookings" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${glassButtonPrimary}`}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className={`rounded-2xl p-6 text-center ${glassPanel} ${ambientShadow}`}>
                            <MIcon name="event_available" className="text-[32px] text-[#003f87] mb-2" />
                            <p className="text-[#121c28] font-medium">No upcoming appointments</p>
                            <p className="text-sm text-[#424752] mt-1 mb-4">Book a service to see it here.</p>
                            <Link to="/patient/services" className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${glassButtonPrimary}`}>
                                Browse Services
                            </Link>
                        </div>
                    )}

                    {/* Remaining upcoming appointments, compact list */}
                    {restUpcoming.length > 0 && (
                        <div className={`rounded-2xl overflow-hidden ${glassPanel} ${ambientShadow}`}>
                            <div className="px-6 py-4 border-b border-white/50 flex items-center justify-between">
                                <h3 className="text-[16px] font-semibold text-[#121c28]">Also Coming Up</h3>
                                <Link to="/patient/my-bookings" className="text-sm text-[#003f87] hover:underline font-medium flex items-center gap-1">
                                    View all <MIcon name="chevron_right" className="text-[16px]" />
                                </Link>
                            </div>
                            <div className="divide-y divide-white/50">
                                {restUpcoming.map((appt, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-white/40 transition">
                                        <div>
                                            <p className="text-sm font-medium text-[#121c28]">{appt.service?.name || appt.service || 'Service'}</p>
                                            <p className="text-xs text-[#424752]">{formatDate(appt.date)} • {formatTime(appt.time)}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle(appt.status).bg} ${statusStyle(appt.status).text} ${statusStyle(appt.status).border}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions Grid */}
                    <div>
                        <h3 className="text-[18px] leading-[28px] text-[#121c28] font-semibold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link to="/patient/services" className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square hover:bg-white/80 transition-all group ${glassPanel} ${ambientShadow}`}>
                                <div className="w-12 h-12 rounded-full bg-[#003f87]/10 border border-[#003f87]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MIcon name="calendar_add_on" className="text-[#003f87]" />
                                </div>
                                <span className="text-sm font-medium text-[#121c28] text-center leading-tight">Book<br />Appointment</span>
                            </Link>
                            <Link to="/patient/messages" className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square hover:bg-white/80 transition-all group ${glassPanel} ${ambientShadow}`}>
                                <div className="w-12 h-12 rounded-full bg-[#6df5e1]/30 border border-[#6df5e1]/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MIcon name="chat" className="text-[#006b5f]" />
                                </div>
                                <span className="text-sm font-medium text-[#121c28] text-center leading-tight">Message<br />Doctor</span>
                            </Link>
                            <Link to="/patient/my-bookings" className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square hover:bg-white/80 transition-all group ${glassPanel} ${ambientShadow}`}>
                                <div className="w-12 h-12 rounded-full bg-[#505a65]/20 border border-[#505a65]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MIcon name="folder_open" className="text-[#39434d]" />
                                </div>
                                <span className="text-sm font-medium text-[#121c28] text-center leading-tight">My<br />Bookings</span>
                            </Link>
                            <Link to="/patient/profile" className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square hover:bg-white/80 transition-all group ${glassPanel} ${ambientShadow}`}>
                                <div className="w-12 h-12 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MIcon name="person" className="text-[#ba1a1a]" />
                                </div>
                                <span className="text-sm font-medium text-[#121c28] text-center leading-tight">My<br />Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column (Activity Feed) */}
                <div className="lg:col-span-1">
                    <div className={`rounded-2xl p-6 h-full flex flex-col ${glassPanel} ${ambientShadow}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[18px] leading-[28px] text-[#121c28] font-semibold">Recent Activity</h3>
                        </div>
                        {stats.recent_activity && stats.recent_activity.length > 0 ? (
                            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                {stats.recent_activity.slice(0, 5).map((activity, index) => {
                                    const s = statusStyle(activity.status);
                                    return (
                                        <div key={index} className="flex gap-3 pb-4 border-b border-white/50 last:border-0">
                                            <div className={`w-10 h-10 rounded-full ${s.bg} border ${s.border} backdrop-blur-sm flex items-center justify-center shrink-0 mt-1`}>
                                                <MIcon name={statusIcon(activity.status)} className={`text-[18px] ${s.text}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-[#121c28] font-medium">{activity.action}</p>
                                                {activity.status && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
                                                        {activity.status}
                                                    </span>
                                                )}
                                                <p className="text-xs text-[#727784] mt-1">{formatDate(activity.date)}{activity.time ? ` at ${activity.time}` : ''}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                <MIcon name="history" className="text-[32px] text-[#727784] mb-2" />
                                <p className="text-sm text-[#424752]">No recent activity yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Help Section — Low Elevation per DESIGN.md */}
            <div className={`rounded-2xl p-6 ${glassPanelLow}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#003f87]/10 rounded-full flex items-center justify-center">
                            <MIcon name="help" className="text-[#003f87]" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#121c28]">Need help?</h4>
                            <p className="text-sm text-[#424752]">Contact our support team for assistance with bookings or services.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <a href="#" className={`px-4 py-2 rounded-lg text-sm font-medium ${glassButtonSecondary}`}>Help Center</a>
                        <a href="#" className={`px-4 py-2 rounded-lg text-sm font-medium ${glassButtonPrimary}`}>Contact Us</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;