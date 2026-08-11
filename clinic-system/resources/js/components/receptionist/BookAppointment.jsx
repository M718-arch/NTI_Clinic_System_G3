// resources/js/components/receptionist/BookAppointment.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';

/**
 * BookAppointment Component
 * 
 * Three-step appointment booking flow:
 * 1. Select/register patient
 * 2. Choose provider and service
 * 3. Select date and time
 * 
 * Features:
 * - Patient search with approval status display
 * - Walk-in patient registration redirect
 * - Doctor availability checking
 * - Service selection based on doctor
 * - Summary sidebar with booking details
 * - Success state with navigation options
 * - Phase 6: Invoice creation option after booking
 */
const BookAppointment = () => {
    const navigate = useNavigate();

    // ===== STATE =====
    const [patientQuery, setPatientQuery] = useState('');
    const [patientResults, setPatientResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [createInvoice, setCreateInvoice] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [bookingData, setBookingData] = useState(null);

    // ===== EFFECTS =====
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await receptionistApi.getDoctorAvailability();
                const data = response.data || response || [];
                setDoctors(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load doctors');
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (!selectedDoctorId) {
            setServices([]);
            setSelectedServiceId('');
            return;
        }
        
        const fetchServices = async () => {
            try {
                const response = await receptionistApi.listServicesForDoctor(selectedDoctorId);
                const data = response.data || response || [];
                setServices(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load services');
            }
        };
        fetchServices();
    }, [selectedDoctorId]);

    // ===== HANDLERS =====
    const handlePatientSearch = async (e) => {
        e.preventDefault();
        if (!patientQuery.trim()) return;
        
        setSearching(true);
        setError(null);
        
        try {
            const response = await receptionistApi.searchPatients(patientQuery.trim());
            const results = response.data || response || [];
            setPatientResults(results);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Patient search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleConfirm = async () => {
        if (!canConfirm) return;
        
        setSubmitting(true);
        setError(null);
        
        try {
            // Create the appointment
            const bookingResponse = await receptionistApi.createAppointment({
                patient_id: selectedPatient.id,
                service_id: selectedServiceId,
                date,
                time,
                notes: notes || undefined,
            });
            
            const booking = bookingResponse.data || bookingResponse;
            setBookingData(booking);
            
            // If create invoice is checked, create an invoice
            if (createInvoice && booking) {
                const service = services.find(s => String(s.id) === String(selectedServiceId));
                const invoicePayload = {
                    patient_id: selectedPatient.id,
                    booking_id: booking.id,
                    doctor_id: selectedDoctorId,
                    service_name: service?.name || 'Consultation',
                    amount: service?.price || 0,
                    description: `Appointment on ${date} at ${time}${notes ? ` - ${notes}` : ''}`,
                };
                
                try {
                    const invoiceResponse = await receptionistApi.createInvoice(invoicePayload);
                    booking.invoice = invoiceResponse.data || invoiceResponse;
                } catch (invoiceErr) {
                    // Invoice creation failed but appointment succeeded
                    console.warn('Invoice creation failed:', invoiceErr);
                    booking.invoiceError = invoiceErr.response?.data?.message || 'Invoice creation failed';
                }
            }
            
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClearPatient = () => {
        setSelectedPatient(null);
        setPatientResults([]);
        setPatientQuery('');
    };

    const handleReset = () => {
        setSuccess(false);
        setBookingData(null);
        setSelectedPatient(null);
        setSelectedDoctorId('');
        setSelectedServiceId('');
        setDate('');
        setTime('');
        setNotes('');
        setCreateInvoice(false);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ===== COMPUTED =====
    const selectedDoctor = useMemo(
        () => doctors.find((d) => String(d.id) === String(selectedDoctorId)),
        [doctors, selectedDoctorId]
    );
    
    const selectedService = useMemo(
        () => services.find((s) => String(s.id) === String(selectedServiceId)),
        [services, selectedServiceId]
    );

    const canConfirm = selectedPatient && selectedServiceId && date && time;

    // ===== SUCCESS STATE =====
    if (success && bookingData) {
        return (
            <div className="glass-panel rounded-xl p-8 max-w-md mx-auto text-center">
                <div className="text-5xl mb-4 text-green-500">✓</div>
                <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">Appointment Booked!</h2>
                <p className="text-[#424752] mt-2">
                    {selectedPatient?.user?.name} with {selectedDoctor?.name} on {date} at {time}.
                </p>
                
                {bookingData.invoice && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                            Invoice #{bookingData.invoice.invoice_number} created for ${bookingData.invoice.amount}
                        </p>
                    </div>
                )}
                
                {bookingData.invoiceError && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700">
                            Appointment booked but invoice creation failed: {bookingData.invoiceError}
                        </p>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                    <button
                        className="px-4 py-2 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition"
                        onClick={() => navigate('/receptionist/schedule')}
                    >
                        View Schedule
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg border border-[#00478d] text-[#00478d] hover:bg-[#00478d]/5 transition"
                        onClick={() => navigate('/receptionist/invoices')}
                    >
                        View Invoices
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-[#00478d] text-white hover:bg-[#00366e] transition"
                        onClick={handleReset}
                    >
                        Book Another
                    </button>
                </div>
            </div>
        );
    }

    // ===== MAIN RENDER =====
    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">Book Appointment</h2>
                <p className="text-[#424752] mt-1">Schedule a new visit or consultation.</p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Steps */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Step 1: Patient */}
                    <div className={`glass-panel rounded-xl p-6 ${!selectedPatient ? '' : 'border-l-4 border-l-[#00478d]'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                selectedPatient ? 'bg-[#00478d] text-white' : 'border-2 border-[#727783]/30 text-[#424752]'
                            }`}>
                                {selectedPatient ? '✓' : '1'}
                            </div>
                            <h3 className="text-lg font-semibold text-[#191c1e]">Patient Details</h3>
                            {selectedPatient && (
                                <span className="ml-auto text-sm text-green-600 font-medium">Selected</span>
                            )}
                        </div>

                        {selectedPatient ? (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#f2f4f6]">
                                <div>
                                    <div className="font-semibold text-[#191c1e]">{selectedPatient.user?.name}</div>
                                    <div className="text-sm text-[#424752]">{selectedPatient.user?.email}</div>
                                    <div className="text-sm text-[#424752]">{selectedPatient.phone}</div>
                                </div>
                                <button
                                    className="px-3 py-1 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition text-sm"
                                    onClick={handleClearPatient}
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handlePatientSearch} className="space-y-2">
                                    <label className="text-sm font-medium text-[#424752]">Search Existing Patient</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 glass-input rounded-lg px-4 py-2.5 text-sm"
                                            placeholder="Name, email, or phone..."
                                            value={patientQuery}
                                            onChange={(e) => setPatientQuery(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-[#00478d] text-white rounded-lg hover:bg-[#00366e] transition disabled:opacity-50"
                                            disabled={searching}
                                        >
                                            {searching ? '…' : 'Search'}
                                        </button>
                                    </div>
                                </form>

                                {patientResults.length > 0 && (
                                    <div className="mt-3 max-h-52 overflow-y-auto space-y-1 border rounded-lg p-1">
                                        {patientResults.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f2f4f6] cursor-pointer transition"
                                                onClick={() => {
                                                    setSelectedPatient(p);
                                                    setPatientResults([]);
                                                }}
                                            >
                                                <div>
                                                    <div className="font-medium text-[#191c1e]">{p.user?.name}</div>
                                                    <div className="text-sm text-[#424752]">{p.user?.email}</div>
                                                </div>
                                                {p.approval_status !== 'approved' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        p.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {p.approval_status}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 my-3">
                                    <hr className="flex-1 border-black/5" />
                                    <span className="text-xs text-[#424752] uppercase font-medium">OR</span>
                                    <hr className="flex-1 border-black/5" />
                                </div>

                                <button
                                    className="w-full py-2.5 rounded-lg border border-[#00478d]/20 text-[#00478d] hover:bg-[#00478d]/5 transition flex items-center justify-center gap-2"
                                    onClick={() => navigate('/receptionist/patients/walk-in')}
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Register New Patient
                                </button>
                            </>
                        )}
                    </div>

                    {/* Step 2: Service & Provider */}
                    <div className={`glass-panel rounded-xl p-6 ${!selectedPatient ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                selectedServiceId ? 'bg-[#00478d] text-white' : 'border-2 border-[#727783]/30 text-[#424752]'
                            }`}>
                                {selectedServiceId ? '✓' : '2'}
                            </div>
                            <h3 className="text-lg font-semibold text-[#191c1e]">Service &amp; Provider</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-[#424752] block mb-1">Provider</label>
                                <select
                                    className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                >
                                    <option value="">Select a provider...</option>
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id} disabled={!d.is_available}>
                                            {d.name || d.user?.name} {!d.is_available ? '(unavailable)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#424752] block mb-1">Service</label>
                                <select
                                    className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    disabled={!selectedDoctorId}
                                >
                                    <option value="">{selectedDoctorId ? 'Select a service...' : 'Choose a provider first'}</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — ${Number(s.price).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {selectedDoctor && selectedService && (
                            <div className="mt-3 p-2 bg-[#f2f4f6] rounded-lg text-sm text-[#424752]">
                                <span className="font-medium">{selectedDoctor.name || selectedDoctor.user?.name}</span>
                                {' — '}{selectedService.duration} min consultation
                            </div>
                        )}
                    </div>

                    {/* Step 3: Date & Time */}
                    <div className={`glass-panel rounded-xl p-6 ${!selectedServiceId ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                date && time ? 'bg-[#00478d] text-white' : 'border-2 border-[#727783]/30 text-[#424752]'
                            }`}>
                                {date && time ? '✓' : '3'}
                            </div>
                            <h3 className="text-lg font-semibold text-[#191c1e]">Date &amp; Time</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-[#424752] block mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                    value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#424752] block mb-1">Time</label>
                                <input
                                    type="time"
                                    className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-sm font-medium text-[#424752] block mb-1">Notes (optional)</label>
                            <textarea
                                className="w-full glass-input rounded-lg px-4 py-2.5 text-sm resize-none"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special requests or additional information..."
                            />
                        </div>
                        
                        {/* Invoice Option - Phase 6 */}
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="createInvoice"
                                checked={createInvoice}
                                onChange={(e) => setCreateInvoice(e.target.checked)}
                                className="w-4 h-4 text-[#00478d] border-[#727783]/30 rounded"
                            />
                            <label htmlFor="createInvoice" className="text-sm text-[#424752]">
                                Create invoice for this appointment
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-xl p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-[#191c1e] mb-4 border-b border-black/5 pb-3 flex items-center justify-between">
                            <span>Summary</span>
                            {!canConfirm && (
                                <span className="text-xs text-[#424752] font-normal">Incomplete</span>
                            )}
                        </h3>
                        <div className="space-y-3">
                            <SummaryRow label="Patient" value={selectedPatient?.user?.name} />
                            <SummaryRow label="Provider" value={selectedDoctor?.name || selectedDoctor?.user?.name} />
                            <SummaryRow label="Service" value={selectedService?.name} />
                            <SummaryRow label="Date & Time" value={date && time ? `${date} at ${time}` : '—'} />
                            {selectedService && (
                                <SummaryRow 
                                    label="Estimated Cost" 
                                    value={`$${Number(selectedService.price).toFixed(2)}`}
                                />
                            )}
                            {createInvoice && (
                                <div className="mt-2 p-2 bg-[#00478d]/5 rounded-lg border border-[#00478d]/10">
                                    <p className="text-xs text-[#00478d] font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                                        Invoice will be created
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <button
                            className="w-full mt-6 py-3 rounded-lg bg-[#00478d] text-white font-semibold hover:bg-[#00366e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={!canConfirm || submitting}
                            onClick={handleConfirm}
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin">⟳</span>
                                    Booking...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">check</span>
                                    Confirm Appointment
                                </>
                            )}
                        </button>
                        
                        <p className="text-xs text-[#727783] text-center mt-3">
                            By confirming, you agree to the clinic's terms and conditions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== SUB-COMPONENTS =====
const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-black/5 last:border-0">
        <span className="text-sm text-[#424752]">{label}</span>
        <span className="font-medium text-[#191c1e]">{value || '—'}</span>
    </div>
);

export default BookAppointment;