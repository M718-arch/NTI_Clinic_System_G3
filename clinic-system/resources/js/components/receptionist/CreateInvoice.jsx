// resources/js/components/receptionist/CreateInvoice.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

/**
 * Create Invoice Component - Phase 6
 * 
 * Create a new invoice for a patient
 * Features:
 * - Patient search/select
 * - Service selection
 * - Amount and description
 * - Link to booking (optional)
 * - Glassmorphism design
 */
const CreateInvoice = () => {
    const api = receptionistApi;
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        patient_id: searchParams.get('patient_id') || '',
        booking_id: searchParams.get('booking_id') || '',
        service_name: '',
        amount: '',
        description: '',
    });

    const [patient, setPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load patient if ID is provided
    useEffect(() => {
        if (form.patient_id) {
            loadPatient(form.patient_id);
        }
    }, [form.patient_id]);

    const loadPatient = async (id) => {
        try {
            const response = await api.getPatient(id);
            const data = response.data || response;
            setPatient(data);
            setForm(prev => ({ ...prev, patient_id: id }));
        } catch (err) {
            toast.error('Failed to load patient');
        }
    };

    const searchPatients = async () => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        try {
            const response = await api.searchPatients(searchTerm);
            const data = response.data || response || [];
            setPatients(data);
        } catch (err) {
            toast.error('Failed to search patients');
        } finally {
            setSearching(false);
        }
    };

    const selectPatient = (selected) => {
        setPatient(selected);
        setForm(prev => ({ ...prev, patient_id: selected.id }));
        setPatients([]);
        setSearchTerm('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!form.patient_id) {
            toast.error('Please select a patient');
            return;
        }
        if (!form.service_name) {
            toast.error('Please enter a service name');
            return;
        }
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                patient_id: form.patient_id,
                service_name: form.service_name,
                amount: Number(form.amount),
                description: form.description || undefined,
                booking_id: form.booking_id || undefined,
            };

            const response = await api.createInvoice(payload);
            const data = response.data || response;
            
            toast.success(`Invoice ${data.invoice_number} created successfully`);
            navigate(`/receptionist/invoices/${data.id}`);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to create invoice';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                    Create Invoice
                </h2>
                <p className="text-[#424752] mt-1">
                    Generate a new invoice for a patient
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-6">
                {/* Patient Selection */}
                <section>
                    <h3 className="text-lg font-semibold text-[#00478d] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">person</span>
                        Patient
                    </h3>

                    {patient ? (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#f2f4f6]">
                            <div>
                                <div className="font-semibold text-[#191c1e]">{patient.user?.name || patient.name}</div>
                                <div className="text-sm text-[#424752]">{patient.user?.email || patient.email}</div>
                            </div>
                            <button
                                type="button"
                                className="px-3 py-1 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition text-sm"
                                onClick={() => {
                                    setPatient(null);
                                    setForm(prev => ({ ...prev, patient_id: '' }));
                                }}
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 glass-input rounded-lg px-4 py-2.5 text-sm"
                                    placeholder="Search patient by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={searchPatients}
                                    disabled={searching}
                                    className="px-4 py-2 bg-[#00478d] text-white rounded-lg hover:bg-[#00366e] transition disabled:opacity-50"
                                >
                                    {searching ? '...' : 'Search'}
                                </button>
                            </div>

                            {patients.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-1">
                                    {patients.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2f4f6] cursor-pointer transition"
                                            onClick={() => selectPatient(p)}
                                        >
                                            <div>
                                                <div className="font-medium text-[#191c1e]">
                                                    {p.user?.name || p.name}
                                                </div>
                                                <div className="text-sm text-[#424752]">
                                                    {p.user?.email || p.email}
                                                </div>
                                            </div>
                                            <span className="text-xs text-[#424752]">
                                                {p.approval_status || 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <hr className="border-black/5" />

                {/* Invoice Details */}
                <section>
                    <h3 className="text-lg font-semibold text-[#00478d] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">receipt</span>
                        Invoice Details
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[#424752] block mb-1">
                                Service / Description <span className="text-[#ba1a1a]">*</span>
                            </label>
                            <input
                                type="text"
                                name="service_name"
                                className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                placeholder="e.g., Consultation, Lab Test, Procedure"
                                value={form.service_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#424752] block mb-1">
                                Amount <span className="text-[#ba1a1a]">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#424752]">$</span>
                                <input
                                    type="number"
                                    name="amount"
                                    className="w-full glass-input rounded-lg px-8 py-2.5 text-sm"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    value={form.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#424752] block mb-1">
                                Additional Notes
                            </label>
                            <textarea
                                name="description"
                                className="w-full glass-input rounded-lg px-4 py-2.5 text-sm resize-none"
                                rows={3}
                                placeholder="Any additional details about this invoice..."
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>

                        {form.booking_id && (
                            <div className="p-3 bg-[#f2f4f6] rounded-lg">
                                <p className="text-sm text-[#424752]">
                                    <span className="font-medium">Booking ID:</span> #{form.booking_id}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-black/5">
                    <button
                        type="button"
                        className="px-6 py-2.5 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition"
                        onClick={() => navigate('/receptionist/invoices')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg bg-[#00478d] text-white hover:bg-[#00366e] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                Create Invoice
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;