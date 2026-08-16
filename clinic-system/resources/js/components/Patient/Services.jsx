import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Stethoscope, User, Clock, Star, ChevronRight, Heart, DollarSign, Calendar, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/client';

const PatientServices = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedDoctor, setExpandedDoctor] = useState(null);
    const [doctorServices, setDoctorServices] = useState({});
    const [loadingServices, setLoadingServices] = useState({});
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/patient/doctors');
            console.log('Doctors data:', response.data);
            setDoctors(response.data);
            
            const uniqueSpecialties = [...new Set(response.data.map(d => d.specialization?.name).filter(Boolean))];
            setSpecialties(uniqueSpecialties);
            setFilteredDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setMessage({ type: 'error', text: 'Failed to load doctors' });
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorServices = async (doctorId) => {
        if (doctorServices[doctorId]) {
            toggleDoctor(doctorId);
            return;
        }

        setLoadingServices(prev => ({ ...prev, [doctorId]: true }));
        
        try {
            const response = await api.get(`/patient/doctors/${doctorId}/services`);
setDoctorServices(prev => ({
    ...prev,
    [doctorId]: response.data.services || []   // expects response.data.services
}));
            setExpandedDoctor(doctorId);
        } catch (error) {
            console.error('Error fetching doctor services:', error);
            setMessage({ type: 'error', text: 'Failed to load services' });
        } finally {
            setLoadingServices(prev => ({ ...prev, [doctorId]: false }));
        }
    };

    const toggleDoctor = (doctorId) => {
        if (expandedDoctor === doctorId) {
            setExpandedDoctor(null);
        } else {
            if (!doctorServices[doctorId]) {
                fetchDoctorServices(doctorId);
            } else {
                setExpandedDoctor(doctorId);
            }
        }
    };

    const handleBookNow = (service, doctor) => {
        setSelectedService(service);
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
        setBookingDate('');
        setBookingTime('');
        setBookingNotes('');
    };

    const handleBookingSubmit = async () => {
        if (!bookingDate || !bookingTime) {
            setMessage({ type: 'error', text: 'Please select date and time' });
            return;
        }

        setSubmitting(true);
        
        try {
            const response = await api.post('/patient/bookings', {
                service_id: selectedService.id,
                appointment_date: bookingDate,
                appointment_time: bookingTime,
                notes: bookingNotes
            });

            setMessage({ type: 'success', text: 'Booking created successfully!' });
            setShowBookingModal(false);
            setSelectedService(null);
            setSelectedDoctor(null);
            
            setBookingDate('');
            setBookingTime('');
            setBookingNotes('');
            
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                navigate('/patient/my-bookings');
            }, 2000);
            
        } catch (error) {
            console.error('Error creating booking:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to create booking' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        let results = doctors;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(d => 
                d.name?.toLowerCase().includes(term) ||
                d.specialization?.name?.toLowerCase().includes(term) ||
                d.clinic_name?.toLowerCase().includes(term) ||
                d.bio?.toLowerCase().includes(term)
            );
        }

        if (selectedSpecialty !== 'all') {
            results = results.filter(d => d.specialization?.name === selectedSpecialty);
        }

        switch(sortBy) {
            case 'name':
                results.sort((a, b) => a.name?.localeCompare(b.name));
                break;
            case 'experience':
                results.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
                break;
            case 'fee':
                results.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
                break;
            default:
                break;
        }

        setFilteredDoctors(results);
    }, [searchTerm, selectedSpecialty, sortBy, doctors]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSpecialty('all');
        setSortBy('name');
        setShowFilters(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500">Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Find a Doctor</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Browse our specialists and book appointments
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                        {filteredDoctors.length} doctors available
                    </span>
                </div>
            </div>

            {message.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by doctor name, specialty, or clinic..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(searchTerm || selectedSpecialty !== 'all' || sortBy !== 'name') && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </button>
                        {(searchTerm || selectedSpecialty !== 'all' || sortBy !== 'name') && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 transition"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                                Specialty
                            </label>
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            >
                                <option value="all">All Specialties</option>
                                {specialties.map(specialty => (
                                    <option key={specialty} value={specialty}>{specialty}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            >
                                <option value="name">Name</option>
                                <option value="experience">Experience</option>
                                <option value="fee">Fee (Low to High)</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No doctors found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm ? 'Try adjusting your search or filters' : 'Check back later for new doctors'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div 
                            key={doctor.id} 
                            className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden"
                        >
                            <div 
                                className="p-5 cursor-pointer hover:bg-slate-50/50 transition"
                                onClick={() => toggleDoctor(doctor.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
    {doctor.photo_url ? (
        <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" />
    ) : (
        doctor.name?.charAt(0) || 'D'
    )}
</div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">{doctor.name}</h3>
                                            <p className="text-sm text-blue-600 font-medium">
                                                {doctor.specialization?.name || 'General'}
                                            </p>
                                            {doctor.clinic_name && (
                                                <p className="text-sm text-slate-500">{doctor.clinic_name}</p>
                                            )}
                                            {doctor.bio && (
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{doctor.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            {doctor.experience_years > 0 && (
                                                <div className="text-sm text-slate-500">{doctor.experience_years} years exp.</div>
                                            )}
                                            <div className="text-sm font-medium text-blue-600">
                                                ${doctor.consultation_fee || 'Free'}
                                            </div>
                                            <div className="text-xs text-slate-400">{doctor.services_count || 0} services</div>
                                        </div>
                                        <div className="text-slate-400">
                                            {expandedDoctor === doctor.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {expandedDoctor === doctor.id && (
                                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                                    {loadingServices[doctor.id] ? (
                                        <div className="flex justify-center py-6">
                                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : doctorServices[doctor.id]?.length === 0 ? (
                                        <p className="text-slate-500 text-center py-4">No services available</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {(doctorServices[doctor.id] || []).map((service) => (
                                                <div key={service.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                                                    {/* ✅ FIXED: Use service.name, NOT service */}
                                                    <h4 className="font-medium text-slate-800">{service.name || 'Service'}</h4>
                                                    {service.description && (
                                                        <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={14} />
                                                                {service.duration || 30} min
                                                            </span>
                                                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                                <DollarSign size={14} />
                                                                {service.formatted_price || `$${service.price || '0.00'}`}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBookNow(service, doctor);
                                                            }}
                                                            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {filteredDoctors.length > 0 && (
                <div className="mt-6 text-sm text-slate-400 text-center">
                    Showing {filteredDoctors.length} of {doctors.length} doctors
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedService && selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Book Appointment</h3>
                            <button
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setSelectedService(null);
                                    setSelectedDoctor(null);
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                {/* ✅ FIXED: Use selectedService.name, NOT selectedService */}
                                <p className="text-sm text-slate-500">Service</p>
                                <p className="font-medium text-slate-800">{selectedService.name}</p>
                                <p className="text-sm text-slate-500">Dr. {selectedDoctor.name}</p>
                                <p className="text-sm text-blue-600 font-medium">
                                    {selectedService.formatted_price || `$${selectedService.price || '0.00'}`} · {selectedService.duration || 30} min
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                                <input
                                    type="time"
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Any additional notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleBookingSubmit}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBookingModal(false);
                                        setSelectedService(null);
                                        setSelectedDoctor(null);
                                    }}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientServices;