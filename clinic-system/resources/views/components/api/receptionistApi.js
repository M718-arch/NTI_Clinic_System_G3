/**
 * receptionistApi.js
 *
 * Thin fetch wrapper around the Phase 5 receptionist endpoints
 * (routes/api.php, prefix `/api/receptionist`). Assumes Laravel Sanctum
 * token auth — the token is passed in explicitly rather than read from
 * localStorage/sessionStorage, since where that token lives (memory,
 * cookie, context) depends on how the rest of your app already handles
 * auth. Wire `getToken` up to however AuthenticatedSessionController's
 * token is currently stored in your app.
 *
 * Adjust API_BASE if your app is served from a different origin than
 * the Laravel API.
 */

const API_BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // Some endpoints (e.g. 204s) may have no body.
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
}

export function createReceptionistApi(token) {
  const opts = (extra = {}) => ({ ...extra, token });

  return {
    // ----- Profile -----
    getProfile: () => request('/receptionist/profile', opts()),
    updateProfile: (payload) =>
      request('/receptionist/profile', opts({ method: 'PUT', body: payload })),
    updatePassword: (payload) =>
      request('/receptionist/password', opts({ method: 'PUT', body: payload })),

    // ----- Dashboard -----
    getDashboardStats: () => request('/receptionist/dashboard/stats', opts()),

    // ----- Patients -----
    listPatients: (approvalStatus) =>
      request(
        `/receptionist/patients${approvalStatus ? `?approval_status=${approvalStatus}` : ''}`,
        opts()
      ),
    listPendingPatients: () => request('/receptionist/patients/pending', opts()),
    searchPatients: (q) =>
      request(`/receptionist/patients/search?q=${encodeURIComponent(q)}`, opts()),
    getPatient: (id) => request(`/receptionist/patients/${id}`, opts()),
    updatePatient: (id, payload) =>
      request(`/receptionist/patients/${id}`, opts({ method: 'PUT', body: payload })),
    approvePatient: (id) =>
      request(`/receptionist/patients/${id}/approve`, opts({ method: 'PATCH' })),
    rejectPatient: (id, reason) =>
      request(`/receptionist/patients/${id}/reject`, opts({ method: 'PATCH', body: { reason } })),
    registerWalkIn: (payload) =>
      request('/receptionist/patients/walk-in', opts({ method: 'POST', body: payload })),

    // ----- Appointments -----
    createAppointment: (payload) =>
      request('/receptionist/appointments', opts({ method: 'POST', body: payload })),
    rescheduleAppointment: (bookingId, payload) =>
      request(`/receptionist/appointments/${bookingId}/reschedule`, opts({ method: 'PUT', body: payload })),
    cancelAppointment: (bookingId) =>
      request(`/receptionist/appointments/${bookingId}/cancel`, opts({ method: 'PATCH' })),
    checkInAppointment: (bookingId) =>
      request(`/receptionist/appointments/${bookingId}/check-in`, opts({ method: 'PATCH' })),
    getTodaySchedule: (doctorId) =>
      request(`/receptionist/appointments/today${doctorId ? `?doctor_id=${doctorId}` : ''}`, opts()),

    // ----- Doctors -----
    getDoctorAvailability: () => request('/receptionist/doctors/availability', opts()),
    getDoctorSchedule: (doctorId, date) =>
      request(`/receptionist/doctors/${doctorId}/schedule${date ? `?date=${date}` : ''}`, opts()),

    // ----- Services (for the booking form's service picker) -----
    listServicesForDoctor: (doctorId) =>
      request(`/receptionist/doctors/${doctorId}/services`, opts()),
  };
}
