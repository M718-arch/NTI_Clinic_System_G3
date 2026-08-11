/**
 * adminApi.js
 *
 * Same fetch pattern as receptionistApi.js — see that file's header
 * comment for the token/API_BASE notes, which apply here too.
 *
 * Only wraps the Reports endpoint for now. Extend this the same way as
 * more admin API routes (doctors, patients, billing) get frontend pages.
 */

const API_BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // no body
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function createAdminApi(token) {
  const opts = (extra = {}) => ({ ...extra, token });

  return {
    // ----- Reports & Billing -----
    getReportsOverview: () => request('/admin/reports/overview', opts()),
    getBillingSummary: () => request('/admin/billing/summary', opts()),
    getInvoices: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/billing/invoices${qs ? `?${qs}` : ''}`, opts());
    },

    // ----- Doctors -----
    listDoctors: () => request('/admin/doctors', opts()),
    getDoctor: (id) => request(`/admin/doctors/${id}`, opts()),
    createDoctor: (payload) => request('/admin/doctors', opts({ method: 'POST', body: payload })),
    updateDoctor: (id, payload) => request(`/admin/doctors/${id}`, opts({ method: 'PUT', body: payload })),
    deleteDoctor: (id) => request(`/admin/doctors/${id}`, opts({ method: 'DELETE' })),

    // ----- Patients -----
    listPatients: () => request('/admin/patients', opts()),
    getPatient: (id) => request(`/admin/patients/${id}`, opts()),
    updatePatient: (id, payload) => request(`/admin/patients/${id}`, opts({ method: 'PUT', body: payload })),
    deletePatient: (id) => request(`/admin/patients/${id}`, opts({ method: 'DELETE' })),

    // ----- Receptionists -----
    listReceptionists: () => request('/admin/receptionists', opts()),
    getReceptionist: (id) => request(`/admin/receptionists/${id}`, opts()),
    createReceptionist: (payload) => request('/admin/receptionists', opts({ method: 'POST', body: payload })),
    updateReceptionist: (id, payload) => request(`/admin/receptionists/${id}`, opts({ method: 'PUT', body: payload })),
    deleteReceptionist: (id) => request(`/admin/receptionists/${id}`, opts({ method: 'DELETE' })),

    // ----- Appointments -----
    listAppointments: () => request('/admin/appointments', opts()),
    getAppointment: (id) => request(`/admin/appointments/${id}`, opts()),
    updateAppointmentStatus: (id, status) =>
      request(`/admin/appointments/${id}/status`, opts({ method: 'PATCH', body: { status } })),
    cancelAppointment: (id) =>
      request(`/admin/appointments/${id}/cancel`, opts({ method: 'PATCH' })),

    // ----- Specializations (for the doctor create/edit form) -----
    listSpecializations: () => request('/admin/specializations', opts()),
  };
}
