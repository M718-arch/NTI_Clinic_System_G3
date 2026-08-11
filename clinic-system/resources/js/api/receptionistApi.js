// resources/js/api/receptionistApi.js

import api from './client';

/**
 * Receptionist API client
 * 
 * Handles all receptionist-related API calls including:
 * - Dashboard stats
 * - Patient management (approval, walk-in, search)
 * - Appointment management (create, reschedule, cancel, check-in)
 * - Doctor availability & schedule
 * - Invoice management (Phase 6)
 * - Profile management
 */

class ReceptionistApi {
    constructor() {
        this.basePath = '/receptionist';
    }

    // ============================================================
    // DASHBOARD
    // ============================================================
    
    /**
     * Get dashboard statistics
     * @returns {Promise} Stats including today's appointments, pending patients, etc.
     */
    getDashboardStats() {
        return api.get(`${this.basePath}/dashboard/stats`);
    }

    // ============================================================
    // PATIENTS
    // ============================================================
    
    /**
     * List all patients with optional approval status filter
     * @param {string} approvalStatus - 'pending', 'approved', 'rejected', or null for all
     * @returns {Promise} Array of patients
     */
    listPatients(approvalStatus = null) {
        const url = approvalStatus 
            ? `${this.basePath}/patients?approval_status=${approvalStatus}` 
            : `${this.basePath}/patients`;
        return api.get(url);
    }

    /**
     * Get all pending patient registrations
     * @returns {Promise} Array of pending patients
     */
    listPendingPatients() {
        return api.get(`${this.basePath}/patients/pending`);
    }

