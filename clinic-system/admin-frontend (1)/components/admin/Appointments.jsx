import React, { useEffect, useState, useCallback } from 'react';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function Appointments({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await api.listAppointments());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings;

  async function handleStatusChange(booking, status) {
    setActioningId(booking.id);
    try {
      await api.updateAppointmentStatus(booking.id, status);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status } : b)));
      toast.success('Status updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleCancel(booking) {
    if (!window.confirm('Cancel this appointment?')) return;
    setActioningId(booking.id);
    try {
      await api.cancelAppointment(booking.id);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b)));
      toast.success('Appointment cancelled');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Appointments</h1>
          <p className="mg-page-subtitle">All appointments across the clinic.</p>
        </div>
      </div>

      <div className="mg-card-flat mg-flex mg-items-center mg-gap-sm" style={{ marginBottom: 'var(--mg-space-md)' }}>
        <select className="mg-select" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span className="mg-muted mg-text-sm">{filtered.length} appointment(s)</span>
      </div>

      <div className="mg-card-flat">
        {loading ? (
          <div className="mg-spinner" />
        ) : filtered.length === 0 ? (
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
                  <td>{b.date} <span className="mg-muted mg-text-sm">{b.time}</span></td>
                  <td>{b.patient?.user?.name || b.patient?.name || '—'}</td>
                  <td>{b.service?.doctor?.name || '—'}</td>
                  <td>{b.service?.name || '—'}</td>
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
