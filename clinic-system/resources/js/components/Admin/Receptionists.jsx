import React, { useEffect, useState, useCallback } from 'react';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

const emptyForm = { name: '', email: '', password: '', first_name: '', last_name: '', phone: '' };

export default function Receptionists({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList(await api.listReceptionists());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  }

  function openEdit(r) {
    setForm({
      name: r.user?.name || '', email: r.user?.email || '', password: '',
      first_name: r.first_name || '', last_name: r.last_name || '', phone: r.phone || '',
    });
    setModal({ mode: 'edit', receptionist: r });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      if (modal.mode === 'create') {
        await api.createReceptionist(payload);
        toast.success('Receptionist created');
      } else {
        await api.updateReceptionist(modal.receptionist.id, payload);
        toast.success('Receptionist updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(r) {
    try {
      await api.updateReceptionist(r.id, { status: !r.status });
      toast.success(`${r.user?.name} ${!r.status ? 'activated' : 'deactivated'}`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete(r) {
    if (!window.confirm(`Delete ${r.user?.name}? This can't be undone.`)) return;
    try {
      await api.deleteReceptionist(r.id);
      toast.success('Receptionist deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Receptionists</h1>
          <p className="mg-page-subtitle">Manage front-desk staff accounts.</p>
        </div>
        <button type="button" className="mg-btn mg-btn-primary" onClick={openCreate}>+ Add Receptionist</button>
      </div>

      <div className="mg-card-flat">
        {loading ? (
          <div className="mg-spinner" />
        ) : list.length === 0 ? (
          <div className="mg-empty-state">No receptionists yet.</div>
        ) : (
          <table className="mg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.full_name || r.user?.name}</td>
                  <td>{r.user?.email}</td>
                  <td>{r.phone || '—'}</td>
                  <td>
                    <span className={`mg-badge ${r.status ? 'mg-badge-completed' : 'mg-badge-cancelled'}`}>
                      {r.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mg-flex mg-gap-xs">
                      <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => toggleStatus(r)}>
                        {r.status ? 'Deactivate' : 'Activate'}
                      </button>
                      <button type="button" className="mg-btn mg-btn-danger-outline mg-btn-sm" onClick={() => handleDelete(r)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
            {modal.mode === 'create' ? 'Add Receptionist' : 'Edit Receptionist'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mg-form-grid-2">
              <Field label="Full Name (account)" required>
                <input className="mg-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Email" required>
                <input type="email" className="mg-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </Field>
              <Field label={modal.mode === 'create' ? 'Password' : 'New Password (optional)'} required={modal.mode === 'create'}>
                <input type="password" className="mg-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={modal.mode === 'create'} minLength={8} />
              </Field>
              <Field label="Phone">
                <input className="mg-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="First Name">
                <input className="mg-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </Field>
              <Field label="Last Name">
                <input className="mg-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </Field>
            </div>
            <div className="mg-flex mg-gap-xs mg-mt-md" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="mg-btn mg-btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="mg-btn mg-btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : modal.mode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="mg-field">
      <label className="mg-label">{label} {required && <span style={{ color: 'var(--mg-error)' }}>*</span>}</label>
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
