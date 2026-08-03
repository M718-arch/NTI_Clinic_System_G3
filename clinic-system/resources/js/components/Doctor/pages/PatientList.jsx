import React, { useState, useEffect } from 'react';
import { Users, Search, SlidersHorizontal, Plus, MoreVertical, Phone, Mail, X } from 'lucide-react';
import { SearchBox } from '../components/SearchBox';
import { Badge } from '../components/Badge';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

// Shared avatar: shows the patient's real photo if present, falls back to
// initials on a colored circle otherwise (also falls back if the image URL
// 404s/fails to load, e.g. stale photo_url after a file was deleted).
const PatientAvatar = ({ patient, sizeClass = 'w-8 h-8', textClass = 'text-xs' }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const initials = patient?.name?.charAt(0) || 'P';

    if (patient?.photo_url && !imgFailed) {
        return (
            <img
                src={patient.photo_url}
                alt={patient.name || 'Patient'}
                className={`${sizeClass} rounded-full object-cover shrink-0`}
                onError={() => setImgFailed(true)}
            />
        );
    }

    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0 ${textClass}`}>
            {initials}
        </div>
    );
};

export const PatientList = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            console.log('Fetching patients...');
            console.log('API base URL:', api.defaults.baseURL);
            const response = await api.get('/doctor/patients');
            console.log('Patients data:', response.data);
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            console.error('Error details:', error.response?.status, error.response?.data);
            setMessage({ type: 'error', text: 'Failed to load patients' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        return (
            patient.name?.toLowerCase().includes(searchLower) ||
            patient.email?.toLowerCase().includes(searchLower) ||
            patient.phone?.includes(searchTerm)
        );
    });

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500">Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Patient List</h2>
                        <p className="text-sm text-slate-500">Manage all your patients</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <SearchBox 
                            placeholder="Search patient..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
                            <SlidersHorizontal size={12} /> Filter
                        </button>
                        <button className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700">
                            <Plus size={14} /> Add Patient
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">
                                {searchTerm ? `No patients found matching "${searchTerm}"` : 'No patients yet'}
                            </p>
                            {!searchTerm && (
                                <p className="text-sm text-slate-400 mt-1">
                                    Patients will appear here once they book appointments
                                </p>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                                    <th className="py-3 pl-5 pr-3 font-medium">Patient</th>
                                    <th className="py-3 px-3 font-medium">Contact</th>
                                    <th className="py-3 px-3 font-medium">Total Visits</th>
                                    <th className="py-3 px-3 font-medium">Last Visit</th>
                                    <th className="py-3 px-3 font-medium">Status</th>
                                    <th className="py-3 pr-5 pl-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                                        <td className="py-3 pl-5 pr-3">
                                            <div className="flex items-center gap-3">
                                                <PatientAvatar patient={patient} sizeClass="w-8 h-8" textClass="text-xs" />
                                                <span className="font-semibold text-slate-800">{patient.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="space-y-0.5">
                                                {patient.email && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {patient.email}
                                                    </div>
                                                )}
                                                {patient.phone && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Phone size={12} className="text-slate-400" />
                                                        {patient.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs">
                                                {patient.total_visits || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-slate-500 text-xs">
                                            {patient.last_visit ? formatDate(patient.last_visit) : 'Never'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <Badge tone={patient.total_visits > 0 ? 'blue' : 'slate'}>
                                                {patient.total_visits > 0 ? 'Active' : 'New'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 pr-5 pl-3 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedPatient(patient);
                                                    setShowModal(true);
                                                }}
                                                className="text-slate-300 hover:text-blue-600 transition"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Patient Detail Modal */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Patient Details</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedPatient(null);
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <PatientAvatar patient={selectedPatient} sizeClass="w-16 h-16" textClass="text-2xl" />
                                <div>
                                    <h4 className="font-semibold text-slate-800">{selectedPatient.name || 'Unknown'}</h4>
                                    <p className="text-sm text-slate-500">{selectedPatient.email || 'No email'}</p>
                                    <p className="text-sm text-slate-500">{selectedPatient.phone || 'No phone'}</p>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Date of Birth</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {selectedPatient.date_of_birth ? formatDate(selectedPatient.date_of_birth) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Total Visits</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedPatient.total_visits || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">First Visit</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {selectedPatient.first_visit ? formatDate(selectedPatient.first_visit) : 'Never'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Last Visit</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {selectedPatient.last_visit ? formatDate(selectedPatient.last_visit) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-4 flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                                    View History
                                </button>
                                <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientList;