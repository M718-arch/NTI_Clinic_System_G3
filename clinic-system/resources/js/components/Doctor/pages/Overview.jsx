import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

// Avatar component with proper image handling
const Avatar = ({ src, name, size = 'w-10 h-10', fallbackInitial = null }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const initials = name?.charAt(0)?.toUpperCase() || fallbackInitial || 'P';

    const isValidSrc = src && src !== 'null' && src !== 'undefined' && src !== '';

    if (isValidSrc && !imgFailed) {
        return (
            <img
                src={src}
                alt={name || 'Avatar'}
                className={`${size} rounded-full object-cover border border-white/50 shrink-0`}
                onError={() => {
                    console.log('Image failed to load:', src);
                    setImgFailed(true);
                }}
                onLoad={() => {
                    console.log('Image loaded successfully:', src);
                }}
            />
        );
    }

    return (
        <div className={`${size} rounded-full bg-gradient-to-br from-[#006382] to-[#4a9eb5] flex items-center justify-center text-white font-bold text-sm border border-white/50 shrink-0`}>
            {initials}
        </div>
    );
};

// Helper function to get full image URL
const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    if (path.startsWith('/storage/')) {
        return `${baseUrl}${path}`;
    }
    if (path.startsWith('patient-photos/')) {
        return `${baseUrl}/storage/${path}`;
    }
    if (path.startsWith('doctor-images/')) {
        return `${baseUrl}/storage/${path}`;
    }
    if (!path.startsWith('/')) {
        return `${baseUrl}/storage/${path}`;
    }
    return `${baseUrl}${path}`;
};

