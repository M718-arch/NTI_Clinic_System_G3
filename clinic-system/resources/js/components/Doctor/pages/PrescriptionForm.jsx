// resources/js/components/doctor/PrescriptionForm.jsx

import React, { useState } from 'react';
import { createDoctorPhase8Api } from "../../../api/doctorapi";

const PrescriptionForm = ({ patientId, token, onSuccess }) => {
    const api = createDoctorPhase8Api(token);

    const [form, setForm] = useState({
        medicine: '',
        dose: '',
        frequency: '',
        duration: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await api.addPrescription(patientId, form);
            setSuccess('Prescription created successfully. Patient notified.');
            setForm({ medicine: '', dose: '', frequency: '', duration: '', notes: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel rounded-xl p-5">
            <h3 className="text-base font-semibold text-[#252f43] flex items-center gap-2 border-b border-white/20 pb-3 mb-4">
                <span className="material-symbols-outlined text-[#006382]">medication</span>
                New Prescription
            </h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="text-sm font-medium text-[#525b72] block mb-1">Medicine *</label>
                    <input
                        type="text"
                        className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                        value={form.medicine}
                        onChange={(e) => setForm({ ...form, medicine: e.target.value })}
                        required
                        placeholder="e.g., Amoxicillin"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Dose *</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={form.dose}
                            onChange={(e) => setForm({ ...form, dose: e.target.value })}
                            required
                            placeholder="e.g., 500mg"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Frequency *</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={form.frequency}
                            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                            required
                            placeholder="e.g., Three times daily"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-[#525b72] block mb-1">Duration *</label>
                    <input
                        type="text"
                        className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        required
                        placeholder="e.g., 7 days"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-[#525b72] block mb-1">Notes</label>
                    <textarea
                        className="w-full glass-input rounded-lg px-4 py-2 text-sm resize-none"
                        rows={2}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Additional instructions for the patient..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#006382] text-white rounded-lg hover:bg-[#00506a] transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <span className="animate-spin">⟳</span>
                    ) : (
                        <span className="material-symbols-outlined text-[18px]">medication</span>
                    )}
                    {loading ? 'Creating...' : 'Create Prescription'}
                </button>
            </form>
        </div>
    );
};

export default PrescriptionForm;