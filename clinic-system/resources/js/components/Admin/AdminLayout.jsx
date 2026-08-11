// resources/js/components/admin/AdminLayout.jsx

import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ToastProvider } from '../shared/ToastProvider';
import '../../../css/receptionist-theme.css';

const AdminLayout = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();

    const navItems = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/admin/reports', label: 'Reports', icon: 'assessment' },
        { to: '/admin/doctors', label: 'Doctors', icon: 'medical_services' },
        { to: '/admin/patients', label: 'Patients', icon: 'people' },
        { to: '/admin/appointments', label: 'Appointments', icon: 'calendar_month' },
        { to: '/admin/receptionists', label: 'Receptionists', icon: 'person_add' },
        { to: '/admin/billing', label: 'Billing', icon: 'payments' },
    ];

    return (
        <ToastProvider>
            <div className="mg-app">
                <div className="mg-shell">
                    {sidebarOpen && (
                        <div className="mg-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
                    )}

                    <aside className={`mg-sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <div className="mg-sidebar-brand">
                            <div className="mg-sidebar-brand-icon">
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                            </div>
                            <div>
                                <div className="mg-sidebar-brand-title">MediGlass Portal</div>
                                <div className="mg-sidebar-brand-subtitle">Admin View</div>
                            </div>
                        </div>

                        <nav className="mg-nav">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => `mg-nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className="material-symbols-outlined mg-nav-icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="mg-sidebar-footer">
                            <button onClick={async () => { await logout(); }} className="mg-nav-item" style={{ color: 'var(--mg-error)' }}>
                                <span className="material-symbols-outlined mg-nav-icon">logout</span>
                                Logout
                            </button>
                        </div>
                    </aside>

                    <div className="mg-main">
                        <header className="mg-header">
                            <button
                                type="button"
                                className="mg-icon-btn mg-mobile-menu-btn"
                                aria-label="Open menu"
                                aria-expanded={sidebarOpen}
                                onClick={() => setSidebarOpen((v) => !v)}
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>

                            <div className="mg-header-spacer" />

                            <button className="mg-icon-btn" aria-label="Notifications">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>

                            {user?.avatarUrl ? (
                                <img className="mg-avatar" src={user.avatarUrl} alt={user?.name || 'Account'} />
                            ) : (
                                <div
                                    className="mg-avatar"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--mg-secondary-container)',
                                        color: 'var(--mg-primary)',
                                        fontWeight: 700,
                                    }}
                                >
                                    {(user?.name || 'A')[0].toUpperCase()}
                                </div>
                            )}
                        </header>

                        <main className="mg-content">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
};

export default AdminLayout;