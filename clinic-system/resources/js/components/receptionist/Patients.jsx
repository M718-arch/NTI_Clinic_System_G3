// resources/js/components/receptionist/Patients.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

const TABS = [
    { key: 'all', label: 'All Patients' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'search', label: 'Search' },
];

/**
 * Patients Management Component
 * 
 * Features:
 * - Tab-based navigation (All, Pending, Search)
 * - Patient approval/rejection workflow
 * - Search by name, email, or phone
 * - Walk-in patient registration
 * - Phase 6: View patient invoices from here
 * - Responsive glassmorphism design
 */
const Patients = () => {
    const api = receptionistApi;
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get initial tab from URL params
    const initialTab = TABS.some((t) => t.key === searchParams.get('tab'))
        ? searchParams.get('tab')
        : 'all';

    // ===== STATE =====
    const [tab, setTab] = useState(initialTab);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actioningId, setActioningId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectingPatient, setRejectingPatient] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // ===== LOAD PATIENTS =====
    const loadPatients = useCallback(async (activeTab, term) => {
        setLoading(true);
        setError(null);

        try {
            let result;
            if (activeTab === 'pending') {
                result = await api.listPendingPatients();
            } else if (activeTab === 'search') {
                result = term ? await api.searchPatients(term) : [];
            } else {
                result = await api.listPatients();
            }

            // Handle both axios and fetch responses
            const data = result.data || result || [];
            setPatients(data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load patients';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Load patients when tab changes
    useEffect(() => {
        loadPatients(tab, searchTerm);
    }, [tab, loadPatients]);

    // ===== HANDLERS =====
    const changeTab = (key) => {
        setTab(key);
        setSearchParams(key === 'all' ? {} : { tab: key });
    };

    const handleApprove = async (patient) => {
        setActioningId(patient.id);
        try {
            await api.approvePatient(patient.id);
            setPatients((prev) => prev.filter((p) => p.id !== patient.id));
            toast.success(`${patient.user?.name || 'Patient'} approved successfully`);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to approve patient';
            toast.error(message);
            setError(message);
        } finally {
            setActioningId(null);
        }
    };

    const openReject = (patient) => {
        setRejectingPatient(patient);
        setRejectReason('');
    };

    const confirmReject = async () => {
        if (!rejectingPatient) return;
        setActioningId(rejectingPatient.id);

        try {
            await api.rejectPatient(rejectingPatient.id, rejectReason || undefined);
            setPatients((prev) => prev.filter((p) => p.id !== rejectingPatient.id));
            toast.success(`${rejectingPatient.user?.name || 'Patient'}'s registration rejected`);
            setRejectingPatient(null);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to reject patient';
            toast.error(message);
            setError(message);
        } finally {
            setActioningId(null);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadPatients('search', searchTerm);
    };

    const handleViewPatient = (patientId) => {
        navigate(`/receptionist/patients/${patientId}`);
    };

    const handleViewInvoices = (patientId) => {
        navigate(`/receptionist/invoices?patient_id=${patientId}`);
    };

    // ===== COMPUTED =====
    const pendingCount = patients.filter(p => p.approval_status === 'pending').length;

    // ===== RENDER =====
    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                        Patient Management
                    </h2>
                    <p className="text-[#424752] mt-1">
                        Review and manage patient registrations and records.
                    </p>
                </div>
                <button
                    className="bg-[#00478d] text-white px-6 py-2.5 rounded-full hover:bg-[#00366e] transition flex items-center gap-2 shadow-sm"
                    onClick={() => navigate('/receptionist/patients/walk-in')}
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Register Walk-in
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#c2c6d4]/30 mb-6">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => changeTab(t.key)}
                        className={`pb-3 text-sm transition-colors relative ${
                            tab === t.key
                                ? 'text-[#00478d] font-bold border-b-2 border-[#00478d]'
                                : 'text-[#424752] hover:text-[#00478d]'
                        }`}
                    >
                        {t.label}
                        {t.key === 'pending' && pendingCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center bg-[#ba1a1a] text-white text-xs font-bold w-5 h-5 rounded-full animate-pulse">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            {tab === 'search' && (
                <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6 max-w-md">
                    <input
                        type="text"
                        className="flex-1 glass-input rounded-full px-4 py-2 text-sm"
                        placeholder="Name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-[#00478d] text-white rounded-full text-sm hover:bg-[#00366e] transition flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        Search
                    </button>
                </form>
            )}

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

            {/* Patient Table */}
            <div className="glass-panel rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="mg-spinner" />
                    </div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-12 text-[#424752]">
                        <span className="material-symbols-outlined text-4xl text-[#424752]/30 block mb-2">
                            {tab === 'search' ? 'search_off' : 'person_off'}
                        </span>
                        {tab === 'search'
                            ? searchTerm
                                ? 'No patients match your search.'
                                : 'Search by name, email, or phone above.'
                            : tab === 'pending'
                            ? 'No pending registrations. All caught up! 🎉'
                            : 'No patients found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-black/5 bg-[#f2f4f6]/50">
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">
                                        Patient
                                    </th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Contact Info
                                    </th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Registered
                                    </th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">
                                        Status
                                    </th>
                                    {(tab === 'pending' || tab === 'all') && (
                                        <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 text-right">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr 
                                        key={patient.id} 
                                        className="border-b border-black/5 hover:bg-[#e0e3e5]/30 transition-colors cursor-pointer"
                                        onClick={() => handleViewPatient(patient.id)}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#005eb8] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                                    {patient.user?.name?.charAt(0) || patient.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#191c1e]">
                                                        {patient.user?.name || patient.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-[#424752]">
                                                        DOB: {patient.date_of_birth || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[#424752] text-sm hidden md:table-cell">
                                            <div>{patient.user?.email || patient.email || '—'}</div>
                                            <div className="text-xs">{patient.phone || '—'}</div>
                                        </td>
                                        <td className="py-3 px-4 text-[#424752] text-sm hidden lg:table-cell">
                                            {new Date(patient.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <ApprovalBadge status={patient.approval_status} />
                                        </td>
                                        {(tab === 'pending' || tab === 'all') && (
                                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                {patient.approval_status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openReject(patient)}
                                                            disabled={actioningId === patient.id}
                                                            className="px-4 py-1 rounded-full border border-[#ba1a1a] text-[#ba1a1a] hover:bg-red-50 transition text-sm disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(patient)}
                                                            disabled={actioningId === patient.id}
                                                            className="px-4 py-1 rounded-full bg-[#10b981] text-white hover:bg-[#059669] transition text-sm disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {actioningId === patient.id ? (
                                                                <span className="animate-spin">⟳</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[16px]">check</span>
                                                            )}
                                                            Approve
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleViewInvoices(patient.id)}
                                                            className="p-1.5 rounded-lg hover:bg-[#00478d]/10 transition text-[#00478d]"
                                                            title="View Invoices"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">receipt</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewPatient(patient.id)}
                                                            className="p-1.5 rounded-lg hover:bg-[#00478d]/10 transition text-[#00478d]"
                                                            title="View Profile"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectingPatient && (
                <div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setRejectingPatient(null)}
                >
                    <div 
                        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#191c1e]">
                                    Reject {rejectingPatient.user?.name || 'Patient'}'s registration?
                                </h3>
                                <p className="text-sm text-[#424752]">
                                    They won't be able to log in or book appointments. You can optionally leave a reason.
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-medium text-[#424752] block mb-1">
                                Reason (optional)
                            </label>
                            <textarea
                                className="w-full glass-input rounded-lg px-3 py-2 text-sm resize-none"
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Duplicate account, incomplete information, etc."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejectingPatient(null)}
                                className="px-4 py-2 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={actioningId === rejectingPatient.id}
                                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white hover:bg-[#991b1b] transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {actioningId === rejectingPatient.id ? (
                                    <>
                                        <span className="animate-spin">⟳</span>
                                        Rejecting...
                                    </>
                                ) : (
                                    'Confirm Reject'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== SUB-COMPONENTS =====

/**
 * Approval Badge Component
 */
const ApprovalBadge = ({ status }) => {
    const config = {
        pending: {
            className: 'bg-[#f59e0b]/20 text-[#d97706]',
            label: 'Pending',
            icon: 'hourglass_top'
        },
        approved: {
            className: 'bg-[#10b981]/20 text-[#059669]',
            label: 'Approved',
            icon: 'check_circle'
        },
        rejected: {
            className: 'bg-[#ef4444]/20 text-[#dc2626]',
            label: 'Rejected',
            icon: 'cancel'
        }
    };

    const cfg = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>
            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
            {cfg.label}
        </span>
    );
};

export default Patients;