// resources/js/api/doctorapi.js

// Add these methods to your existing createDoctorPhase8Api function

export const createDoctorPhase8Api = (token) => {
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    return {
        // ... existing methods (getQueue, callPatient, completeConsult, etc.)

        // ----- EMR -----
        getPatientChart: (patientId) => {
            return api.get(`/doctor/patients/${patientId}/emr`, { headers });
        },
        
        getPatientProfile: (patientId) => {
            return api.get(`/doctor/patients/${patientId}`, { headers });
        },
        
        // ✅ ADD THIS - Update clinical records (doctor only)
        updateClinicalRecords: (patientId, data) => {
            return api.put(`/doctor/patients/${patientId}/clinical-records`, data, { headers });
        },
        
        // ----- Documents -----
        // ✅ ADD THIS - Get patient documents
        getDocuments: (patientId) => {
            return api.get(`/doctor/patients/${patientId}/documents`, { headers });
        },
        
        // ✅ ADD THIS - Upload document
        uploadDocument: (patientId, formData) => {
            return api.post(`/doctor/patients/${patientId}/documents`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        
        // ✅ ADD THIS - Delete document
        deleteDocument: (patientId, documentId) => {
            return api.delete(`/doctor/patients/${patientId}/documents/${documentId}`, { headers });
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
            return api.post(`/doctor/patients/${patientId}/diagnoses`, mappedPayload, { headers });
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
            return api.post(`/doctor/patients/${patientId}/lab-results`, mappedPayload, { headers });
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
            return api.post(`/doctor/patients/${patientId}/radiology-results`, mappedPayload, { headers });
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
            return api.post(`/doctor/patients/${patientId}/prescriptions`, mappedPayload, { headers });
        },
    };
};