// resources/js/components/admin/Appointments.jsx
import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../api/adminApi'; // Use the default export instead of createAdminApi
import { useToast } from '../shared/ToastProvider';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function Appointments() { // Remove { token } prop
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.listAppointments();
      const data = response.data || response;
      setBookings(data);
    } catch (e) {
      toast.error(e.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings;

  async function handleStatusChange(booking, status) {
    setActioningId(booking.id);
    try {
      await adminApi.updateAppointmentStatus(booking.id, status);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status } : b)));
      toast.success('Status updated');
    } catch (e) {
      toast.error(e.message || 'Failed to update status');
    } finally {
      setActioningId(null);
    }
  }

  async function handleCancel(booking) {
    if (!window.confirm('Cancel this appointment?')) return;
    setActioningId(booking.id);
    try {
      await adminApi.cancelAppointment(booking.id);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b)));
      toast.success('Appointment cancelled');
    } catch (e) {
      toast.error(e.message || 'Failed to cancel appointment');
    } finally {
      setActioningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="mg-spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Appointments</h1>
          <p className="mg-page-subtitle">All appointments across the clinic.</p>
        </div>
        <button className="mg-btn mg-btn-outline" onClick={load}>
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      <div className="mg-card-flat mg-flex mg-items-center mg-gap-sm" style={{ marginBottom: 'var(--mg-space-md)' }}>
        <select className="mg-select" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span className="mg-muted mg-text-sm">{filtered.length} appointment(s)</span>
      </div>

      <div className="mg-card-flat">
        {filtered.length === 0 ? (
          <div className="mg-empty-state">No appointments found.</div>
        ) : (
          <table className="mg-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Service</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.date} <span className="mg-muted mg-text-sm">{b.time?.substring(0,5) || ''}</span></td>
                  <td>{b.patient_name || b.patient?.user?.name || b.patient?.name || '—'}</td>
                  <td>{b.doctor_name || b.service?.doctor?.name || '—'}</td>
                  <td>{b.service_name || b.service?.name || '—'}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    <div className="mg-flex mg-gap-xs">
                      <select
                        className="mg-select mg-btn-sm"
                        style={{ padding: '4px 8px', fontSize: 13 }}
                        value={b.status}
                        disabled={actioningId === b.id || b.status === 'cancelled'}
                        onChange={(e) => handleStatusChange(b, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      {b.status !== 'cancelled' && (
                        <button
                          type="button"
                          className="mg-btn mg-btn-danger-outline mg-btn-sm"
                          disabled={actioningId === b.id}
                          onClick={() => handleCancel(b)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'mg-badge-pending',
    confirmed: 'mg-badge-confirmed',
    completed: 'mg-badge-completed',
    cancelled: 'mg-badge-cancelled',
  };
  return <span className={`mg-badge ${map[status] || 'mg-badge-pending'}`}>{status}</span>;
}