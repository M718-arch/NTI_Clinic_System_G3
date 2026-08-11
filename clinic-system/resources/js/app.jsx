// resources/js/app.jsx

import './bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/receptionist-theme.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/shared/ToastProvider';

// Patient Components
import PatientDashboard from './components/Patient/Dashboard';
import PatientServices from './components/Patient/Services';
import PatientBookings from './components/Patient/Bookings';
import PatientProfile from './components/Patient/Profile';
import { PatientMessages } from './components/Patient/Messages';

// Doctor Components
import DoctorDashboard from "./components/Doctor/d_dashboard";
import { PatientList } from './components/Doctor/pages/PatientList';
import Calendar from './components/Doctor/pages/Calendar';
import { Messages } from './components/Doctor/pages/Messages';

// Receptionist Components (Phase 5 & 6)
import ReceptionistLayout from './components/receptionist/ReceptionistLayout';
import ReceptionistDashboard from './components/receptionist/Dashboard';
import Patients from './components/receptionist/Patients';
import TodaySchedule from './components/receptionist/TodaySchedule';
import BookAppointment from './components/receptionist/BookAppointment';
import WalkInRegistration from './components/receptionist/WalkInRegistration';
import Settings from './components/receptionist/Settings';

// Phase 6: Billing Components
import Invoices from './components/receptionist/Invoices';
import InvoiceDetail from './components/receptionist/InvoiceDetail';
import CreateInvoice from './components/receptionist/CreateInvoice';

// Phase 7: Admin Components
import AdminLayout from './components/admin/AdminLayout';
import Reports from './components/admin/Reports';
import AdminDashboard from './components/admin/Dashboard';  // Add this
import AdminDoctors from './components/admin/Doctors';      // Add this
import AdminPatients from './components/admin/Patients';    // Add this
import AdminAppointments from './components/admin/Appointments'; // Add this
import AdminReceptionists from './components/admin/Receptionists'; // Add this
import AdminBilling from './components/admin/Billing';      // Add this

import api from './api/client';

// =============================================================================
// CLINICAL CLARITY GLASS — Theme Constants
// =============================================================================

const c = {
    primary: '#003f87',
    primaryContainer: '#0056b3',
    onPrimaryContainer: '#bbd0ff',
    secondary: '#006b5f',
    secondaryContainer: '#6df5e1',
    onSecondaryContainer: '#006f64',
    tertiary: '#39434d',
    tertiaryContainer: '#505a65',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    surface: '#f8f9ff',
    onSurface: '#121c28',
    onSurfaceVariant: '#424752',
    outline: '#727784',
    background: '#f8f9ff',
};