    /**
     * Search patients by name, email, or phone
     * @param {string} query - Search term
     * @returns {Promise} Array of matching patients
     */
    searchPatients(query) {
        return api.get(`${this.basePath}/patients/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Get a specific patient by ID
     * @param {number|string} id - Patient ID
     * @returns {Promise} Patient details
     */
    getPatient(id) {
        return api.get(`${this.basePath}/patients/${id}`);
    }

    /**
     * Update patient information
     * @param {number|string} id - Patient ID
     * @param {Object} payload - Patient data to update
     * @returns {Promise} Updated patient
     */
    updatePatient(id, payload) {
        return api.put(`${this.basePath}/patients/${id}`, payload);
    }

    /**
     * Approve a pending patient registration
     * @param {number|string} id - Patient ID
     * @returns {Promise} Approved patient
     */
    approvePatient(id) {
        return api.patch(`${this.basePath}/patients/${id}/approve`);
    }

    /**
     * Reject a pending patient registration
     * @param {number|string} id - Patient ID
     * @param {string} reason - Optional rejection reason
     * @returns {Promise} Rejected patient
     */
    rejectPatient(id, reason = null) {
        return api.patch(`${this.basePath}/patients/${id}/reject`, { reason });
    }

    /**
     * Register a walk-in patient
     * @param {Object} payload - Patient registration data
     * @returns {Promise} Created patient with generated password
     */
    registerWalkIn(payload) {
        return api.post(`${this.basePath}/patients/walk-in`, payload);
    }

    // ============================================================
    // APPOINTMENTS
    // ============================================================
    
    /**
     * Create a new appointment
     * @param {Object} payload - Appointment data
     * @returns {Promise} Created appointment
     */
    createAppointment(payload) {
        return api.post(`${this.basePath}/appointments`, payload);
    }

    /**
     * Reschedule an existing appointment
     * @param {number|string} bookingId - Booking ID
     * @param {Object} payload - New date/time data
     * @returns {Promise} Updated appointment
     */
    rescheduleAppointment(bookingId, payload) {
        return api.put(`${this.basePath}/appointments/${bookingId}/reschedule`, payload);
    }

    /**
     * Cancel an appointment
     * @param {number|string} bookingId - Booking ID
     * @returns {Promise} Cancelled appointment
     */
    cancelAppointment(bookingId) {
        return api.patch(`${this.basePath}/appointments/${bookingId}/cancel`);
    }

    /**
     * Check-in a patient for their appointment
     * @param {number|string} bookingId - Booking ID
     * @returns {Promise} Checked-in appointment
     */
    checkInAppointment(bookingId) {
        return api.patch(`${this.basePath}/appointments/${bookingId}/check-in`);
    }

    /**
     * Get today's schedule with optional doctor filter
     * @param {number|string} doctorId - Optional doctor ID filter
     * @returns {Promise} Today's appointments
     */
    getTodaySchedule(doctorId = null) {
        const url = doctorId 
            ? `${this.basePath}/appointments/today?doctor_id=${doctorId}` 
            : `${this.basePath}/appointments/today`;
        return api.get(url);
    }

    // ============================================================
    // DOCTORS
    // ============================================================
    
    /**
     * Get all doctors with availability status
     * @returns {Promise} Array of doctors with availability
     */
    getDoctorAvailability() {
        return api.get(`${this.basePath}/doctors/availability`);
    }

    /**
     * Get a specific doctor's schedule for a date
     * @param {number|string} doctorId - Doctor ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise} Doctor's schedule for the date
     */
    getDoctorSchedule(doctorId, date = null) {
        const url = date 
            ? `${this.basePath}/doctors/${doctorId}/schedule?date=${date}` 
            : `${this.basePath}/doctors/${doctorId}/schedule`;
        return api.get(url);
    }

    /**
     * Get a doctor's available services
     * @param {number|string} doctorId - Doctor ID
     * @returns {Promise} Array of services
     */
    listServicesForDoctor(doctorId) {
        return api.get(`${this.basePath}/doctors/${doctorId}/services`);
    }

    // ============================================================
    // INVOICES (Phase 6)
    // ============================================================
    
    /**
     * List all invoices with optional status filter
     * @param {string} status - 'pending', 'paid', or null for all
     * @returns {Promise} Array of invoices
     */
    listInvoices(status = null) {
        const url = status 
            ? `${this.basePath}/invoices?status=${status}` 
            : `${this.basePath}/invoices`;
        return api.get(url);
    }

    /**
     * Get a specific invoice by ID
     * @param {number|string} id - Invoice ID
     * @returns {Promise} Invoice details
     */
    getInvoice(id) {
        return api.get(`${this.basePath}/invoices/${id}`);
    }

    /**
     * Get receipt data for an invoice (printable view)
     * @param {number|string} id - Invoice ID
     * @returns {Promise} Receipt data
     */
    getReceipt(id) {
        return api.get(`${this.basePath}/invoices/${id}/receipt`);
    }

    /**
     * Create a new invoice
     * @param {Object} payload - Invoice data (patient_id, booking_id, amount, etc.)
     * @returns {Promise} Created invoice
     */
    createInvoice(payload) {
        return api.post(`${this.basePath}/invoices`, payload);
    }

    /**
     * Mark an invoice as paid
     * @param {number|string} id - Invoice ID
     * @param {string} paymentMethod - 'cash', 'card', 'insurance', etc.
     * @returns {Promise} Updated invoice
     */
    markInvoicePaid(id, paymentMethod) {
        return api.patch(`${this.basePath}/invoices/${id}/mark-paid`, { payment_method: paymentMethod });
    }

    /**
     * Mark an invoice as pending (unpaid)
     * @param {number|string} id - Invoice ID
     * @returns {Promise} Updated invoice
     */
    markInvoicePending(id) {
        return api.patch(`${this.basePath}/invoices/${id}/mark-pending`);
    }

    // ============================================================
    // PROFILE
    // ============================================================
    
    /**
     * Get receptionist profile
     * @returns {Promise} Profile data
     */
    getProfile() {
        return api.get(`${this.basePath}/profile`);
    }

    /**
     * Update receptionist profile
     * @param {Object} payload - Profile data to update
     * @returns {Promise} Updated profile
     */
    updateProfile(payload) {
        return api.put(`${this.basePath}/profile`, payload);
    }

    /**
     * Update receptionist password
     * @param {Object} payload - { current_password, new_password, new_password_confirmation }
     * @returns {Promise} Success message
     */
    updatePassword(payload) {
        return api.put(`${this.basePath}/password`, payload);
    }
}

// Export a singleton instance
const receptionistApi = new ReceptionistApi();

// Also export the class for testing/extension
export { ReceptionistApi };

// Default export for convenience
export default receptionistApi;