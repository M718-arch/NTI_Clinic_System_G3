import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

/* ------------------------------------------------------------------ */
/* CLINICAL CLARITY GLASS — Glacier (dark) variant                    */
/* Tokens copied 1:1 from the reference mockup, not approximated.     */
/* ------------------------------------------------------------------ */

const COLOR = {
    bg: '#0a0e1a',
    onBg: '#e0e8f0',
    surfaceContainer: '#141c2e',
    surfaceContainerLow: '#111828',
    onSurfaceVariant: '#a0b4c4',
    outline: '#4a6070',
    primary: '#7dd3fc',
    onPrimary: '#001f2e',
};

const pageBg = {
    backgroundColor: COLOR.bg,
    backgroundImage:
        'radial-gradient(circle at 15% 20%, rgba(125,211,252,0.12), transparent 42%),' +
        'radial-gradient(circle at 85% 10%, rgba(200,160,240,0.10), transparent 42%),' +
        'radial-gradient(circle at 50% 100%, rgba(125,211,252,0.07), transparent 48%)',
};

const glassPanel = 'bg-[rgba(20,28,46,0.55)] backdrop-blur-[20px] border border-[rgba(125,211,252,0.18)] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_0_44px_-18px_rgba(125,211,252,0.25)]';
const glassPanelElevated = 'bg-[rgba(20,28,46,0.72)] backdrop-blur-[28px] border border-[rgba(125,211,252,0.24)] shadow-[0_12px_44px_-6px_rgba(0,0,0,0.55),0_0_60px_-14px_rgba(125,211,252,0.3)]';
const glassInput = 'bg-[rgba(20,28,46,0.5)] border border-[rgba(125,211,252,0.16)] backdrop-blur-[10px] focus:border-[rgba(125,211,252,0.6)] focus:shadow-[0_0_20px_rgba(125,211,252,0.25)] focus:outline-none transition-all';
const btnGlass = 'bg-[rgba(125,211,252,0.14)] border border-[rgba(125,211,252,0.28)] backdrop-blur-[6px] hover:bg-[rgba(125,211,252,0.24)] hover:border-[rgba(125,211,252,0.55)] hover:shadow-[0_0_22px_-4px_rgba(125,211,252,0.35)] transition-all';
const calBorderRight = 'border-r border-[rgba(125,211,252,0.08)]';

// Material Symbols Outlined — the mockup's icon set, not Lucide.
const MIcon = ({ name, filled = false, className = '' }) => (
    <span
        className={`material-symbols-outlined select-none ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
        {name}
    </span>
);

// Loads Inter + Material Symbols once, since this page has no shared <head> to edit.
const useGlassFonts = () => {
    useEffect(() => {
        if (document.getElementById('glass-fonts')) return;
        const link = document.createElement('link');
        link.id = 'glass-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
        document.head.appendChild(link);
    }, []);
};

/* ------------------------------------------------------------------ */
/* CONFIG - FIXED FOR BETTER SPACING                                  */
/* ------------------------------------------------------------------ */

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 80; // More breathing room per hour slot
const CARD_HEIGHT = 116; // Fixed height for cards
const CARD_GAP = 4; // Gap between cards

const STATUS_STYLES = {
    pending: { bar: '#f59e0b', tint: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.35)', text: 'text-amber-300', badge: 'bg-amber-500/10 text-[#f59e0b] border-amber-500/20', glow: 'rgba(245,158,11,0.3)' },
    confirmed: { bar: '#3b82f6', tint: 'rgba(59,130,246,0.14)', border: 'rgba(59,130,246,0.35)', text: 'text-blue-300', badge: 'bg-blue-500/10 text-[#3b82f6] border-blue-500/20', glow: 'rgba(59,130,246,0.3)' },
    completed: { bar: '#10b981', tint: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.35)', text: 'text-emerald-300', badge: 'bg-emerald-500/10 text-[#10b981] border-emerald-500/20', glow: 'rgba(16,185,129,0.3)' },
    cancelled: { bar: '#ff6b6b', tint: 'rgba(255,107,107,0.14)', border: 'rgba(255,107,107,0.35)', text: 'text-red-300', badge: 'bg-[#ff6b6b]/10 text-[#ff6b6b] border-[#ff6b6b]/20', glow: 'rgba(255,107,107,0.3)' },
};

const styleFor = (status) => STATUS_STYLES[status] || { bar: '#94a3b8', tint: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', text: 'text-slate-300', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20', glow: 'rgba(148,163,184,0.25)' };

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
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-[#a0b4c4] hover:text-[#e0e8f0] disabled:opacity-50 transition-all ${btnGlass}`}
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
            style={{ width: size, height: size, background: 'linear-gradient(135deg, #7dd3fc 0%, #c8a0f0 100%)' }}
            className="rounded-full text-[#001f2e] font-semibold flex items-center justify-center shrink-0 text-xs shadow-sm"
        >
            {initials}
        </div>
    );
}

