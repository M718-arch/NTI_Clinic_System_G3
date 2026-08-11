import React, { useEffect, useState, useCallback } from 'react';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

const emptyForm = {
  name: '', email: '', password: '', specialization_id: '', gender: '',
  date_of_birth: '', experience_years: '', consultation_fee: '', address: '', bio: '',
};

export default function Doctors({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', doctor? }
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, specs] = await Promise.all([api.listDoctors(), api.listSpecializations()]);
      setDoctors(docs);
      setSpecializations(specs);
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

  function openEdit(doctor) {
    setForm({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      password: '',
      specialization_id: doctor.specialization_id || '',
      gender: doctor.gender || '',
      date_of_birth: doctor.date_of_birth || '',
      experience_years: doctor.experience_years ?? '',
      consultation_fee: doctor.consultation_fee ?? '',
      address: doctor.address || '',
      bio: doctor.bio || '',
    });
    setModal({ mode: 'edit', doctor });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Laravel's `nullable` validation rule only skips validation for an
      // actual null, not an empty string — an empty date_of_birth would
      // otherwise 422 against `nullable|date`. Strip blanks so optional
      // fields are omitted rather than sent as "".
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '')
      );

      if (modal.mode === 'create') {
        await api.createDoctor(payload);
        toast.success('Doctor created');
      } else {
        await api.updateDoctor(modal.doctor.id, payload);
        toast.success('Doctor updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(doctor) {
    try {
      await api.updateDoctor(doctor.id, { status: !doctor.status });
      toast.success(`${doctor.full_name || doctor.user?.name} ${!doctor.status ? 'activated' : 'deactivated'}`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete(doctor) {
    if (!window.confirm(`Delete Dr. ${doctor.full_name || doctor.user?.name}? This can't be undone.`)) return;
    try {
      await api.deleteDoctor(doctor.id);
      toast.success('Doctor deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Doctors</h1>
          <p className="mg-page-subtitle">Manage doctor accounts and profiles.</p>
        </div>
        <button type="button" className="mg-btn mg-btn-primary" onClick={openCreate}>+ Add Doctor</button>
      </div>

      <div className="mg-card-flat">
        {loading ? (
          <div className="mg-spinner" />
        ) : doctors.length === 0 ? (
          <div className="mg-empty-state">No doctors yet.</div>
        ) : (
          <table className="mg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>Dr. {d.full_name || d.user?.name}</td>
                  <td>{d.specialization?.name || '—'}</td>
                  <td>{d.user?.email}</td>
                  <td>{d.experience_years ?? 0} yrs</td>
                  <td>${d.consultation_fee ?? 0}</td>
                  <td>
                    <span className={`mg-badge ${d.status ? 'mg-badge-completed' : 'mg-badge-cancelled'}`}>
                      {d.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mg-flex mg-gap-xs">
                      <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => toggleStatus(d)}>
                        {d.status ? 'Deactivate' : 'Activate'}
                      </button>
                      <button type="button" className="mg-btn mg-btn-danger-outline mg-btn-sm" onClick={() => handleDelete(d)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)} width={520}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
            {modal.mode === 'create' ? 'Add Doctor' : 'Edit Doctor'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mg-form-grid-2">
              <Field label="Full Name" required>
                <input className="mg-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Email" required>
                <input type="email" className="mg-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </Field>
              <Field label={modal.mode === 'create' ? 'Password' : 'New Password (optional)'} required={modal.mode === 'create'}>
                <input type="password" className="mg-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={modal.mode === 'create'} minLength={8} />
              </Field>
              <Field label="Specialization" required>
                <select className="mg-select" value={form.specialization_id} onChange={(e) => setForm({ ...form, specialization_id: e.target.value })} required>
                  <option value="">Select...</option>
                  {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Gender" required>
                <select className="mg-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" className="mg-input" value={form.date_of_birth || ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </Field>
              <Field label="Experience (years)">
                <input type="number" min="0" className="mg-input" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
              </Field>
              <Field label="Consultation Fee ($)">
                <input type="number" min="0" step="0.01" className="mg-input" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} />
              </Field>
            </div>
            <div className="mg-field mg-mt-sm">
              <label className="mg-label">Address</label>
              <input className="mg-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="mg-field mg-mt-sm">
              <label className="mg-label">Bio</label>
              <textarea className="mg-textarea" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="mg-flex mg-gap-xs mg-mt-md" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="mg-btn mg-btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="mg-btn mg-btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : modal.mode === 'create' ? 'Create Doctor' : 'Save Changes'}
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

function Modal({ children, onClose, width = 420 }) {
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
