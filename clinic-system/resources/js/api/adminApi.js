// resources/js/api/adminApi.js

const API_BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
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
    // no body
  }

  if (!res.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (res.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
    
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
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

    // ----- Specializations -----
    listSpecializations: () => request('/admin/specializations', opts()),
  };
}

// Don't create instance with token at module load - get it dynamically
const adminApi = createAdminApi();
export default adminApi;