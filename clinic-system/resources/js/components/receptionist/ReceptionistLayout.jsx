// resources/js/components/receptionist/ReceptionistLayout.jsx

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../shared/ToastProvider';
import "../../../css/receptionist-theme.css";

const ReceptionistLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navItems = [
        { to: '/receptionist', label: 'Dashboard', icon: 'dashboard', end: true },
        { to: '/receptionist/patients', label: 'Patients', icon: 'groups' },
        { to: '/receptionist/schedule', label: "Today's Schedule", icon: 'calendar_month' },
        { to: '/receptionist/appointments/book', label: 'Book Appointment', icon: 'person_add' },
        { to: '/receptionist/invoices', label: 'Billing', icon: 'receipt_long' },
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevent multiple clicks
        
        setIsLoggingOut(true);
        try {
            // Call logout API
            await logout();
            
            // Clear everything
            localStorage.clear();
            sessionStorage.clear();
            
            // Show success message
            toast.success('Logged out successfully');
            
            // Force navigation to login
            window.location.href = '/login';
            // Or use navigate if you prefer:
            // navigate('/login', { replace: true });
            
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
            setIsLoggingOut(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/receptionist/patients?search=${encodeURIComponent(searchValue.trim())}`);
            setSearchValue('');
        }
    };

    const handleSidebarOverlayClick = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="mg-app">
            <div className="mg-shell">
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                        onClick={handleSidebarOverlayClick}
                        aria-hidden="true"
                    />
                )}

                <aside className={`mg-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="mg-sidebar-brand">
                        <div className="mg-sidebar-brand-icon">
                            <span className="material-symbols-outlined">medical_services</span>
                        </div>
                        <div>
                            <div className="mg-sidebar-brand-title">MediGlass Portal</div>
                            <div className="mg-sidebar-brand-subtitle">Receptionist View</div>
                        </div>
                    </div>

                    <nav className="mg-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `mg-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="material-symbols-outlined mg-nav-icon">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mg-sidebar-footer">
                        <NavLink
                            to="/receptionist/settings"
                            className={({ isActive }) => `mg-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined mg-nav-icon">settings</span>
                            Settings
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="mg-nav-item"
                            disabled={isLoggingOut}
                            style={{ 
                                color: 'var(--mg-error)', 
                                width: '100%', 
                                textAlign: 'left',
                                opacity: isLoggingOut ? 0.6 : 1,
                                cursor: isLoggingOut ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <span className="material-symbols-outlined mg-nav-icon">
                                {isLoggingOut ? 'hourglass_top' : 'logout'}
                            </span>
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </aside>

                <div className="mg-main">
                    <header className="mg-header">
                        <button
                            className="mg-icon-btn lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={sidebarOpen}
                        >
                            <span className="material-symbols-outlined">
                                {sidebarOpen ? 'close' : 'menu'}
                            </span>
                        </button>

                        <form className="mg-search" onSubmit={handleSearchSubmit}>
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Search patients, doctors..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                aria-label="Search patients, doctors"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    className="text-[#424752] hover:text-[#191c1e]"
                                    onClick={() => setSearchValue('')}
                                    aria-label="Clear search"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            )}
                        </form>

                        <div className="mg-header-spacer" />

                        <button className="mg-icon-btn" aria-label="Notifications">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white" />
                        </button>

                        <button className="mg-icon-btn hidden sm:flex" aria-label="Help">
                            <span className="material-symbols-outlined">help</span>
                        </button>

                        {user?.avatar ? (
                            <img 
                                className="mg-avatar" 
                                src={user.avatar} 
                                alt={user?.name || 'User'} 
                            />
                        ) : (
                            <div 
                                className="mg-avatar flex items-center justify-center bg-[#005eb8] text-white font-bold"
                                style={{ 
                                    background: 'var(--mg-primary-container)',
                                    color: 'var(--mg-on-primary-container)',
                                    fontWeight: 700,
                                }}
                            >
                                {(user?.name || 'R')[0].toUpperCase()}
                            </div>
                        )}

                        <span className="hidden md:inline text-sm font-medium text-[#191c1e] ml-2">
                            {user?.name || 'Receptionist'}
                        </span>
                    </header>

                    <main className="mg-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistLayout;