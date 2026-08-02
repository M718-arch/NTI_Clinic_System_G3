import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Stethoscope, X,
    Search, Bell, RefreshCw, Check, FileText, Users, XCircle, Calendar as CalendarIcon2,
    AlertCircle, MapPin, Phone, Mail, Edit, Eye, MoreVertical, ChevronDown,
} from 'lucide-react';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

/* ------------------------------------------------------------------ */
/* CONFIG - FIXED FOR BETTER SPACING                                  */
/* ------------------------------------------------------------------ */

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 64; // Reduced for better spacing
const CARD_HEIGHT = 100; // Fixed height for cards
const CARD_GAP = 4; // Gap between cards

const STATUS_STYLES = {
    pending: { bar: '#f59e0b', tint: '#fffbeb', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    confirmed: { bar: '#3b82f6', tint: '#eff6ff', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { bar: '#22c55e', tint: '#f0fdf4', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    cancelled: { bar: '#ef4444', tint: '#fef2f2', badge: 'bg-red-100 text-red-700 border-red-200' },
};

const styleFor = (status) => STATUS_STYLES[status] || { bar: '#94a3b8', tint: '#f8fafc', badge: 'bg-slate-100 text-slate-700 border-slate-200' };

/* ------------------------------------------------------------------ */
/* DATE HELPERS                                                        */
/* ------------------------------------------------------------------ */

const toKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
};

const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
};

const parseTimeToHours = (timeStr) => {
    if (!timeStr) return START_HOUR;
    const [h, m] = timeStr.split(':');
    return parseInt(h, 10) + (parseInt(m, 10) || 0) / 60;
};

const hoursToTimeStr = (hours) => {
    const snapped = Math.round(hours * 4) / 4;
    const h = Math.floor(snapped);
    const m = Math.round((snapped - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const fmtRange = (weekDates) => {
    const start = weekDates[0];
    const end = weekDates[6];
    const opts = { month: 'short', day: 'numeric' };
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = start.toLocaleDateString('en-US', opts);
    const endStr = sameMonth
        ? end.toLocaleDateString('en-US', { day: 'numeric' })
        : end.toLocaleDateString('en-US', opts);
    return `${startStr} - ${endStr}, ${end.getFullYear()}`;
};

const formatTime12 = (time) => {
    if (!time) return 'N/A';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

const formatDateFriendly = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

/* ------------------------------------------------------------------ */
/* UI COMPONENTS                                                       */
/* ------------------------------------------------------------------ */

function IconBtn({ children, ...props }) {
    return (
        <button
            {...props}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-all"
        >
            {children}
        </button>
    );
}

function Avatar({ name, size = 36 }) {
    const initials = (name || '?')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold flex items-center justify-center shrink-0 text-xs shadow-sm"
        >
            {initials}
        </div>
    );
}

function StatCard({ label, value, tone }) {
    const tones = {
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
        yellow: 'bg-amber-50 text-amber-700 border-amber-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    const icons = {
        slate: Users,
        yellow: AlertCircle,
        blue: CalendarIcon2,
        green: Check,
    };
    const IconComp = icons[tone] || Users;
    return (
        <div className={`rounded-xl p-3 text-center border ${tones[tone] || tones.slate}`}>
            <div className="flex items-center justify-center gap-2 mb-0.5">
                <IconComp size={18} strokeWidth={2} className="opacity-70" />
                <p className="text-xl font-bold">{value}</p>
            </div>
            <p className="text-[10px] font-medium opacity-80">{label}</p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* REDESIGNED APPOINTMENT CARD - FIXED SPACING & SIZING               */
/* ------------------------------------------------------------------ */

function AppointmentCard({ booking, onClick, selected }) {
    const style = styleFor(booking.status);
    const isCompleted = booking.status === 'completed' || booking.status === 'cancelled';
    const canDrag = !isCompleted;
    const patientName = booking.patient?.name || 'Unknown Patient';
    const serviceName = booking.service?.name || 'Service';
    const duration = booking.service?.duration || 30;
    const startTime = parseTimeToHours(booking.time);
    const top = (startTime - START_HOUR) * HOUR_HEIGHT + 2;

    return (
        <div
            draggable={canDrag}
            onDragStart={(e) => {
                if (!canDrag) { e.preventDefault(); return; }
                e.dataTransfer.setData('booking', JSON.stringify(booking));
                e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onClick(booking)}
            style={{
                top: top,
                height: CARD_HEIGHT,
                borderLeft: `5px solid ${style.bar}`,
                backgroundColor: selected ? style.tint : 'white',
                opacity: isCompleted ? 0.65 : 1,
                cursor: canDrag ? 'grab' : 'default',
            }}
            className={`absolute left-2 right-2 rounded-xl shadow-sm px-3 py-2.5 flex flex-col border ${selected ? 'border-blue-400 shadow-md ring-2 ring-blue-100' : 'border-slate-200'} hover:shadow-md transition-all z-10 overflow-hidden ${!isCompleted ? 'hover:border-blue-200' : ''}`}
            title={!canDrag ? 'Completed appointments cannot be moved' : ''}
        >
            {/* Top row: Patient name and status */}
            <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar name={patientName} size={28} />
                    <span className="text-sm font-semibold text-slate-800 truncate flex-1">
                        {patientName}
                    </span>
                </div>
                <span className={`text-[8px] font-medium rounded-full px-2 py-0.5 capitalize ${style.badge} shrink-0 ml-1`}>
                    {booking.status}
                </span>
            </div>

            {/* Service name */}
            <div className="flex items-center gap-1.5 mt-0.5">
                <Stethoscope size={11} className="text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-600 truncate font-medium">{serviceName}</span>
            </div>

            {/* Time row */}
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                <Clock size={11} className="text-slate-400 shrink-0" />
                <span>{formatTime12(booking.time)}</span>
                <span className="text-slate-300">—</span>
                <span className="text-slate-500">{duration} min</span>
            </div>

            {/* Bottom: Phone if available */}
            {booking.patient?.phone && (
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400">
                    <Phone size={9} className="shrink-0" />
                    <span className="truncate">{booking.patient.phone}</span>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* WEEKLY GRID - FIXED SPACING                                        */
/* ------------------------------------------------------------------ */

function WeeklyGrid({ 
    weekDates, 
    bookingsByDay, 
    onSelect, 
    selectedId, 
    todayKey,
    onDrop,
    dropTarget,
    setDropTarget,
}) {
    const hours = useMemo(() => {
        const arr = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) arr.push(h);
        return arr;
    }, []);

    const now = new Date();
    const nowHours = now.getHours() + now.getMinutes() / 60;

    const handleDrop = (e, dateKey, hour) => {
        e.preventDefault();
        setDropTarget(null);
        const bookingData = e.dataTransfer.getData('booking');
        if (bookingData) {
            try {
                const booking = JSON.parse(bookingData);
                if (booking.status === 'completed' || booking.status === 'cancelled') {
                    alert('Cannot move completed or cancelled appointments');
                    return;
                }
                onDrop(booking, dateKey, hour);
            } catch (err) {
                console.error('Error parsing booking data:', err);
            }
        }
    };

    const handleDragOver = (e, dateKey, hour) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropTarget({ dateKey, hour });
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDropTarget(null);
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-white">
            <div className="min-w-[850px] h-full">
                {/* Header */}
                <div
                    className="grid sticky top-0 z-20 bg-white border-b border-slate-200"
                    style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
                >
                    <div />
                    {weekDates.map((d) => {
                        const key = toKey(d);
                        const isToday = key === todayKey;
                        return (
                            <div key={key} className={`flex flex-col items-center py-2.5 ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
                                <div className={`text-[10px] font-medium ${d.getDay() === 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div
                                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                        isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {d.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Grid */}
                <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                    {/* Time labels - Improved visibility */}
                    <div className="relative bg-slate-50/30">
                        {hours.map((h) => (
                            <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[11px] font-medium text-slate-400 text-right pr-3 -translate-y-2">
                                {String(h).padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    {weekDates.map((d) => {
                        const key = toKey(d);
                        const dayBookings = bookingsByDay[key] || [];
                        const isToday = key === todayKey;
                        const isDropTarget = dropTarget?.dateKey === key;
                        
                        // Calculate card positions with proper spacing
                        const cardPositions = [];
                        let currentTop = 0;
                        dayBookings.forEach((booking) => {
                            const startHour = parseTimeToHours(booking.time);
                            const topPos = (startHour - START_HOUR) * HOUR_HEIGHT + 2;
                            cardPositions.push({ booking, top: topPos });
                        });

                        return (
                            <div 
                                key={key} 
                                className={`relative border-l border-slate-200 ${isToday ? 'bg-blue-50/20' : ''} ${isDropTarget ? 'bg-blue-50' : ''}`}
                            >
                                {/* Grid lines - Improved visibility */}
                                {hours.map((h) => (
                                    <div
                                        key={h}
                                        style={{ height: HOUR_HEIGHT }}
                                        className={`border-b ${h === 12 ? 'border-slate-300' : 'border-slate-100'}`}
                                        onDragOver={(e) => handleDragOver(e, key, h)}
                                        onDrop={(e) => handleDrop(e, key, h)}
                                        onDragLeave={handleDragLeave}
                                    />
                                ))}
                                
                                {/* Appointments */}
                                {dayBookings.map((b) => (
                                    <AppointmentCard 
                                        key={b.id} 
                                        booking={b} 
                                        onClick={onSelect} 
                                        selected={selectedId === b.id}
                                    />
                                ))}
                                
                                {/* Today indicator */}
                                {isToday && nowHours >= START_HOUR && nowHours <= END_HOUR && (
                                    <div
                                        className="absolute left-0 right-0 border-t-2 border-blue-400 z-10"
                                        style={{ top: (nowHours - START_HOUR) * HOUR_HEIGHT }}
                                    >
                                        <span className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* APPOINTMENT DETAIL PANEL                                           */
/* ------------------------------------------------------------------ */

function AppointmentDetail({ booking, onClose, onAccept, onComplete, onCancel, busy }) {
    const style = styleFor(booking.status);
    const isCompleted = booking.status === 'completed' || booking.status === 'cancelled';
    const isPending = booking.status === 'pending';
    const isConfirmed = booking.status === 'confirmed';

    const patientName = booking.patient?.name || 'Unknown Patient';
    const patientEmail = booking.patient?.email || '';
    const patientPhone = booking.patient?.phone || '';

    return (
        <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-12 border-b border-slate-100 shrink-0">
                <span className="text-sm font-semibold text-slate-700">Appointment Details</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
                    <X size={20} strokeWidth={2} />
                </button>
            </div>

            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar name={patientName} size={40} />
                    <div>
                        <div className="font-semibold text-slate-800 text-sm">
                            {patientName}
                        </div>
                        {patientEmail && <div className="text-xs text-slate-500">{patientEmail}</div>}
                        {patientPhone && <div className="text-xs text-slate-500">{patientPhone}</div>}
                    </div>
                </div>
                <span className={`text-[10px] font-medium capitalize px-2.5 py-1 rounded-full border ${style.badge}`}>
                    {booking.status}
                </span>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Stethoscope size={20} strokeWidth={2} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Service</p>
                        <h3 className="text-base font-bold text-slate-800 mt-0.5">
                            {booking.service?.name || 'Service'}
                        </h3>
                        {booking.service?.duration && (
                            <p className="text-xs text-slate-500">{booking.service.duration} minutes</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <CalendarIcon2 size={16} strokeWidth={2} className="text-slate-500" />
                            <div>
                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Date</p>
                                <p className="text-sm font-semibold text-slate-700">{formatDateFriendly(booking.date)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <Clock size={16} strokeWidth={2} className="text-slate-500" />
                            <div>
                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Time</p>
                                <p className="text-sm font-semibold text-slate-700">{formatTime12(booking.time)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {booking.notes && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <FileText size={16} strokeWidth={2} className="text-slate-500" />
                            <div className="flex-1">
                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Notes</p>
                                <p className="text-sm text-slate-600">{booking.notes}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {isPending && (
                        <>
                            <button
                                disabled={busy}
                                onClick={() => onAccept(booking)}
                                className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 px-4 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                            >
                                <Check size={16} strokeWidth={2.5} /> Accept
                            </button>
                            <button
                                disabled={busy}
                                onClick={() => onCancel(booking)}
                                className="flex items-center gap-1.5 text-xs font-medium text-white bg-red-600 px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
                            >
                                <XCircle size={16} strokeWidth={2.5} /> Cancel
                            </button>
                        </>
                    )}
                    {isConfirmed && (
                        <>
                            <button
                                disabled={busy}
                                onClick={() => onComplete(booking)}
                                className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
                            >
                                <Check size={16} strokeWidth={2.5} /> Complete
                            </button>
                            <button
                                disabled={busy}
                                onClick={() => onCancel(booking)}
                                className="flex items-center gap-1.5 text-xs font-medium text-white bg-red-600 px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
                            >
                                <XCircle size={16} strokeWidth={2.5} /> Cancel
                            </button>
                        </>
                    )}
                    {isCompleted && (
                        <div className="text-xs text-slate-500 bg-slate-100 px-4 py-1.5 rounded-lg">
                            This appointment is <span className="font-semibold capitalize">{booking.status}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* REQUEST APPROVAL PANEL                                              */
/* ------------------------------------------------------------------ */

function RequestApproval({ pending, onClose, onAccept, busy }) {
    const grouped = useMemo(() => {
        return pending.reduce((acc, b) => {
            (acc[b.date] = acc[b.date] || []).push(b);
            return acc;
        }, {});
    }, [pending]);

    return (
        <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-12 border-b border-slate-100 shrink-0">
                <span className="text-sm font-semibold text-slate-700">Request Approval</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
                    <X size={20} strokeWidth={2} />
                </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4">
                {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">🎉</div>
                        <p className="text-slate-600 font-medium">No pending requests</p>
                    </div>
                )}
                {Object.entries(grouped).map(([date, items]) => (
                    <div key={date} className="mb-4">
                        <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">{formatDateFriendly(date)}</div>
                        <div className="space-y-2">
                            {items.map((b) => {
                                const patientName = b.patient?.name || 'Unknown Patient';
                                return (
                                    <div key={b.id} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 hover:bg-slate-100 transition border border-slate-100">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar name={patientName} size={28} />
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-800 truncate">{patientName}</div>
                                                <div className="text-[10px] text-slate-500 truncate">{b.service?.name || 'Service'}</div>
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-[10px] text-slate-400 w-16 shrink-0 font-medium">{formatTime12(b.time)}</div>
                                        <button
                                            disabled={busy}
                                            onClick={() => onAccept(b)}
                                            className="text-xs font-medium text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm shrink-0"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

const Calendar = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [search, setSearch] = useState('');
    const [panel, setPanel] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchBookings();
    }, [refreshKey]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/doctor/bookings');
            console.log('Bookings response:', response.data);
            setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError('Failed to load appointments. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleDrop = async (booking, dateKey, hour) => {
        setDropTarget(null);
        
        const newTime = hoursToTimeStr(hour);
        const sameSlot = booking.date === dateKey && booking.time === newTime;
        if (sameSlot) return;

        try {
            setBusy(true);
            await api.put(`/doctor/bookings/${booking.id}`, {
                date: dateKey,
                time: newTime,
                notes: booking.notes
            });
            await fetchBookings();
        } catch (error) {
            console.error('Error moving booking:', error);
            alert('Failed to move booking: ' + (error.response?.data?.message || error.message));
        } finally {
            setBusy(false);
        }
    };

    const handleAccept = async (booking) => {
        try {
            setBusy(true);
            await api.patch(`/doctor/bookings/${booking.id}/accept`);
            setPanel(null);
            setSelectedBooking(null);
            refreshData();
        } catch (error) {
            console.error('Error accepting booking:', error);
            alert('Failed to accept booking');
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = async (booking) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        
        try {
            setBusy(true);
            await api.patch(`/doctor/bookings/${booking.id}/cancel`);
            setPanel(null);
            setSelectedBooking(null);
            refreshData();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking');
        } finally {
            setBusy(false);
        }
    };

    const handleComplete = async (booking) => {
        try {
            setBusy(true);
            await api.patch(`/doctor/bookings/${booking.id}/status`, { status: 'completed' });
            setPanel(null);
            setSelectedBooking(null);
            refreshData();
        } catch (error) {
            console.error('Error completing booking:', error);
            alert('Failed to complete booking');
        } finally {
            setBusy(false);
        }
    };

    const weekDates = useMemo(() => {
        const monday = getMonday(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    }, [currentDate]);

    const filteredBookings = useMemo(() => {
        if (!search.trim()) return bookings;
        const q = search.toLowerCase();
        return bookings.filter(
            (b) =>
                (b.patient?.name || '').toLowerCase().includes(q) ||
                (b.service?.name || '').toLowerCase().includes(q)
        );
    }, [bookings, search]);

    const bookingsByDay = useMemo(() => {
        return filteredBookings.reduce((acc, b) => {
            (acc[b.date] = acc[b.date] || []).push(b);
            return acc;
        }, {});
    }, [filteredBookings]);

    const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending'), [bookings]);

    const changeWeek = (increment) => setCurrentDate(addDays(currentDate, increment * 7));
    const goToToday = () => setCurrentDate(new Date());

    const openDetail = (booking) => {
        setSelectedBooking(booking);
        setPanel('detail');
    };
    const closePanel = () => {
        setPanel(null);
        setSelectedBooking(null);
    };

    const todayKey = toKey(new Date());

    const statCards = [
        { label: 'Total', value: bookings.length, tone: 'slate' },
        { label: 'Pending', value: pendingBookings.length, tone: 'yellow' },
        { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, tone: 'blue' },
        { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, tone: 'green' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm">Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full w-full bg-slate-50">
                <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="text-4xl mb-3">😕</div>
                    <p className="text-slate-700 font-medium">{error}</p>
                    <button 
                        onClick={refreshData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-slate-50">
            {/* Header */}
            <div className="px-5 pt-4 pb-2 shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Calendar</h2>
                        <p className="text-xs text-slate-500">
                            {user?.name ? `Welcome back, ${user.name}` : 'Manage your appointments'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 hidden md:block">
                            {bookings.length} appointments this week
                        </span>
                        <button 
                            onClick={refreshData} 
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                            title="Refresh"
                        >
                            <RefreshCw size={16} strokeWidth={2} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 flex min-h-0 px-5 pb-5 w-full">
                <div className="flex-1 flex flex-col rounded-xl border border-slate-200 shadow-sm bg-white w-full">
                    <div className="flex flex-1 min-h-0 w-full">
                        {/* Calendar - Left side */}
                        <div className="flex flex-col flex-1 min-w-0 min-h-0">
                            {/* Top bar */}
                            <div className="flex items-center justify-between px-4 h-11 border-b border-slate-200 gap-2 shrink-0 bg-white">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={18} strokeWidth={2} className="text-blue-600" />
                                    <span className="text-xs font-semibold text-slate-700">Weekly</span>
                                </div>

                                <div className="flex items-center gap-0.5">
                                    <button 
                                        onClick={() => changeWeek(-1)} 
                                        className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                                    >
                                        <ChevronLeft size={18} strokeWidth={2} className="text-slate-500" />
                                    </button>
                                    <button 
                                        onClick={goToToday} 
                                        className="text-[10px] font-medium text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                                    >
                                        {fmtRange(weekDates)}
                                    </button>
                                    <button 
                                        onClick={() => changeWeek(1)} 
                                        className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                                    >
                                        <ChevronRight size={18} strokeWidth={2} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <div className="relative hidden md:block">
                                        <Search size={14} strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search..."
                                            className="pl-8 pr-2 py-1.5 text-[10px] rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 w-36 transition-all focus:w-48"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setPanel('approval')}
                                        className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        <Users size={16} strokeWidth={2} />
                                        {pendingBookings.length > 0 && (
                                            <span className="bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {pendingBookings.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Weekly Grid */}
                            <div className="flex-1 min-h-0">
                                <WeeklyGrid
                                    weekDates={weekDates}
                                    bookingsByDay={bookingsByDay}
                                    onSelect={openDetail}
                                    selectedId={selectedBooking?.id}
                                    todayKey={todayKey}
                                    onDrop={handleDrop}
                                    dropTarget={dropTarget}
                                    setDropTarget={setDropTarget}
                                />
                            </div>

                            {/* Legend - Moved to bottom */}
                            <div className="px-4 py-1.5 border-t border-slate-200 flex flex-wrap items-center gap-3 text-[9px] bg-white shrink-0">
                                <span className="text-slate-500 font-medium">Status:</span>
                                {Object.entries(STATUS_STYLES).map(([status, s]) => (
                                    <span key={status} className="flex items-center gap-1.5 capitalize text-slate-600">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.bar }} />
                                        {status}
                                    </span>
                                ))}
                                {bookings.length === 0 && (
                                    <span className="text-slate-400 ml-2">No appointments scheduled</span>
                                )}
                            </div>
                        </div>

                        {/* Right Panel */}
                        {panel && (
                            <div className="w-[380px] flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
                                {panel === 'detail' && selectedBooking && (
                                    <AppointmentDetail
                                        booking={selectedBooking}
                                        onClose={closePanel}
                                        onAccept={handleAccept}
                                        onComplete={handleComplete}
                                        onCancel={handleCancel}
                                        busy={busy}
                                    />
                                )}
                                {panel === 'approval' && (
                                    <RequestApproval
                                        pending={pendingBookings}
                                        onClose={closePanel}
                                        onAccept={handleAccept}
                                        busy={busy}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;