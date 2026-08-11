// resources/js/components/doctor/DoctorEmrForm.jsx

import React, { useState } from 'react';
import { createDoctorPhase8Api } from "../../../api/doctorapi";
const DoctorEmrForm = ({ patientId, token, onSuccess }) => {
    const api = createDoctorPhase8Api(token);
    
    const [activeTab, setActiveTab] = useState('diagnosis');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Diagnosis Form
    const [diagnosisForm, setDiagnosisForm] = useState({
        condition: '',
        icd_code: '',
        diagnosed_at: '',
        notes: '',
    });

    // Lab Result Form
    const [labForm, setLabForm] = useState({
        test_name: '',
        result: '',
        reference_range: '',
        interpretation: '',
        performed_at: '',
    });

    // Radiology Result Form
    const [radiologyForm, setRadiologyForm] = useState({
        study_type: '',
        findings: '',
        impression: '',
        performed_at: '',
    });

    const handleDiagnosisSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await api.addDiagnosis(patientId, diagnosisForm);
            setSuccess('Diagnosis added successfully');
            setDiagnosisForm({ condition: '', icd_code: '', diagnosed_at: '', notes: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLabSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await api.addLabResult(patientId, labForm);
            setSuccess('Lab result added successfully');
            setLabForm({ test_name: '', result: '', reference_range: '', interpretation: '', performed_at: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRadiologySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await api.addRadiologyResult(patientId, radiologyForm);
            setSuccess('Radiology result added successfully');
            setRadiologyForm({ study_type: '', findings: '', impression: '', performed_at: '' });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'diagnosis', label: 'Diagnosis' },
        { key: 'lab', label: 'Lab Result' },
        { key: 'radiology', label: 'Radiology' },
    ];

    return (
        <div className="glass-panel rounded-xl p-5">
            <h3 className="text-base font-semibold text-[#252f43] flex items-center gap-2 border-b border-white/20 pb-3 mb-4">
                <span className="material-symbols-outlined text-[#006382]">clinical_notes</span>
                Add EMR Record
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/20 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-2 px-3 text-sm transition ${
                            activeTab === tab.key
                                ? 'text-[#006382] font-semibold border-b-2 border-[#006382]'
                                : 'text-[#525b72] hover:text-[#006382]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

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

            {/* Diagnosis Form */}
            {activeTab === 'diagnosis' && (
                <form onSubmit={handleDiagnosisSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Condition *</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={diagnosisForm.condition}
                            onChange={(e) => setDiagnosisForm({ ...diagnosisForm, condition: e.target.value })}
                            required
                            placeholder="e.g., Hypertension"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">ICD Code</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={diagnosisForm.icd_code}
                            onChange={(e) => setDiagnosisForm({ ...diagnosisForm, icd_code: e.target.value })}
                            placeholder="e.g., I10"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Date Diagnosed</label>
                        <input
                            type="date"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={diagnosisForm.diagnosed_at}
                            onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosed_at: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Notes</label>
                        <textarea
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm resize-none"
                            rows={2}
                            value={diagnosisForm.notes}
                            onChange={(e) => setDiagnosisForm({ ...diagnosisForm, notes: e.target.value })}
                            placeholder="Additional notes..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-[#006382] text-white rounded-lg hover:bg-[#00506a] transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Add Diagnosis'}
                    </button>
                </form>
            )}

            {/* Lab Result Form */}
            {activeTab === 'lab' && (
                <form onSubmit={handleLabSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Test Name *</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={labForm.test_name}
                            onChange={(e) => setLabForm({ ...labForm, test_name: e.target.value })}
                            required
                            placeholder="e.g., Complete Blood Count"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Result</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={labForm.result}
                            onChange={(e) => setLabForm({ ...labForm, result: e.target.value })}
                            placeholder="e.g., Normal"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Reference Range</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={labForm.reference_range}
                            onChange={(e) => setLabForm({ ...labForm, reference_range: e.target.value })}
                            placeholder="e.g., 4.5-11.0"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Interpretation</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={labForm.interpretation}
                            onChange={(e) => setLabForm({ ...labForm, interpretation: e.target.value })}
                            placeholder="e.g., Within normal limits"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Date Performed</label>
                        <input
                            type="date"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={labForm.performed_at}
                            onChange={(e) => setLabForm({ ...labForm, performed_at: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-[#006382] text-white rounded-lg hover:bg-[#00506a] transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Add Lab Result'}
                    </button>
                </form>
            )}

            {/* Radiology Result Form */}
            {activeTab === 'radiology' && (
                <form onSubmit={handleRadiologySubmit} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Study Type *</label>
                        <input
                            type="text"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={radiologyForm.study_type}
                            onChange={(e) => setRadiologyForm({ ...radiologyForm, study_type: e.target.value })}
                            required
                            placeholder="e.g., Chest X-Ray"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Findings</label>
                        <textarea
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm resize-none"
                            rows={2}
                            value={radiologyForm.findings}
                            onChange={(e) => setRadiologyForm({ ...radiologyForm, findings: e.target.value })}
                            placeholder="Radiology findings..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Impression</label>
                        <textarea
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm resize-none"
                            rows={2}
                            value={radiologyForm.impression}
                            onChange={(e) => setRadiologyForm({ ...radiologyForm, impression: e.target.value })}
                            placeholder="Clinical impression..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[#525b72] block mb-1">Date Performed</label>
                        <input
                            type="date"
                            className="w-full glass-input rounded-lg px-4 py-2 text-sm"
                            value={radiologyForm.performed_at}
                            onChange={(e) => setRadiologyForm({ ...radiologyForm, performed_at: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-[#006382] text-white rounded-lg hover:bg-[#00506a] transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Add Radiology Result'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default DoctorEmrForm;