export const Overview = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [stats, setStats] = useState({
        today_appointments: 0,
        total_bookings: 0,
        pending_review: 0,
        completed: 0
    });
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const response = await api.get('/doctor/profile');
            console.log('Doctor profile:', response.data);
            setDoctorProfile(response.data);
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all bookings
            const bookingsResponse = await api.get('/doctor/bookings');
            console.log('Full bookings response:', bookingsResponse.data);
            
            const bookings = bookingsResponse.data || [];
            const today = new Date().toISOString().split('T')[0];
            
            if (bookings.length > 0) {
                console.log('First booking structure:', bookings[0]);
                console.log('Patient data in first booking:', bookings[0].patient);
                console.log('Patient photo field:', bookings[0].patient?.photo);
            }
            
            // Calculate stats
            const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
            const totalBookings = bookings.length;
            const pendingBookings = bookings.filter(b => b.status === 'pending').length;
            const completedBookings = bookings.filter(b => b.status === 'completed').length;

            // Map today's appointments with correct patient photo URL
            const todayBookingsWithPhotos = todayBookings.slice(0, 5).map(booking => {
                let patientPhoto = null;
                
                if (booking.patient) {
                    const photoPath = booking.patient.photo || 
                                     booking.patient.photo_url || 
                                     booking.patient.profile_photo_url || 
                                     booking.patient.image_url || 
                                     booking.patient.avatar_url ||
                                     null;
                    
                    patientPhoto = getFullImageUrl(photoPath);
                    
                    console.log('Patient photo path:', photoPath);
                    console.log('Full patient photo URL:', patientPhoto);
                }
                
                return {
                    ...booking,
                    patient: {
                        ...booking.patient,
                        photo_url: patientPhoto
                    }
                };
            });

            setStats({
                today_appointments: todayBookings.length,
                total_bookings: totalBookings,
                pending_review: pendingBookings,
                completed: completedBookings
            });

            setTodayAppointments(todayBookingsWithPhotos);

            // Calculate weekly volume
            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const weeklyVolume = weekDays.map((day, index) => {
                const date = new Date();
                const dayOffset = date.getDay() - 1;
                const targetDate = new Date(date);
                targetDate.setDate(date.getDate() - dayOffset + index);
                const dateStr = targetDate.toISOString().split('T')[0];
                return bookings.filter(b => b.date === dateStr && b.status !== 'cancelled').length;
            });
            setWeeklyData(weeklyVolume);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard data');
            
            // Fallback data
            setStats({
                today_appointments: 14,
                total_bookings: 128,
                pending_review: 7,
                completed: 42
            });
            setTodayAppointments([
                {
                    id: 1,
                    patient: { 
                        name: 'James Wilson', 
                        photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa-dN0C3fOBwndAV_ahJUXx9k3p5eGiDfkFDK0HRjqyYTF6n44cCTvKgfuUkWxBu0eA3m4397ynGWw0ouN7fFSs1lTjcc1Bj9PBGlrHkHiH_S9AcfF6YL-80n7EnWAWuHjaav63plfu6_VZVBtDWgdclrmc047WH1UOMdC8urx03wSEn1pGja5V8fElWmLOledLq6Vwk4ViKR3MJmmK0D22DnIGLxno7US7pAPL9lKygfrK2cgVgcwCg' 
                    },
                    service: { name: 'Follow-up Consultation' },
                    time: '09:00',
                    duration: 30,
                    status: 'in-progress'
                },
                {
                    id: 2,
                    patient: { 
                        name: 'Sarah Chen', 
                        photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ1WjLYyAGCtSsLzRFJKdhQHY0iAILnjVUb4-skXSn_p6Bvg6MUDj4rSRvy2pPEcppQhqOkk6Q_HIYX_iuTFaEa735AB8UVafrhJP3z2N5JowpbEWBEpufKvMOLDHOlUSiy4kQFbLfr6T55itpoItJLCjg8usSkWZH__1p4KcRuEJTlvWMWxuWZQPa3drmkzGZ4kFHirEr0Ln_K8o7XnfSkWBG_5tnquRZts_YyIdL_eK7HSJp8BpZrQ' 
                    },
                    service: { name: 'Lab Results Review' },
                    time: '09:45',
                    duration: 15,
                    status: 'pending'
                },
                {
                    id: 3,
                    patient: { 
                        name: 'Michael Roberts', 
                        photo_url: null 
                    },
                    service: { name: 'Initial Assessment' },
                    time: '10:15',
                    duration: 45,
                    status: 'confirmed'
                }
            ]);
            setWeeklyData([12, 18, 25, 15, 21]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'in-progress': 'bg-[#006382]/20 text-[#006382] border border-[#006382]/20',
            'confirmed': 'bg-blue-500/15 text-blue-600 border border-blue-500/20',
            'pending': 'bg-amber-500/15 text-amber-600 border border-amber-500/20',
            'completed': 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
            'cancelled': 'bg-red-500/15 text-red-600 border border-red-500/20'
        };
        const style = statusMap[status?.toLowerCase()] || statusMap.pending;
        const label = status === 'in-progress' ? 'In Progress' : 
                     status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';

        return (
            <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded-md font-bold ${style}`}>
                {label}
            </span>
        );
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const maxValue = Math.max(...weeklyData, 1);

    const getDoctorAvatar = () => {
        if (doctorProfile?.image_url) return getFullImageUrl(doctorProfile.image_url);
        if (doctorProfile?.photo_url) return getFullImageUrl(doctorProfile.photo_url);
        if (doctorProfile?.avatar) return getFullImageUrl(doctorProfile.avatar);
        if (doctorProfile?.image) return getFullImageUrl(doctorProfile.image);
        return null;
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#f5f6ff]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-[#006382] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#525b72]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#f5f6ff]">
                <div className="glass-panel rounded-2xl p-8 max-w-md text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-bold text-[#252f43] mb-2">Failed to load dashboard</h3>
                    <p className="text-[#525b72] text-sm mb-4">{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-[#006382]/20 text-[#006382] rounded-lg hover:bg-[#006382]/30 transition font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f5f6ff] overflow-hidden">
            {/* Ambient Background Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#006382]/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6f4b94]/20 rounded-full blur-[150px]"></div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto relative z-10 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`main::-webkit-scrollbar { display: none; }`}</style>

                {/* Welcome Section with Doctor Avatar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <Avatar 
                            src={getDoctorAvatar()} 
                            name={user?.name || 'Doctor'} 
                            size="w-14 h-14"
                            fallbackInitial={user?.name?.charAt(0) || 'D'}
                        />
                        <div>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#252f43] tracking-tight mb-2">
                                Welcome back, <span className="text-[#006382]">Dr. {user?.name?.split(' ')[0] || 'Marcus'}!</span>
                            </h2>
                            <p className="text-[#525b72] text-body-md">Here's an overview of your schedule and patient metrics for today.</p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-label-md text-[#525b72]">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Bento Stats Grid - Staggered animation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { 
                            key: 'today', 
                            label: "Today's Appointments", 
                            value: stats.today_appointments || 0,
                            icon: 'calendar_month',
                            color: '#006382',
                            bgColor: 'rgba(0,99,130,0.2)',
                            subtext: 'Today',
                            subtextColor: '#346176',
                            delay: '0.1s'
                        },
                        { 
                            key: 'total', 
                            label: 'Total Bookings', 
                            value: stats.total_bookings || 0,
                            icon: 'book_online',
                            color: '#16a34a',
                            bgColor: 'rgba(74,222,128,0.2)',
                            subtext: 'All time',
                            subtextColor: '#16a34a',
                            delay: '0.2s'
                        },
                        { 
                            key: 'pending', 
                            label: 'Pending Review', 
                            value: stats.pending_review || 0,
                            icon: 'hourglass_empty',
                            color: '#ea580c',
                            bgColor: 'rgba(251,146,60,0.2)',
                            subtext: 'Action needed',
                            subtextColor: '#ea580c',
                            delay: '0.3s'
                        },
                        { 
                            key: 'completed', 
                            label: 'Completed', 
                            value: stats.completed || 0,
                            icon: 'task_alt',
                            color: '#6f4b94',
                            bgColor: 'rgba(111,75,148,0.1)',
                            subtext: 'All time',
                            subtextColor: '#525b72',
                            delay: '0.4s'
                        }
                    ].map((stat) => (
                        <div 
                            key={stat.key}
                            className="glass-panel rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-[0_8px_32px_rgba(0,99,130,0.12)] hover:bg-white/55 transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: stat.delay }}
                        >
                            <div 
                                className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl group-hover:scale-110 transition-all duration-500"
                                style={{ backgroundColor: stat.bgColor }}
                            ></div>
                            <div className="flex justify-between items-start">
                                <span className="text-label-md font-label text-[#525b72] font-medium">{stat.label}</span>
                                <span 
                                    className="material-symbols-outlined text-sm p-1 rounded-md"
                                    style={{ color: stat.color, backgroundColor: stat.bgColor }}
                                >
                                    {stat.icon}
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-headline font-bold text-[#252f43]">{stat.value}</span>
                                <span className="text-xs flex items-center font-medium" style={{ color: stat.subtextColor }}>
                                    {stat.subtext}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Schedule Section - Staggered animation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-elevated rounded-2xl p-6 flex flex-col h-[480px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-headline-sm font-headline font-bold text-[#252f43]">Today's Schedule</h3>
                            <button 
                                onClick={() => window.location.href = '/doctor/calendar'}
                                className="text-[#006382] text-label-md hover:underline flex items-center font-semibold"
                            >
                                View All <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
                            {todayAppointments.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-[#525b72]">
                                    No appointments scheduled for today
                                </div>
                            ) : (
                                todayAppointments.map((appointment, index) => {
                                    const isActive = index === 0 && appointment.status === 'in-progress';
                                    const patientName = appointment.patient?.name || 'Unknown Patient';
                                    const patientPhoto = appointment.patient?.photo_url || null;
                                    const serviceName = appointment.service?.name || 'Service';
                                    const time = appointment.time || '00:00';
                                    const duration = appointment.duration || 30;

                                    return (
                                        <div 
                                            key={appointment.id} 
                                            className={`glass-panel rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,99,130,0.08)] ${
                                                isActive 
                                                    ? 'border-l-4 border-l-[#006382]' 
                                                    : 'border-l-4 border-l-transparent hover:border-l-[#346176]'
                                            } relative overflow-hidden group animate-fade-in-up`}
                                            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${isActive ? 'from-[#006382]/10' : 'from-transparent'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className="flex flex-col min-w-[80px] z-10">
                                                <span className="text-label-md font-bold text-[#252f43]">{formatTime(time)}</span>
                                                <span className="text-caption text-[#525b72] font-medium">{duration} min</span>
                                            </div>
                                            <Avatar 
                                                src={patientPhoto} 
                                                name={patientName} 
                                                size="w-10 h-10"
                                                fallbackInitial={patientName?.charAt(0) || 'P'}
                                            />
                                            <div className="flex-1 z-10 min-w-0">
                                                <h4 className="text-body-md font-bold text-[#252f43] truncate">{patientName}</h4>
                                                <p className="text-caption text-[#525b72] font-medium truncate">{serviceName}</p>
                                            </div>
                                            <div className="flex items-center gap-2 z-10 shrink-0">
                                                {getStatusBadge(appointment.status)}
                                                {isActive && (
                                                    <button className="p-2 rounded-lg bg-white/40 hover:bg-[#006382]/20 text-[#525b72] hover:text-[#006382] transition-colors border border-white/60 hover:border-[#006382]/40">
                                                        <span className="material-symbols-outlined text-sm">videocam</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="glass-panel rounded-2xl p-6 h-64 flex flex-col relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6f4b94]/10 rounded-bl-full"></div>
                            <h3 className="text-label-md font-headline font-bold text-[#252f43] mb-3">Patient Volume (Weekly)</h3>
                            <div className="flex-1 flex items-end justify-between gap-2 pb-2">
                                {weeklyData.map((value, i) => {
                                    const heightPercent = maxValue > 0 ? (value / maxValue) * 80 : 0;
                                    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div 
                                                className="w-full rounded-t-sm transition-all duration-500 hover:scale-y-105 origin-bottom"
                                                style={{ 
                                                    height: `${heightPercent}%`,
                                                    background: value === Math.max(...weeklyData) && value > 0
                                                        ? 'linear-gradient(180deg, #006382, #4a9eb5)' 
                                                        : '#cfddff',
                                                    minHeight: value > 0 ? '8px' : '4px',
                                                    opacity: value > 0 ? 1 : 0.3
                                                }}
                                            >
                                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs text-[#006382] font-bold transition-opacity">
                                                    {value}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#525b72] font-medium">{dayLabels[i]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <h3 className="text-label-md font-headline font-bold text-[#252f43] mb-1">Quick Actions</h3>
                            <button className="w-full py-3 px-4 bg-white/40 hover:bg-white/60 border border-white/60 rounded-xl flex items-center justify-between text-body-md text-[#252f43] font-medium transition-all duration-300 group hover:shadow-[0_4px_16px_rgba(0,99,130,0.08)]">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#006382] group-hover:scale-110 transition-transform">edit_document</span>
                                    <span>Write Prescription</span>
                                </div>
                                <span className="material-symbols-outlined text-sm text-[#525b72] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                            </button>
                            <button className="w-full py-3 px-4 bg-white/40 hover:bg-white/60 border border-white/60 rounded-xl flex items-center justify-between text-body-md text-[#252f43] font-medium transition-all duration-300 group hover:shadow-[0_4px_16px_rgba(111,75,148,0.08)]">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#6f4b94] group-hover:scale-110 transition-transform">person_add</span>
                                    <span>Add New Patient</span>
                                </div>
                                <span className="material-symbols-outlined text-sm text-[#525b72] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.45);
                    backdrop-filter: blur(32px);
                    -webkit-backdrop-filter: blur(32px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .glass-panel:hover {
                    background: rgba(255, 255, 255, 0.55);
                }

                .glass-elevated {
                    background: rgba(255, 255, 255, 0.55);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                }

                /* Staggered fade-in animation */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
};

export default Overview;