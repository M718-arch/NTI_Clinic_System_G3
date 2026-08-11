// resources/js/components/receptionist/WalkInRegistration.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

/**
 * Walk-In Registration Component
 * 
 * Features:
 * - Register new walk-in patients
 * - Collect personal, health, and emergency contact info
 * - Auto-generates temporary password
 * - Shows success state with password
 * - Phase 6: Option to create invoice after registration
 * - Glassmorphism design
 */
const WalkInRegistration = () => {
    const api = receptionistApi;
    const navigate = useNavigate();
    const toast = useToast();

    // ===== STATE =====
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        blood_group: '',
        address: '',
        allergies: '',
        chronic_diseases: '',
        medical_history: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [result, setResult] = useState(null);
    const [createInvoice, setCreateInvoice] = useState(false);

    // ===== HANDLERS =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        
        try {
            // Prepare payload
            const fullName = `${form.first_name} ${form.last_name}`.trim();
            const payload = {
                name: fullName,
                email: form.email,
                phone: form.phone || undefined,
                gender: form.gender,
                date_of_birth: form.date_of_birth || undefined,
                blood_group: form.blood_group || undefined,
                address: form.address || undefined,
                allergies: form.allergies || undefined,
                chronic_diseases: form.chronic_diseases || undefined,
                medical_history: form.medical_history || undefined,
                emergency_contact_name: form.emergency_contact_name || undefined,
                emergency_contact_phone: form.emergency_contact_phone || undefined,
            };

            const response = await api.registerWalkIn(payload);
            const data = response.data || response;
            setResult(data);
            
            toast.success(`${fullName} registered successfully`);
            
            // If create invoice is checked, navigate to invoice creation
            if (createInvoice && data.patient) {
                navigate(`/receptionist/invoices/create?patient_id=${data.patient.id}`);
            }
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
                toast.error('Please check the form for errors');
            } else {
                const message = err.response?.data?.message || err.message || 'Failed to register patient';
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            gender: '',
            date_of_birth: '',
            blood_group: '',
            address: '',
            allergies: '',
            chronic_diseases: '',
            medical_history: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
        });
        setErrors({});
        setResult(null);
    };

    // ===== SUCCESS STATE =====
    if (result) {
        return (
            <div className="max-w-md mx-auto mt-8">
                <div className="glass-panel rounded-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                        {result.patient?.user?.name || 'Patient'} Registered!
                    </h2>
                    <p className="text-[#424752] mt-2">
                        Their registration is approved and they can book appointments now.
                    </p>

                    {result.generated_password && (
                        <div className="mt-4 p-4 bg-[#f2f4f6] rounded-lg text-left">
                            <label className="text-sm font-medium text-[#424752] block mb-1">
                                Temporary Password (give this to the patient)
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono bg-white px-3 py-2 rounded flex-1">
                                    {result.generated_password}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(result.generated_password);
                                        toast.success('Password copied to clipboard');
                                    }}
                                    className="p-2 rounded-lg hover:bg-black/5 transition"
                                    title="Copy password"
                                >
                                    <span className="material-symbols-outlined text-[#00478d]">content_copy</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition"
                            onClick={() => {
                                handleReset();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Register Another
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-[#00478d] text-[#00478d] hover:bg-[#00478d]/5 transition"
                            onClick={() => navigate(`/receptionist/patients/${result.patient.id}`)}
                        >
                            View Profile
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg bg-[#00478d] text-white hover:bg-[#00366e] transition"
                            onClick={() => navigate('/receptionist/patients')}
                        >
                            Back to Patients
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== MAIN FORM =====
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                    New Patient Registration
                </h2>
                <p className="text-[#424752] mt-1">
                    Walk-in intake form. Please complete all required fields.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-6">
                {/* Personal Details */}
                <section>
                    <h3 className="text-lg font-semibold text-[#00478d] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">badge</span>
                        Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="First Name"
                            name="first_name"
                            required
                            value={form.first_name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Jane"
                        />
                        <FormField
                            label="Last Name"
                            name="last_name"
                            required
                            value={form.last_name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Doe"
                        />
                        <FormField
                            label="Email Address"
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="jane.doe@example.com"
                        />
                        <FormField
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="(555) 123-4567"
                        />
                        <FormField
                            label="Date of Birth"
                            name="date_of_birth"
                            type="date"
                            value={form.date_of_birth}
                            onChange={handleChange}
                            error={errors.date_of_birth}
                        />
                        <FormSelect
                            label="Gender"
                            name="gender"
                            required
                            value={form.gender}
                            onChange={handleChange}
                            error={errors.gender}
                            options={[
                                { value: '', label: 'Select Gender' },
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                                { value: 'other', label: 'Other' },
                            ]}
                        />
                        <FormSelect
                            label="Blood Group"
                            name="blood_group"
                            value={form.blood_group}
                            onChange={handleChange}
                            error={errors.blood_group}
                            options={[
                                { value: '', label: 'Select Blood Group' },
                                { value: 'A+', label: 'A+' },
                                { value: 'A-', label: 'A-' },
                                { value: 'B+', label: 'B+' },
                                { value: 'B-', label: 'B-' },
                                { value: 'AB+', label: 'AB+' },
                                { value: 'AB-', label: 'AB-' },
                                { value: 'O+', label: 'O+' },
                                { value: 'O-', label: 'O-' },
                            ]}
                        />
                        <div className="md:col-span-2">
                            <FormField
                                label="Address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                error={errors.address}
                                placeholder="123 Medical Way, Metropolis, NY 10001"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-black/5" />

                {/* Health Information */}
                <section>
                    <h3 className="text-lg font-semibold text-[#00478d] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">health_and_safety</span>
                        Health Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <FormTextarea
                            label="Allergies"
                            name="allergies"
                            value={form.allergies}
                            onChange={handleChange}
                            error={errors.allergies}
                            placeholder="List any allergies (e.g., Penicillin, Peanuts). Leave blank if none."
                            rows={2}
                        />
                        <FormTextarea
                            label="Chronic Diseases"
                            name="chronic_diseases"
                            value={form.chronic_diseases}
                            onChange={handleChange}
                            error={errors.chronic_diseases}
                            placeholder="List any chronic conditions"
                            rows={2}
                        />
                        <FormTextarea
                            label="Medical History"
                            name="medical_history"
                            value={form.medical_history}
                            onChange={handleChange}
                            error={errors.medical_history}
                            placeholder="Previous surgeries, treatments, etc."
                            rows={2}
                        />
                    </div>
                </section>

                <hr className="border-black/5" />

                {/* Emergency Contact */}
                <section>
                    <h3 className="text-lg font-semibold text-[#00478d] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">sos</span>
                        Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Contact Name"
                            name="emergency_contact_name"
                            value={form.emergency_contact_name}
                            onChange={handleChange}
                            error={errors.emergency_contact_name}
                            placeholder="John Doe"
                        />
                        <FormField
                            label="Contact Phone"
                            name="emergency_contact_phone"
                            type="tel"
                            value={form.emergency_contact_phone}
                            onChange={handleChange}
                            error={errors.emergency_contact_phone}
                            placeholder="(555) 987-6543"
                        />
                    </div>
                </section>

                <hr className="border-black/5" />

                {/* Phase 6: Invoice Option */}
                <section>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="createInvoice"
                            checked={createInvoice}
                            onChange={(e) => setCreateInvoice(e.target.checked)}
                            className="w-4 h-4 text-[#00478d] border-[#727783]/30 rounded"
                        />
                        <label htmlFor="createInvoice" className="text-sm text-[#424752]">
                            <span className="font-medium">Create invoice after registration</span>
                            <span className="block text-xs text-[#424752]/70">
                                You'll be redirected to invoice creation with this patient pre-selected
                            </span>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-black/5">
                    <button
                        type="button"
                        className="px-6 py-2.5 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition flex items-center gap-2"
                        onClick={() => navigate('/receptionist/patients')}
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        Cancel
                    </button>
                    <button
                        type="reset"
                        className="px-6 py-2.5 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition flex items-center gap-2"
                        onClick={handleReset}
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg bg-[#00478d] text-white hover:bg-[#00366e] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save Patient
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ===== SUB-COMPONENTS =====

/**
 * Form Field Component
 */
const FormField = ({ 
    label, 
    name, 
    type = 'text', 
    required, 
    value, 
    onChange, 
    error, 
    placeholder 
}) => {
    const hasError = error && !Array.isArray(error);

    return (
        <div>
            <label className="text-sm font-medium text-[#424752] block mb-1">
                {label} {required && <span className="text-[#ba1a1a]">*</span>}
            </label>
            <input
                type={type}
                name={name}
                className={`w-full glass-input rounded-lg px-4 py-2.5 text-sm ${hasError ? 'border-[#ba1a1a]' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
            {hasError && (
                <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>
            )}
        </div>
    );
};

/**
 * Form Select Component
 */
const FormSelect = ({ 
    label, 
    name, 
    required, 
    value, 
    onChange, 
    error, 
    options 
}) => {
    const hasError = error && !Array.isArray(error);

    return (
        <div>
            <label className="text-sm font-medium text-[#424752] block mb-1">
                {label} {required && <span className="text-[#ba1a1a]">*</span>}
            </label>
            <div className="relative">
                <select
                    name={name}
                    className={`w-full glass-input rounded-lg px-4 py-2.5 text-sm appearance-none ${hasError ? 'border-[#ba1a1a]' : ''}`}
                    value={value}
                    onChange={onChange}
                    required={required}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#424752] text-[18px] pointer-events-none">
                    expand_more
                </span>
            </div>
            {hasError && (
                <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>
            )}
        </div>
    );
};

/**
 * Form Textarea Component
 */
const FormTextarea = ({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    placeholder, 
    rows = 3 
}) => {
    const hasError = error && !Array.isArray(error);

    return (
        <div>
            <label className="text-sm font-medium text-[#424752] block mb-1">
                {label}
            </label>
            <textarea
                name={name}
                className={`w-full glass-input rounded-lg px-4 py-2.5 text-sm resize-none ${hasError ? 'border-[#ba1a1a]' : ''}`}
                rows={rows}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {hasError && (
                <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>
            )}
        </div>
    );
};

export default WalkInRegistration;