const glassPanel = 'bg-white/60 backdrop-blur-[16px] border border-white/80';
const ambientShadow = 'shadow-[0_8px_32px_0_rgba(0,86,179,0.05)]';
const glassButtonPrimary = 'bg-[rgba(0,86,179,0.9)] backdrop-blur-[8px] border border-white/20 shadow-[0_4px_15px_rgba(0,86,179,0.3)] hover:bg-[#0056b3]';
const pageGradient = { background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' };

// Material Symbols Icon Component
const MIcon = ({ name, filled = false, className = '' }) => (
    <span
        className={`material-symbols-outlined select-none ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
        {name}
    </span>
);

// Font Loader Hook
const useGlassFonts = () => {
    useEffect(() => {
        if (document.getElementById('glass-fonts')) return;
        const link = document.createElement('link');
        link.id = 'glass-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
        document.head.appendChild(link);
    }, []);
};

// =============================================================================
// PROTECTED ROUTE COMPONENT
// =============================================================================

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={pageGradient}>
                <div className="text-xl text-[#424752] font-['Inter']">Loading...</div>
            </div>
        );
    }

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const dashboardPath = `/${user.role}/dashboard`;
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

// =============================================================================
// NOTIFICATION BELL COMPONENT
// =============================================================================

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/patient/notifications');
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        try {
            await api.post(`/patient/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await api.post('/patient/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`relative p-2 rounded-full hover:bg-white/50 transition-colors text-[#424752] ${glassPanel}`}
                aria-label="Notifications"
            >
                <MIcon name="notifications" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-xl z-50 ${glassPanel} ${ambientShadow}`}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/50">
                        <span className="text-sm font-semibold text-[#121c28]">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-[#003f87] hover:underline font-medium">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-[#727784]">No notifications yet</div>
                    ) : (
                        <div className="divide-y divide-white/50">
                            {notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.read && markAsRead(n.id)}
                                    className={`w-full text-left px-4 py-3 hover:bg-white/50 transition ${!n.read ? 'bg-[#0056b3]/5' : ''}`}
                                >
                                    <div className="flex items-start gap-2">
                                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#003f87] mt-1.5 shrink-0" />}
                                        <div className={n.read ? 'pl-3.5' : ''}>
                                            <p className="text-sm text-[#121c28]">{n.message}</p>
                                            <p className="text-xs text-[#727784] mt-0.5">{n.time}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// =============================================================================
// PATIENT SIDEBAR
// =============================================================================

const NAV_ITEMS = [
    { to: '/patient', label: 'Overview', icon: 'dashboard', exact: true },
    { to: '/patient/services', label: 'Services', icon: 'medical_services' },
    { to: '/patient/my-bookings', label: 'My Bookings', icon: 'calendar_month' },
    { to: '/patient/messages', label: 'Messages', icon: 'mail', badgeKey: 'messages' },
    { to: '/patient/profile', label: 'Profile', icon: 'person' },
];

const Sidebar = ({ unreadMessages, onLogout }) => {
    const location = useLocation();
    const isActive = (item) => (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to));

    return (
        <aside className={`h-screen w-64 fixed left-0 top-0 flex flex-col h-full py-6 z-50 shadow-xl shadow-blue-900/5 ${glassPanel}`}>
            <div className="px-4 mb-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/80 border border-white flex items-center justify-center shrink-0 shadow-sm">
                    <MIcon name="local_hospital" filled className="text-[#003f87]" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-[#003f87]">CLINIK</h1>
                    <p className="text-xs text-[#424752]">Patient Portal</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`rounded-lg mx-2 my-1 flex items-center px-4 py-3 transition-all ${
                                active
                                    ? 'bg-[#003f87]/10 text-[#003f87] border border-[#003f87]/20 backdrop-blur-sm font-semibold'
                                    : 'text-[#424752] hover:bg-white/50'
                            }`}
                        >
                            <MIcon name={item.icon} filled={active} className="mr-3 text-[20px]" />
                            <span className="text-sm">{item.label}</span>
                            {item.badgeKey === 'messages' && unreadMessages > 0 && (
                                <span className="ml-auto bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {unreadMessages > 99 ? '99+' : unreadMessages}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 mt-auto pt-6">
                <Link
                    to="/patient/services"
                    className={`w-full text-white rounded-full py-3 px-4 text-sm font-medium transition-all flex justify-center items-center gap-2 mb-4 ${glassButtonPrimary}`}
                >
                    <MIcon name="calendar_add_on" />
                    Book Appointment
                </Link>
                <a href="#" className="text-[#424752] hover:bg-white/50 rounded-lg mx-2 my-1 flex items-center px-4 py-3 transition-all text-sm">
                    <MIcon name="help" className="mr-3 text-[20px]" />
                    Help Center
                </a>
                <button
                    onClick={onLogout}
                    className="w-full text-left text-[#ba1a1a] hover:bg-[#ba1a1a]/5 rounded-lg mx-2 my-1 flex items-center px-4 py-3 transition-all text-sm"
                >
                    <MIcon name="logout" className="mr-3 text-[20px]" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

// =============================================================================
// PATIENT LAYOUT
// =============================================================================

const PatientLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const location = useLocation();
    const onMessagesPage = location.pathname === '/patient/messages';

    useGlassFonts();

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        if (onMessagesPage) setUnreadMessages(0);
    }, [onMessagesPage]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/messages/conversations');
            const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
            setUnreadMessages(onMessagesPage ? 0 : totalUnread);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = async () => {
        logout();
    };

    return (
        <div className="flex min-h-screen overflow-hidden font-['Inter'] text-[#121c28]" style={pageGradient}>
            <Sidebar unreadMessages={unreadMessages} onLogout={handleLogout} />

            <main className={`ml-64 flex-1 h-screen overflow-y-auto p-6 md:p-10 relative ${onMessagesPage ? 'flex flex-col overflow-hidden' : ''}`}>
                <header className="flex justify-end items-center gap-3 mb-10">
                    <NotificationBell />
                    <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2 border-white shadow-sm text-sm font-semibold text-[#003f87] bg-white/70`}>
                        {(user?.name || 'P').charAt(0).toUpperCase()}
                    </div>
                </header>

                <div className={`max-w-[1280px] mx-auto ${onMessagesPage ? 'flex-1 flex flex-col overflow-hidden' : ''}`}>
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { updateUnreadCount: fetchUnreadCount });
                        }
                        return child;
                    })}
                </div>
            </main>
        </div>
    );
};

