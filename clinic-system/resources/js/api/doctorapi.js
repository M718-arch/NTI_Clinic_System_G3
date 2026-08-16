// resources/js/api/doctorapi.js

import api from './client';

export const createDoctorPhase8Api = (token) => {
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    // Used for multipart/form-data requests (file uploads). The shared
    // `api` axios instance likely sets a default Content-Type of
    // application/json — axios merges that default into every request's
    // headers unless a request explicitly overrides the key. Setting
    // Content-Type to `undefined` here (not omitting it, actually setting
    // it to undefined) clears that inherited default, so axios detects
    // the FormData body itself and generates the correct
    // "multipart/form-data; boundary=..." header. Without this, the
    // request goes out labeled as JSON while the body is actually
    // multipart, and PHP can't parse any of the fields out of it —
    // which is exactly the "document field is required" symptom.
    const uploadHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': undefined,
    };

    return {
        // ----- Queue -----
        getQueue: () => {
            return api.get('/doctor/queue', { headers }).then((res) => res.data);
        },

        callPatient: (bookingId) => {
            return api.patch(`/doctor/queue/${bookingId}/call`, {}, { headers }).then((res) => res.data);
        },

        completeConsult: (bookingId) => {
            return api.patch(`/doctor/queue/${bookingId}/complete`, {}, { headers }).then((res) => res.data);
        },

        // ----- EMR -----
        getPatientChart: (patientId) => {
            return api.get(`/doctor/patients/${patientId}/emr`, { headers }).then((res) => res.data);
        },

        getPatientProfile: (patientId) => {
            return api.get(`/doctor/patients/${patientId}`, { headers }).then((res) => res.data);
        },

        // Update clinical records (doctor only)
        updateClinicalRecords: (patientId, data) => {
            return api.put(`/doctor/patients/${patientId}/clinical-records`, data, { headers }).then((res) => res.data);
        },

        // ----- Documents -----
        getDocuments: (patientId) => {
            return api.get(`/doctor/patients/${patientId}/documents`, { headers }).then((res) => res.data);
        },

        uploadDocument: (patientId, formData) => {
            return api
                .post(`/doctor/patients/${patientId}/documents`, formData, { headers: uploadHeaders })
                .then((res) => res.data);
        },

        deleteDocument: (patientId, documentId) => {
            return api
                .delete(`/doctor/patients/${patientId}/documents/${documentId}`, { headers })
                .then((res) => res.data);
        },

        // ----- Diagnoses -----
        addDiagnosis: (patientId, payload) => {
            const mappedPayload = {
                title: payload.title || payload.condition,
                icd_code: payload.icd_code,
                description: payload.description || payload.notes,
                diagnosed_date: payload.diagnosed_date || payload.diagnosed_at,
                booking_id: payload.booking_id,
            };
            return api.post(`/doctor/patients/${patientId}/diagnoses`, mappedPayload, { headers }).then((res) => res.data);
        },

        // ----- Lab Results -----
        addLabResult: (patientId, payload) => {
            const mappedPayload = {
                test_name: payload.test_name,
                result: payload.result,
                unit: payload.unit,
                reference_range: payload.reference_range,
                interpretation: payload.interpretation,
                result_date: payload.result_date || payload.performed_at,
                notes: payload.notes,
                booking_id: payload.booking_id,
            };
            return api.post(`/doctor/patients/${patientId}/lab-results`, mappedPayload, { headers }).then((res) => res.data);
        },

        // ----- Radiology -----
        addRadiologyResult: (patientId, payload) => {
            const mappedPayload = {
                imaging_type: payload.imaging_type || payload.study_type,
                body_area: payload.body_area,
                findings: payload.findings,
                impression: payload.impression,
                result_date: payload.result_date || payload.performed_at,
                notes: payload.notes,
                booking_id: payload.booking_id,
            };
            return api.post(`/doctor/patients/${patientId}/radiology-results`, mappedPayload, { headers }).then((res) => res.data);
        },

        // ----- Prescriptions -----
        addPrescription: (patientId, payload) => {
            const mappedPayload = {
                medicine: payload.medicine,
                dose: payload.dose,
                frequency: payload.frequency,
                duration: payload.duration,
                notes: payload.notes,
                booking_id: payload.booking_id,
            };
            return api.post(`/doctor/patients/${patientId}/prescriptions`, mappedPayload, { headers }).then((res) => res.data);
        },
    };
};