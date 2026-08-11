import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

/**
 * Dashboard
 *
 * Lightweight landing page for the admin portal — pulls from the same
 * Reports overview endpoint (Phase 7) rather than duplicating queries,
 * since it's already exactly the data an admin home page wants.
 */
export default function Dashboard({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getReportsOverview()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => toast.error(e.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <div className="mg-spinner" />;
  if (!data) return <div className="mg-empty-state">Couldn't load dashboard data.</div>;

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Admin Dashboard</h1>
          <p className="mg-page-subtitle">Clinic overview at a glance.</p>
        </div>
      </div>

      <div className="mg-stat-grid">
        <StatCard label="Doctors" value={data.totals.doctors} onClick={() => navigate('/admin/doctors')} />
        <StatCard label="Patients" value={data.totals.patients} onClick={() => navigate('/admin/patients')} />
        <StatCard label="Appointments" value={data.totals.appointments} onClick={() => navigate('/admin/appointments')} />
        <StatCard label="Total Revenue" value={`$${data.revenue.total.toLocaleString()}`} onClick={() => navigate('/admin/billing')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--mg-space-md)' }}>
        <div className="mg-card">
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Appointment Status</div>
          {Object.entries(data.appointment_status).map(([status, count]) => (
            <div key={status} className="mg-flex mg-justify-between" style={{ padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ textTransform: 'capitalize' }}>{status}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="mg-card">
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Billing</div>
          <div className="mg-flex mg-justify-between" style={{ padding: '6px 0' }}>
            <span className="mg-muted">Outstanding</span>
            <strong style={{ color: 'var(--mg-error)' }}>${data.revenue.outstanding.toLocaleString()}</strong>
          </div>
          <div className="mg-flex mg-justify-between" style={{ padding: '6px 0' }}>
            <span className="mg-muted">Patients this month</span>
            <strong>{data.patients_this_month.new} new / {data.patients_this_month.returning} returning</strong>
          </div>
          <button type="button" className="mg-btn mg-btn-secondary mg-mt-sm mg-w-full" onClick={() => navigate('/admin/billing')}>
            View Billing
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, onClick }) {
  return (
    <div className="mg-card" style={{ cursor: 'pointer' }} onClick={onClick} role="button" tabIndex={0}>
      <div className="mg-stat-value">{value}</div>
      <div className="mg-stat-label">{label}</div>
    </div>
  );
}
