import './bootstrap';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PatientDashboard from './components/Patient/Dashboard';
import PatientServices from './components/Patient/Services';
import PatientBookings from './components/Patient/Bookings';
import PatientProfile from './components/Patient/Profile';
import DoctorDashboard from "./components/Doctor/d_dashboard";
import { PatientList } from './components/Doctor/pages/PatientList';
import Calendar from './components/Doctor/pages/Calendar';
import { Messages } from './components/Doctor/pages/Messages';
import { PatientMessages } from './components/Patient/Messages';
import api from './api/client';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-slate-600">Loading...</div>
            </div>
        );
    }

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const dashboardPath = `/${user.role}`;
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

// Top navbar layout — used for patient pages only.
// Doctor pages render their own Sidebar, so they skip this wrapper (see PlainLayout below).
const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const location = useLocation();
    const onMessagesPage = location.pathname === '/patient/messages';

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Clear the badge immediately when the Messages page becomes active,
    // so the user isn't left staring at a stale unread count while reading.
    // The 30s poll above will re-sync it if new messages arrive later.
    useEffect(() => {
        if (onMessagesPage) {
            setUnreadMessages(0);
        }
    }, [onMessagesPage]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/messages/conversations');
            const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
            // Don't stomp the "just opened messages" state with a stale poll result.
            setUnreadMessages(onMessagesPage ? 0 : totalUnread);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = async () => {
        logout();
    };

    const updateUnreadCount = () => {
        fetchUnreadCount();
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to={`/${user?.role || 'patient'}`} className="text-xl font-bold text-slate-800">
                                CLINIK
                            </Link>
                            {user && (
                                <div className="hidden md:flex items-center gap-6">
                                    <Link to="/patient" className="text-sm text-slate-600 hover:text-slate-900">
                                        Dashboard
                                    </Link>
                                    <Link to="/patient/services" className="text-sm text-slate-600 hover:text-slate-900">
                                        Services
                                    </Link>
                                    <Link to="/patient/my-bookings" className="text-sm text-slate-600 hover:text-slate-900">
                                        My Bookings
                                    </Link>
                                    <Link to="/patient/messages" className="text-sm text-slate-600 hover:text-slate-900 relative">
                                        Messages
                                        {unreadMessages > 0 && (
                                            <span className="absolute -top-2 -right-5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                                                {unreadMessages > 99 ? '99+' : unreadMessages}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to="/patient/profile" className="text-sm text-slate-600 hover:text-slate-900">
                                        Profile
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <span className="text-sm text-slate-600">{user.name}</span>
                                    <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <a href="/login" className="text-sm text-blue-600 hover:text-blue-800">Login</a>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
    onMessagesPage ? 'h-[calc(100vh-4rem)] flex flex-col overflow-hidden' : ''
}`}>
    {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, { updateUnreadCount });
                    }
                    return child;
                })}
            </main>
        </div>
    );
};

// Plain wrapper for doctor pages — no top navbar, since doctor components
// (e.g. d_dashboard, Calendar, Messages, PatientList) render their own Sidebar.
const PlainLayout = ({ children }) => {
    return <>{children}</>;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Patient Messages Route */}
                    <Route path="/patient/messages" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Layout>
                                <PatientMessages />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* Doctor Messages Route */}
                    <Route path="/doctor/messages" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout>
                                <Messages />
                            </PlainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Patient Routes */}
                    <Route path="/patient" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Layout><PatientDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/patient/services" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Layout><PatientServices /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/patient/my-bookings" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Layout><PatientBookings /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/patient/profile" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Layout><PatientProfile /></Layout>
                        </ProtectedRoute>
                    } />

                    {/* Doctor Routes — no top navbar, doctor components have their own Sidebar */}
                    <Route path="/doctor" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout><DoctorDashboard /></PlainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/calendar" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout><Calendar /></PlainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/services" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout><DoctorDashboard /></PlainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/bookings" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout><DoctorDashboard /></PlainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/patients" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout><PatientList /></PlainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/profile" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PlainLayout>
                                <div className="text-2xl font-bold text-slate-800">Doctor Profile</div>
                            </PlainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout><div className="text-2xl font-bold text-slate-800">Admin Dashboard</div></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Navigate to="/patient" replace />} />
                    <Route path="*" element={<Navigate to="/patient" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}