import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../../styles/receptionist-theme.css';
import { ToastProvider } from '../shared/ToastProvider';
import UserMenu from '../shared/UserMenu';

/**
 * AdminLayout
 *
 * Same shell pattern as ReceptionistLayout (same theme CSS, same
 * ToastProvider). Nav now covers every admin page built so far:
 * Dashboard, Doctors, Patients, Receptionists, Appointments, Billing,
 * Reports.
 *
 *   <Route path="/admin" element={<AdminLayout user={user} />}>
 *     <Route index element={<Dashboard token={token} />} />
 *     <Route path="doctors" element={<Doctors token={token} />} />
 *     <Route path="patients" element={<Patients token={token} />} />
 *     <Route path="receptionists" element={<Receptionists token={token} />} />
 *     <Route path="appointments" element={<Appointments token={token} />} />
 *     <Route path="billing" element={<Billing token={token} />} />
 *     <Route path="reports" element={<Reports token={token} />} />
 *   </Route>
 */
export default function AdminLayout({ user, token, onLoggedOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', end: true, icon: IconGrid },
    { to: '/admin/doctors', label: 'Doctors', icon: IconStethoscope },
    { to: '/admin/patients', label: 'Patients', icon: IconPeople },
    { to: '/admin/receptionists', label: 'Receptionists', icon: IconBadge },
    { to: '/admin/appointments', label: 'Appointments', icon: IconCalendar },
    { to: '/admin/billing', label: 'Billing', icon: IconFile },
    { to: '/admin/reports', label: 'Reports', icon: IconChart },
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
                <IconCross />
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
                  <item.icon className="mg-nav-icon" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
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
                <IconMenu />
              </button>

              <div className="mg-header-spacer" />

              <UserMenu token={token} user={user} onLoggedOut={onLoggedOut} />
            </header>

            <main className="mg-content">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

function IconCross(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconChart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGrid({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconStethoscope({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M6 4v6a4 4 0 008 0V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="16" r="2.4" stroke="currentColor" strokeWidth="2" />
      <path d="M14 12.5V14a4 4 0 004 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconPeople({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 14.2c2.6.4 4.5 2.5 4.5 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconBadge({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 21l1.5-6h9L18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconFile({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 12h6M10 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