function StatCard({ label, value, tone }) {
    const tones = {
        slate: { text: 'text-[#e0e8f0]', icon: 'text-[#a0b4c4]', chip: 'bg-white/[0.07]', hover: 'hover:shadow-[0_0_36px_-10px_rgba(160,180,196,0.35)]' },
        yellow: { text: 'text-[#f59e0b]', icon: 'text-[#f59e0b]', chip: 'bg-[#f59e0b]/15', hover: 'hover:shadow-[0_0_36px_-10px_rgba(245,158,11,0.45)]' },
        blue: { text: 'text-[#3b82f6]', icon: 'text-[#3b82f6]', chip: 'bg-[#3b82f6]/15', hover: 'hover:shadow-[0_0_36px_-10px_rgba(59,130,246,0.45)]' },
        green: { text: 'text-[#10b981]', icon: 'text-[#10b981]', chip: 'bg-[#10b981]/15', hover: 'hover:shadow-[0_0_36px_-10px_rgba(16,185,129,0.45)]' },
    };
    const icons = { slate: 'calendar_month', yellow: 'hourglass_empty', blue: 'event_available', green: 'task_alt' };
    const t = tones[tone] || tones.slate;
    return (
        <div className={`rounded-2xl p-5 flex flex-col justify-between hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${glassPanel} ${t.hover}`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[#a0b4c4] text-xs font-medium tracking-wide">{label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.chip}`}>
                    <MIcon name={icons[tone] || 'calendar_month'} className={`text-[18px] ${t.icon}`} />
                </div>
            </div>
            <div className={`text-[32px] leading-[38px] tracking-[-0.02em] font-bold ${t.text}`}>{value}</div>
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
                borderLeft: `4px solid ${style.bar}`,
                backgroundColor: style.tint,
                borderTop: `1px solid ${selected ? COLOR.primary : style.border}`,
                borderRight: `1px solid ${selected ? COLOR.primary : style.border}`,
                borderBottom: `1px solid ${selected ? COLOR.primary : style.border}`,
                opacity: isCompleted ? 0.65 : 1,
                cursor: canDrag ? 'grab' : 'default',
                boxShadow: selected
                    ? `0 0 0 2px ${COLOR.primary}80, 0 10px 28px -8px ${style.glow}`
                    : `0 6px 20px -8px ${style.glow}`,
            }}
            className={`absolute left-2 right-2 rounded-xl backdrop-blur-sm px-3.5 py-3 flex flex-col ${selected ? 'ring-2 ring-[#7dd3fc]/40' : ''} hover:brightness-110 hover:-translate-y-0.5 transition-all duration-150 z-10 overflow-hidden`}
            title={!canDrag ? 'Completed appointments cannot be moved' : ''}
        >
            {/* Top row: Patient name and status */}
            <div className="flex items-center gap-2 min-w-0" title={`${patientName} — ${booking.status}`}>
                <Avatar name={patientName} size={28} />
                <span className="text-sm font-semibold text-[#e0e8f0] truncate min-w-0 flex-1">
                    {patientName}
                </span>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.bar }} title={booking.status} />
            </div>

            {/* Service name */}
            <div className="flex items-center gap-1.5 mt-0.5">
                <MIcon name="stethoscope" className="text-[13px] text-[#a0b4c4] shrink-0" />
                <span className="text-[11px] text-[#a0b4c4] truncate font-medium">{serviceName}</span>
            </div>

            {/* Time row */}
            <div className={`flex items-center gap-2 mt-1 text-[10px] ${style.text}`}>
                <MIcon name="schedule" className="text-[13px] shrink-0" />
                <span>{formatTime12(booking.time)}</span>
                <span className="opacity-50">—</span>
                <span className="opacity-90">{duration} min</span>
            </div>

            {/* Bottom: Phone if available */}
            {booking.patient?.phone && (
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#a0b4c4]/70">
                    <MIcon name="call" className="text-[11px] shrink-0" />
                    <span className="truncate">{booking.patient.phone}</span>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* DAY COLUMN - owns its own drag-enter/leave counter so hovering over */
/* an appointment card inside the column (which also fires enter/leave */
/* on the column) never flickers the drop-target highlight off.        */
/* ------------------------------------------------------------------ */

function DayColumn({ dateKey, hours, dayBookings, isToday, isWeekend, onSelect, selectedId, nowHours, onCellDragOver, onCellDrop, isDropTarget, onColumnDragEnter, onColumnDragLeave }) {
    // Counts nested dragenter/dragleave pairs for this column. HTML5 drag
    // events bubble, so moving from the column onto a child card fires
    // leave-then-enter on the column too; a naive boolean flips off/on
    // on every child boundary crossing (the "flicker"). A depth counter
    // only reaches 0 — the true "left the whole column" state — when
    // every nested enter has been matched by a leave.
    const depthRef = useRef(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        depthRef.current += 1;
        onColumnDragEnter(dateKey);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        depthRef.current -= 1;
        if (depthRef.current <= 0) {
            depthRef.current = 0;
            onColumnDragLeave(dateKey);
        }
    };

    const handleDrop = (e) => {
        depthRef.current = 0;
    };

    return (
        <div
            className={`relative ${calBorderRight} ${isToday ? 'bg-[#7dd3fc]/5' : ''} ${isWeekend ? 'bg-[#111828]/30' : ''} ${isDropTarget ? 'bg-[#7dd3fc]/10 shadow-[inset_0_0_0_2px_rgba(125,211,252,0.3)]' : ''} transition-all`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {hours.map((h) => (
                <div
                    key={h}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-[rgba(125,211,252,0.05)]"
                    onDragOver={(e) => onCellDragOver(e, dateKey, h)}
                    onDrop={(e) => onCellDrop(e, dateKey, h)}
                />
            ))}

            {dayBookings.map((b) => (
                <AppointmentCard
                    key={b.id}
                    booking={b}
                    onClick={onSelect}
                    selected={selectedId === b.id}
                />
            ))}

            {isToday && nowHours >= START_HOUR && nowHours <= END_HOUR && (
                <div
                    className="absolute left-0 right-0 border-t border-[#7dd3fc] z-10"
                    style={{ top: (nowHours - START_HOUR) * HOUR_HEIGHT }}
                >
                    <span className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#7dd3fc] shadow-[0_0_8px_#7dd3fc]" />
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

    const handleColumnDragEnter = (dateKey) => {
        setDropTarget((prev) => (prev?.dateKey === dateKey ? prev : { dateKey, hour: prev?.hour }));
    };

    const handleColumnDragLeave = (dateKey) => {
        setDropTarget((prev) => (prev?.dateKey === dateKey ? null : prev));
    };

    return (
        <div
            className="flex-1 overflow-auto"
            style={{ backgroundImage: 'linear-gradient(rgba(125,211,252,0.05) 1px, transparent 1px)', backgroundSize: `100% ${HOUR_HEIGHT}px` }}
        >
            <div className="min-w-[850px] h-full">
                {/* Header */}
                <div
                    className="grid sticky top-0 z-20 border-b border-[rgba(125,211,252,0.1)] bg-[rgba(15,21,36,0.85)] backdrop-blur-md"
                    style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
                >
                    <div />
                    {weekDates.map((d) => {
                        const key = toKey(d);
                        const isToday = key === todayKey;
                        return (
                            <div key={key} className={`flex flex-col items-center py-2.5 ${calBorderRight} ${isToday ? 'bg-[#7dd3fc]/5' : ''}`}>
                                <div className={`text-[10px] font-medium ${d.getDay() === 0 ? 'text-[#ff6b6b]/70' : 'text-[#a0b4c4]'}`}>
                                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div
                                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                        isToday ? 'bg-[#7dd3fc] text-[#001f2e] shadow-[0_0_8px_rgba(125,211,252,0.5)]' : 'text-[#e0e8f0] hover:bg-white/10'
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
                    {/* Time labels */}
                    <div className={`relative ${calBorderRight}`}>
                        {hours.map((h) => (
                            <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[11px] font-medium text-[#a0b4c4] text-right pr-3 -translate-y-2">
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
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                        return (
                            <DayColumn
                                key={key}
                                dateKey={key}
                                hours={hours}
                                dayBookings={dayBookings}
                                isToday={isToday}
                                isWeekend={isWeekend}
                                onSelect={onSelect}
                                selectedId={selectedId}
                                nowHours={nowHours}
                                onCellDragOver={handleDragOver}
                                onCellDrop={handleDrop}
                                isDropTarget={isDropTarget}
                                onColumnDragEnter={handleColumnDragEnter}
                                onColumnDragLeave={handleColumnDragLeave}
                            />
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
        <div className={`w-full h-full flex flex-col overflow-y-auto ${glassPanelElevated}`}>
            <div className="flex items-center justify-between px-5 h-12 border-b border-[rgba(125,211,252,0.1)] shrink-0 bg-[rgba(15,21,36,0.5)]">
                <span className="text-sm font-semibold text-[#e0e8f0]">Appointment Details</span>
                <button onClick={onClose} className="text-[#a0b4c4] hover:text-[#e0e8f0] p-1 rounded-full hover:bg-white/10 transition">
                    <MIcon name="close" className="text-[20px]" />
                </button>
            </div>

            <div className="px-6 py-6 flex items-center gap-4">
                <Avatar name={patientName} size={56} />
                <div>
                    <h4 className="text-[16px] font-semibold text-[#e0e8f0]">{patientName}</h4>
                    {patientEmail && (
                        <p className="text-xs text-[#a0b4c4] flex items-center gap-1 mt-1">
                            <MIcon name="mail" className="text-[14px]" />{patientEmail}
                        </p>
                    )}
                    {patientPhone && (
                        <p className="text-xs text-[#a0b4c4] flex items-center gap-1 mt-0.5">
                            <MIcon name="call" className="text-[14px]" />{patientPhone}
                        </p>
                    )}
                </div>
            </div>

            <hr className="border-[rgba(125,211,252,0.1)] mx-6" />

            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
                <div>
                    <span className="text-xs text-[#a0b4c4] uppercase tracking-wider">Service</span>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-9 h-9 rounded-lg bg-[#141c2e] flex items-center justify-center border border-white/5">
                            <MIcon name="stethoscope" className="text-[#c8a0f0] text-[18px]" />
                        </div>
                        <div>
                            <span className="text-sm text-[#e0e8f0]">{booking.service?.name || 'Service'}</span>
                            {booking.service?.duration && <p className="text-xs text-[#a0b4c4]">{booking.service.duration} minutes</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <span className="text-xs text-[#a0b4c4] uppercase tracking-wider">Date &amp; Time</span>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-9 h-9 rounded-lg bg-[#141c2e] flex items-center justify-center border border-white/5">
                            <MIcon name="calendar_clock" className="text-[#7dd3fc] text-[18px]" />
                        </div>
                        <div>
                            <p className="text-sm text-[#e0e8f0]">{formatDateFriendly(booking.date)}</p>
                            <p className="text-xs text-[#a0b4c4]">{formatTime12(booking.time)}{booking.service?.duration ? ` (${booking.service.duration} min)` : ''}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <span className="text-xs text-[#a0b4c4] uppercase tracking-wider">Status</span>
                    <div className="mt-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${style.badge}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.bar }} />
                            {booking.status}
                        </span>
                    </div>
                </div>

                {booking.notes && (
                    <div>
                        <span className="text-xs text-[#a0b4c4] uppercase tracking-wider">Notes</span>
                        <div className="mt-1.5 p-3 rounded-lg bg-[#111828] border border-white/5 text-xs text-[#a0b4c4] leading-relaxed flex gap-2">
                            <MIcon name="description" className="text-[16px] shrink-0" />
                            <span>{booking.notes}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[rgba(125,211,252,0.1)] bg-[rgba(15,21,36,0.5)] shrink-0">
                {isPending && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={busy}
                            onClick={() => onCancel(booking)}
                            className={`text-[#ff6b6b] text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#ff6b6b]/10 hover:border-[#ff6b6b]/30 disabled:opacity-50 transition-colors ${btnGlass}`}
                        >
                            <MIcon name="close" className="text-[18px]" /> Decline
                        </button>
                        <button
                            disabled={busy}
                            onClick={() => onAccept(booking)}
                            className="bg-[#7dd3fc]/20 hover:bg-[#7dd3fc]/30 text-[#7dd3fc] border border-[#7dd3fc]/40 text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] disabled:opacity-50"
                        >
                            <MIcon name="check" className="text-[18px]" /> Accept
                        </button>
                    </div>
                )}
                {isConfirmed && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={busy}
                            onClick={() => onCancel(booking)}
                            className={`text-[#ff6b6b] text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#ff6b6b]/10 hover:border-[#ff6b6b]/30 disabled:opacity-50 transition-colors ${btnGlass}`}
                        >
                            <MIcon name="cancel" className="text-[18px]" /> Cancel
                        </button>
                        <button
                            disabled={busy}
                            onClick={() => onComplete(booking)}
                            className="bg-[#7dd3fc]/20 hover:bg-[#7dd3fc]/30 text-[#7dd3fc] border border-[#7dd3fc]/40 text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] disabled:opacity-50"
                        >
                            <MIcon name="check" className="text-[18px]" /> Complete
                        </button>
                    </div>
                )}
                {isCompleted && (
                    <div className="text-xs text-[#a0b4c4] bg-[#111828] px-4 py-2.5 rounded-lg text-center">
                        This appointment is <span className="font-semibold capitalize text-[#e0e8f0]">{booking.status}</span>
                    </div>
                )}
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
        <div className={`w-full h-full flex flex-col overflow-y-auto ${glassPanelElevated}`}>
            <div className="flex items-center justify-between px-5 h-12 border-b border-[rgba(125,211,252,0.1)] shrink-0 bg-[rgba(15,21,36,0.5)]">
                <span className="text-sm font-semibold text-[#e0e8f0]">Request Approval</span>
                <button onClick={onClose} className="text-[#a0b4c4] hover:text-[#e0e8f0] p-1 rounded-full hover:bg-white/10 transition">
                    <MIcon name="close" className="text-[20px]" />
                </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4">
                {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-12">
                        <MIcon name="celebration" className="text-[40px] text-[#7dd3fc] mb-3" />
                        <p className="text-[#e0e8f0] font-medium">No pending requests</p>
                    </div>
                )}
                {Object.entries(grouped).map(([date, items]) => (
                    <div key={date} className="mb-4">
                        <div className="text-[10px] font-semibold text-[#a0b4c4] mb-2 uppercase tracking-wider">{formatDateFriendly(date)}</div>
                        <div className="space-y-2">
                            {items.map((b) => {
                                const patientName = b.patient?.name || 'Unknown Patient';
                                return (
                                    <div key={b.id} className="flex items-center justify-between gap-2 bg-[#111828] rounded-lg px-3 py-2 hover:bg-white/5 transition border border-white/5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar name={patientName} size={28} />
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-[#e0e8f0] truncate">{patientName}</div>
                                                <div className="text-[10px] text-[#a0b4c4] truncate">{b.service?.name || 'Service'}</div>
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-[10px] text-[#a0b4c4] w-16 shrink-0 font-medium">{formatTime12(b.time)}</div>
                                        <button
                                            disabled={busy}
                                            onClick={() => onAccept(b)}
                                            className="text-xs font-medium text-[#7dd3fc] bg-[#7dd3fc]/15 border border-[#7dd3fc]/30 px-3 py-1 rounded-lg hover:bg-[#7dd3fc]/25 disabled:opacity-50 transition shrink-0"
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
    useGlassFonts();
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

    // Global safety net: HTML5 drag/drop falls back to the browser's native
    // "navigate to dropped data" behavior whenever a drop lands somewhere
    // that didn't call preventDefault() (e.g. over a card, a gap between
    // cells, outside the grid). That fallback looks exactly like a full
    // page reload. Our per-cell handlers in WeeklyGrid already call
    // preventDefault() correctly, but this window-level listener catches
    // every other case so the browser never takes over.
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);
        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    // `silent` skips the full-page loading flag so refetching after a
    // drag/drop or status change doesn't blank out the whole calendar —
    // that full-screen spinner replacing everything is what looked like
    // a page refresh. Only the very first load (and the manual refresh
    // button, via refreshData/refreshKey) should show it.
    const fetchBookings = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const response = await api.get('/doctor/bookings');
            console.log('Bookings response:', response.data);
            setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError('Failed to load appointments. Please refresh the page.');
        } finally {
            if (!silent) setLoading(false);
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
            await fetchBookings(true); // silent — no full-screen spinner
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
            await fetchBookings(true); // silent
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
            await fetchBookings(true); // silent
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
            await fetchBookings(true); // silent
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
        { label: 'Total Appointments', value: bookings.length, tone: 'slate' },
        { label: 'Pending Requests', value: pendingBookings.length, tone: 'yellow' },
        { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, tone: 'blue' },
        { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, tone: 'green' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full" style={pageBg}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#7dd3fc] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#a0b4c4] text-sm">Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full w-full" style={pageBg}>
                <div className={`text-center max-w-md p-6 rounded-xl ${glassPanel}`}>
                    <MIcon name="error" className="text-[40px] text-[#ff6b6b] mb-2" />
                    <p className="text-[#e0e8f0] font-medium">{error}</p>
                    <button
                        onClick={refreshData}
                        className="mt-4 px-4 py-2 bg-[#7dd3fc]/20 hover:bg-[#7dd3fc]/30 text-[#7dd3fc] border border-[#7dd3fc]/40 rounded-lg transition text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full font-['Inter'] text-[#e0e8f0]" style={pageBg}>
            {/* Header */}
            <div className="px-6 pt-6 pb-2 shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-[20px] leading-[28px] font-bold text-[#e0e8f0]">Calendar</h2>
                        <p className="text-xs text-[#a0b4c4]">
                            {user?.name ? `Welcome back, ${user.name}` : 'Manage your appointments'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#a0b4c4] hidden md:block">
                            {bookings.length} appointments this week
                        </span>
                        <IconBtn onClick={refreshData} title="Refresh">
                            <MIcon name="refresh" className="text-[18px]" />
                        </IconBtn>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 flex min-h-0 px-6 pb-6 w-full">
                <div className={`flex-1 flex flex-col rounded-xl overflow-hidden w-full ${glassPanel}`}>
                    <div className="flex flex-1 min-h-0 w-full">
                        {/* Calendar - Left side */}
                        <div className="flex flex-col flex-1 min-w-0 min-h-0">
                            {/* Top bar */}
                            <div className="flex items-center justify-between px-4 h-14 border-b border-[rgba(125,211,252,0.1)] gap-2 shrink-0 bg-[rgba(15,21,36,0.4)]">
                                <div className="flex items-center gap-2">
                                    <MIcon name="calendar_month" filled className="text-[#7dd3fc] text-[20px]" />
                                    <span className="text-sm font-semibold text-[#e0e8f0]">{fmtRange(weekDates)}</span>
                                </div>

                                <div className={`flex items-center rounded-lg overflow-hidden ${glassPanel}`}>
                                    <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white/10 transition-colors border-r border-[rgba(125,211,252,0.1)]">
                                        <MIcon name="chevron_left" className="text-[20px] text-[#a0b4c4]" />
                                    </button>
                                    <button onClick={goToToday} className="px-4 py-2 hover:bg-white/10 transition-colors text-sm font-medium text-[#e0e8f0]">
                                        Today
                                    </button>
                                    <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white/10 transition-colors border-l border-[rgba(125,211,252,0.1)]">
                                        <MIcon name="chevron_right" className="text-[20px] text-[#a0b4c4]" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative hidden md:block">
                                        <MIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0b4c4] text-[18px]" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search patient or service..."
                                            className={`rounded-full py-2 pl-9 pr-4 text-xs text-[#e0e8f0] placeholder:text-[#a0b4c4] w-40 transition-all focus:w-56 ${glassInput}`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setPanel('approval')}
                                        className={`relative flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#e0e8f0] ${btnGlass}`}
                                    >
                                        <MIcon name="group" className="text-[18px]" />
                                        {pendingBookings.length > 0 && (
                                            <span className="bg-[#ff6b6b] text-[#1a0000] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
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

                            {/* Legend */}
                            <div className="px-4 py-2 border-t border-[rgba(125,211,252,0.1)] flex flex-wrap items-center gap-3 text-[10px] bg-[rgba(15,21,36,0.4)] shrink-0">
                                <span className="text-[#a0b4c4] font-medium">Status:</span>
                                {Object.entries(STATUS_STYLES).map(([status, s]) => (
                                    <span key={status} className="flex items-center gap-1.5 capitalize text-[#a0b4c4]">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.bar }} />
                                        {status}
                                    </span>
                                ))}
                                {bookings.length === 0 && (
                                    <span className="text-[#a0b4c4]/60 ml-2">No appointments scheduled</span>
                                )}
                            </div>
                        </div>

                        {/* Right Panel */}
                        {panel && (
                            <div className="w-[320px] flex-shrink-0 border-l border-[rgba(125,211,252,0.1)] overflow-y-auto">
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