// =============================================================================
// PLAIN LAYOUT (Doctor)
// =============================================================================
// Top bar removed — the Doctor Sidebar (Sidebar.jsx) already has its own
// Logout button, so no functionality is lost by dropping this header.

const PlainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="p-6">
                {children}
            </main>
        </div>
    );
};

// =============================================================================
// ROLE-BASED REDIRECT
// =============================================================================

const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={pageGradient}>
                <div className="text-xl text-[#424752] font-['Inter']">Loading...</div>
            </div>
        );
    }

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    switch (user.role) {
        case 'patient':
            return <Navigate to="/patient/dashboard" replace />;
        case 'doctor':
            return <Navigate to="/doctor/dashboard" replace />;
        case 'receptionist':
            return <Navigate to="/receptionist/dashboard" replace />;
        case 'admin':
            return <Navigate to="/admin/reports" replace />;
        default:
            window.location.href = '/login';
            return null;
    }
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

const App = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Patient Routes */}
                        <Route path="/patient" element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout><PatientDashboard /></PatientLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/dashboard" element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout><PatientDashboard /></PatientLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/services" element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout><PatientServices /></PatientLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/my-bookings" element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout><PatientBookings /></PatientLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/messages" element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout><PatientMessages /></PatientLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/profile" element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout><PatientProfile /></PatientLayout>
                            </ProtectedRoute>
                        } />

                        {/* Doctor Routes */}
                        <Route path="/doctor" element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <PlainLayout><DoctorDashboard /></PlainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/doctor/dashboard" element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <PlainLayout><DoctorDashboard /></PlainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/doctor/calendar" element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <PlainLayout><Calendar /></PlainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/doctor/patients" element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <PlainLayout><PatientList /></PlainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/doctor/messages" element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <PlainLayout><Messages /></PlainLayout>
                            </ProtectedRoute>
                        } />

                        {/* Receptionist Routes (Phase 5 & 6) */}
                        <Route path="/receptionist" element={
                            <ProtectedRoute allowedRoles={['receptionist']}>
                                <ReceptionistLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<ReceptionistDashboard />} />
                            <Route path="dashboard" element={<ReceptionistDashboard />} />
                            <Route path="patients" element={<Patients />} />
                            <Route path="patients/walk-in" element={<WalkInRegistration />} />
                            <Route path="schedule" element={<TodaySchedule />} />
                            <Route path="appointments/book" element={<BookAppointment />} />
                            <Route path="settings" element={<Settings />} />
                            
                            {/* Phase 6: Billing Routes */}
                            <Route path="invoices" element={<Invoices />} />
                            <Route path="invoices/:id" element={<InvoiceDetail />} />
                            <Route path="invoices/create" element={<CreateInvoice />} />
                        </Route>

                        {/* Phase 7: Admin Routes */}
                        <Route path="/admin" element={
    <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
    </ProtectedRoute>
}>
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="reports" element={<Reports />} />
    <Route path="doctors" element={<AdminDoctors />} />
    <Route path="patients" element={<AdminPatients />} />
    <Route path="appointments" element={<AdminAppointments />} />
    <Route path="receptionists" element={<AdminReceptionists />} />
    <Route path="billing" element={<AdminBilling />} />
</Route>

                        {/* Root & Catch-all */}
                        <Route path="/" element={<RoleBasedRedirect />} />
                        <Route path="*" element={<RoleBasedRedirect />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
};

// =============================================================================
// BOOTSTRAP
// =============================================================================

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}