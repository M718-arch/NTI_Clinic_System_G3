import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, X, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

// Helper function to get full image URL
const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    if (path.startsWith('/storage/')) {
        return `${baseUrl}${path}`;
    }
    if (path.startsWith('patient-photos/')) {
        return `${baseUrl}/storage/${path}`;
    }
    if (!path.startsWith('/')) {
        return `${baseUrl}/storage/${path}`;
    }
    return `${baseUrl}${path}`;
};

// Avatar with proper image handling - fetches profile pictures
const PatientAvatar = ({ patient, sizeClass = 'w-10 h-10', textClass = 'text-sm' }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const initials = patient?.name?.charAt(0)?.toUpperCase() || 'P';

    // Check multiple possible photo fields
    const photoPath = patient?.photo || 
                     patient?.photo_url || 
                     patient?.profile_photo_url || 
                     patient?.avatar_url || 
                     patient?.image_url ||
                     null;
    
    const photoUrl = getFullImageUrl(photoPath);

    if (photoUrl && !imgFailed) {
        return (
            <img
                src={photoUrl}
                alt={patient?.name || 'Patient'}
                className={`${sizeClass} rounded-full object-cover shrink-0 border border-white/40 shadow-sm`}
                onError={() => {
                    console.log('Image failed to load:', photoUrl);
                    setImgFailed(true);
                }}
                onLoad={() => {
                    console.log('Image loaded successfully:', photoUrl);
                }}
            />
        );
    }

    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#006382] to-[#4a9eb5] flex items-center justify-center text-white font-bold border border-white/40 shadow-sm ${textClass}`}>
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
    const [stats, setStats] = useState({
        total: 0,
        newConsultations: 0,
        activeTreatments: 0
    });

    useEffect(() => {
        fetchPatients();
        fetchStats();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctor/patients');
            console.log('Patients data:', response.data);
            setPatients(response.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setMessage({ type: 'error', text: 'Failed to load patients' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/doctor/patients/stats');
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Fallback stats from patients data
            if (patients.length > 0) {
                const activePatients = patients.filter(p => p.total_visits > 0).length;
                const newPatients = patients.filter(p => p.total_visits === 0).length;
                setStats({
                    total: patients.length,
                    newConsultations: newPatients,
                    activeTreatments: activePatients
                });
            }
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
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            active: {
                bg: 'bg-emerald-500/15',
                text: 'text-emerald-600',
                border: 'border-emerald-500/30',
                dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
            },
            new: {
                bg: 'bg-blue-500/15',
                text: 'text-blue-600',
                border: 'border-blue-500/30',
                dot: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
            },
            pending: {
                bg: 'bg-amber-500/15',
                text: 'text-amber-600',
                border: 'border-amber-500/30',
                dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
            },
            confirmed: {
                bg: 'bg-blue-500/15',
                text: 'text-blue-600',
                border: 'border-blue-500/30',
                dot: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
            },
            completed: {
                bg: 'bg-emerald-500/15',
                text: 'text-emerald-600',
                border: 'border-emerald-500/30',
                dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
            },
            cancelled: {
                bg: 'bg-red-500/15',
                text: 'text-red-600',
                border: 'border-red-500/30',
                dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
            },
            inactive: {
                bg: 'bg-gray-400/15',
                text: 'text-gray-500',
                border: 'border-gray-400/30',
                dot: 'bg-gray-400'
            }
        };

        let statusKey = status?.toLowerCase() || 'inactive';
        if (statusKey === 'active' || statusKey === 'new' || statusKey === 'inactive') {
            // Keep as is
        } else if (statusKey === 'pending' || statusKey === 'confirmed' || statusKey === 'completed' || statusKey === 'cancelled') {
            // Keep as is
        } else {
            statusKey = (patients?.total_visits || 0) > 0 ? 'active' : 'new';
        }

        const style = statusMap[statusKey] || statusMap.active;
        const label = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#f5f6ff]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-[#006382] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#525b72]">Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f5f6ff] text-[#252f43] font-body">
            {/* Ambient Background Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#006382]/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6f4b94]/20 rounded-full blur-[150px]"></div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto relative z-10">
                {/* Page Header - with fade-in */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-headline font-semibold text-[#252f43] glow-text mb-1">Patient List</h1>
                        <p className="text-[#525b72] text-body-md">Manage and view all registered patients.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525b72]">search</span>
                            <input
                                className="glass-input w-full py-2 pl-10 pr-4 rounded-full text-[#252f43] placeholder:text-[#525b72]/70 focus:ring-0"
                                placeholder="Search patients..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-[#006382]/20 hover:bg-[#006382]/30 border border-[#006382]/30 text-[#006382] px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,99,130,0.1)] hover:shadow-[0_0_25px_rgba(0,99,130,0.2)] whitespace-nowrap">
                            <span className="material-symbols-outlined">person_add</span>
                            Add Patient
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message.type === 'success' ? 'bg-[#4ade80]/10 text-[#166534] border border-[#4ade80]/20' : 'bg-[#ff6b6b]/10 text-[#991b1b] border border-[#ff6b6b]/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Bento Grid Stats - with staggered fade-in */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-[0_8px_40px_rgba(0,99,130,0.12)] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006382]/20 rounded-full blur-xl group-hover:bg-[#006382]/30 group-hover:scale-110 transition-all duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#525b72] font-label font-medium">Total Patients</span>
                            <span className="material-symbols-outlined text-[#006382]" style={{ fontSize: '28px' }}>groups</span>
                        </div>
                        <div className="text-3xl font-headline font-bold text-[#252f43] glow-text relative z-10">{stats.total || patients.length}</div>
                        <div className="text-[#006382] text-sm mt-2 flex items-center gap-1 relative z-10 font-medium">
                            <span className="material-symbols-outlined text-sm">trending_up</span> +12 this week
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-[0_8px_40px_rgba(111,75,148,0.12)] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#6f4b94]/20 rounded-full blur-xl group-hover:bg-[#6f4b94]/30 group-hover:scale-110 transition-all duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#525b72] font-label font-medium">New Consultations</span>
                            <span className="material-symbols-outlined text-[#6f4b94]" style={{ fontSize: '28px' }}>contact_page</span>
                        </div>
                        <div className="text-3xl font-headline font-bold text-[#252f43] relative z-10">{stats.newConsultations || 45}</div>
                        <div className="text-[#6f4b94] text-sm mt-2 flex items-center gap-1 relative z-10 font-medium">
                            <span className="material-symbols-outlined text-sm">trending_up</span> +5 today
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-[0_8px_40px_rgba(0,99,130,0.12)] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006382]/15 rounded-full blur-xl group-hover:bg-[#006382]/25 group-hover:scale-110 transition-all duration-500"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[#525b72] font-label font-medium">Active Treatments</span>
                            <span className="material-symbols-outlined text-[#006382]/70" style={{ fontSize: '28px' }}>vital_signs</span>
                        </div>
                        <div className="text-3xl font-headline font-bold text-[#252f43] relative z-10">{stats.activeTreatments || 312}</div>
                        <div className="text-[#525b72] text-sm mt-2 relative z-10 font-medium">Ongoing monitoring</div>
                    </div>
                </div>

                {/* Patient Data Table Container - with fade-in */}
                <div className="glass-elevated rounded-2xl overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/20 bg-white/10">
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Patient</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Total Visits</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Last Visit</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Status</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-[#525b72]">
                                            {searchTerm ? `No patients found matching "${searchTerm}"` : 'No patients registered yet'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient, index) => (
                                        <tr key={patient.id} className="hover:bg-white/30 transition-colors group animate-fade-in-up" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <PatientAvatar patient={patient} sizeClass="w-10 h-10" textClass="text-sm" />
                                                    <div>
                                                        <div className="font-semibold text-[#252f43] group-hover:text-[#006382] transition-colors duration-300">{patient.name || 'Unknown'}</div>
                                                        <div className="text-sm text-[#525b72]">ID: {patient.id || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="text-[#252f43] font-medium">{patient.email || 'No email'}</div>
                                                <div className="text-[#525b72]">{patient.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center bg-white/40 px-3 py-1 rounded-full text-sm border border-white/50 text-[#252f43] font-medium">
                                                    {patient.total_visits || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#525b72] font-medium">
                                                {patient.last_visit ? formatDate(patient.last_visit) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(patient.status || (patient.total_visits > 0 ? 'active' : 'new'))}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedPatient(patient);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-[#525b72] hover:text-[#006382] transition-colors rounded-full hover:bg-white/50"
                                                >
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-white/20 px-6 py-4 flex items-center justify-between bg-white/5">
                        <span className="text-sm text-[#525b72] font-medium">
                            Showing 1 to {Math.min(4, filteredPatients.length)} of {filteredPatients.length} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button className="p-1 rounded-lg border border-white/50 text-[#525b72] hover:text-[#006382] hover:border-[#006382]/50 bg-white/30 transition-colors disabled:opacity-50" disabled>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-[#006382]/20 border border-[#006382]/30 text-[#006382] font-bold flex items-center justify-center shadow-sm">1</button>
                            <button className="w-8 h-8 rounded-lg border border-white/50 text-[#525b72] hover:text-[#006382] hover:border-[#006382]/50 bg-white/30 transition-colors flex items-center justify-center font-medium">2</button>
                            <button className="w-8 h-8 rounded-lg border border-white/50 text-[#525b72] hover:text-[#006382] hover:border-[#006382]/50 bg-white/30 transition-colors flex items-center justify-center font-medium">3</button>
                            <span className="text-[#525b72] px-1 font-medium">...</span>
                            <button className="p-1 rounded-lg border border-white/50 text-[#525b72] hover:text-[#006382] hover:border-[#006382]/50 bg-white/30 transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Patient Detail Modal - Glassmorphism */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-50 p-4 animate-fade-in-up">
                    <div className="glass-elevated rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-headline font-semibold text-[#252f43]">Patient Details</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedPatient(null);
                                }}
                                className="p-1 hover:bg-white/20 rounded-lg transition text-[#525b72] hover:text-[#252f43]"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <PatientAvatar patient={selectedPatient} sizeClass="w-16 h-16" textClass="text-2xl" />
                                <div>
                                    <h4 className="font-semibold text-[#252f43]">{selectedPatient.name || 'Unknown'}</h4>
                                    <p className="text-sm text-[#525b72]">{selectedPatient.email || 'No email'}</p>
                                    <p className="text-sm text-[#525b72]">{selectedPatient.phone || 'No phone'}</p>
                                </div>
                            </div>
                            <div className="border-t border-white/20 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-[#525b72]">Date of Birth</p>
                                        <p className="text-sm font-medium text-[#252f43]">
                                            {selectedPatient.date_of_birth ? formatDate(selectedPatient.date_of_birth) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#525b72]">Total Visits</p>
                                        <p className="text-sm font-medium text-[#252f43]">{selectedPatient.total_visits || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#525b72]">First Visit</p>
                                        <p className="text-sm font-medium text-[#252f43]">
                                            {selectedPatient.first_visit ? formatDate(selectedPatient.first_visit) : 'Never'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#525b72]">Last Visit</p>
                                        <p className="text-sm font-medium text-[#252f43]">
                                            {selectedPatient.last_visit ? formatDate(selectedPatient.last_visit) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-white/20 pt-4 flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-[#006382]/20 text-[#006382] rounded-lg hover:bg-[#006382]/30 transition text-sm font-medium border border-[#006382]/30">
                                    View History
                                </button>
                                <button className="flex-1 px-4 py-2 border border-white/20 text-[#525b72] rounded-lg hover:bg-white/10 transition text-sm font-medium">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(32px);
                    -webkit-backdrop-filter: blur(32px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .glass-panel:hover {
                    border-color: rgba(255, 255, 255, 0.8);
                }
                
                .glass-elevated {
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(48px);
                    -webkit-backdrop-filter: blur(48px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    transition: all 0.3s ease;
                }

                .glass-input:focus {
                    border-color: rgba(0, 99, 130, 0.5);
                    box-shadow: 0 0 30px rgba(0, 99, 130, 0.15);
                    outline: none;
                }
                
                .glow-text {
                    text-shadow: 0 0 20px rgba(0, 99, 130, 0.15);
                }

                /* Fade-in animation */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* Google Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
};

export default PatientList;