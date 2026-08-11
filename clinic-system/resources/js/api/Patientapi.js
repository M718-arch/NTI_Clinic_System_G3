/**
 * patientPhase8Api.js
 *
 * Same pattern as doctorPhase8Api.js — only wraps the new Phase 8
 * patient endpoints (EMR view, prescriptions view, notifications).
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
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function createPatientPhase8Api(token) {
  const opts = (extra = {}) => ({ ...extra, token });

  return {
    getEmr: () => request('/patient/emr', opts()),
    listPrescriptions: () => request('/patient/prescriptions', opts()),
    getPrescription: (id) => request(`/patient/prescriptions/${id}`, opts()),

    listNotifications: () => request('/patient/notifications', opts()),
    markNotificationRead: (id) => request(`/patient/notifications/${id}/read`, opts({ method: 'POST' })),
    markAllNotificationsRead: () => request('/patient/notifications/read-all', opts({ method: 'POST' })),
  };
}
