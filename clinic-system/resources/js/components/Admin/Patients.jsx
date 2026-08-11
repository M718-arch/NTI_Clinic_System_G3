import React, { useEffect, useState, useCallback } from 'react';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

/**
 * Patients
 *
 * Admin's view here is edit + activate/deactivate — approve/reject of
 * new registrations stays a receptionist action (Phase 5), not
 * duplicated here. Approval status is shown for visibility/filtering
 * only: AdminPatientController::update's validated fields don't include
 * approval_status, so this page can't override it. If you want admin to
 * be able to reverse a mistaken rejection, add approval_status to that
 * controller's validation array first — this UI doesn't expose an edit
 * control for it since the backend would silently ignore it.
 */
export default function Patients({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();

  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPatients(await api.listPatients());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter ? patients.filter((p) => p.approval_status === filter) : patients;

  function openEdit(patient) {
    setForm({
      name: patient.user?.name || '',
      email: patient.user?.email || '',
      phone: patient.phone || '',
      gender: patient.gender || '',
      date_of_birth: patient.date_of_birth || '',
      blood_group: patient.blood_group || '',
      address: patient.address || '',
      status: patient.status,
    });
    setEditing(patient);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      await api.updatePatient(editing.id, payload);
      toast.success('Patient updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(patient) {
    if (!window.confirm(`Delete ${patient.user?.name}? This can't be undone.`)) return;
    try {
      await api.deletePatient(patient.id);
      toast.success('Patient deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Patients</h1>
          <p className="mg-page-subtitle">View and manage patient accounts.</p>
        </div>
      </div>

      <div className="mg-flex mg-gap-md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 'var(--mg-space-md)' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            style={{
              background: 'none', border: 'none', padding: '10px 4px', marginBottom: -1,
              borderBottom: filter === f.key ? '2px solid var(--mg-primary)' : '2px solid transparent',
              color: filter === f.key ? 'var(--mg-primary)' : 'var(--mg-on-surface-variant)',
              fontWeight: filter === f.key ? 700 : 500, cursor: 'pointer', fontSize: 15,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mg-card-flat">
        {loading ? (
          <div className="mg-spinner" />
        ) : filtered.length === 0 ? (
          <div className="mg-empty-state">No patients found.</div>
        ) : (
          <table className="mg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Approval</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.user?.name}</td>
                  <td>
                    <div>{p.user?.email}</div>
                    <div className="mg-muted mg-text-sm">{p.phone || '—'}</div>
                  </td>
                  <td><ApprovalBadge status={p.approval_status} /></td>
                  <td>
                    <span className={`mg-badge ${p.status ? 'mg-badge-completed' : 'mg-badge-cancelled'}`}>
                      {p.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mg-flex mg-gap-xs">
                      <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button type="button" className="mg-btn mg-btn-danger-outline mg-btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Edit {editing.user?.name}</div>
          <form onSubmit={handleSubmit}>
            <div className="mg-form-grid-2">
              <Field label="Name"><input className="mg-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Email"><input type="email" className="mg-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone"><input className="mg-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Gender">
                <select className="mg-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
              <Field label="Date of Birth"><input type="date" className="mg-input" value={form.date_of_birth || ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
              <Field label="Blood Group"><input className="mg-input" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} /></Field>
            </div>
            <div className="mg-field mg-mt-sm">
              <label className="mg-label">Address</label>
              <input className="mg-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <label className="mg-flex mg-items-center mg-gap-xs mg-mt-sm" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={!!form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
              <span className="mg-text-sm">Account active</span>
            </label>
            <div className="mg-flex mg-gap-xs mg-mt-md" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="mg-btn mg-btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="mg-btn mg-btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ApprovalBadge({ status }) {
  const map = {
    pending: { className: 'mg-badge-pending', label: 'Pending' },
    approved: { className: 'mg-badge-completed', label: 'Approved' },
    rejected: { className: 'mg-badge-cancelled', label: 'Rejected' },
  };
  const cfg = map[status] || map.pending;
  return <span className={`mg-badge ${cfg.className}`}>{cfg.label}</span>;
}

function Field({ label, children }) {
  return (
    <div className="mg-field">
      <label className="mg-label">{label}</label>
      {children}
    </div>
  );
}

function Modal({ children, onClose, width = 480 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}
      onClick={onClose}
    >
      <div className="mg-card" style={{ width, background: '#fff', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
