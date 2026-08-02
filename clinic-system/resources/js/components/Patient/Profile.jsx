import React, { useState, useEffect, useRef } from 'react';
import { 
    Edit, Save, X, Plus, Trash2, Download, FileText, Calendar, 
    User, Phone, Mail, MapPin, Heart, Pill, AlertCircle, Stethoscope, 
    Lock, Camera, Loader2 
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('future');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [visits, setVisits] = useState({
        future: [],
        past: [],
        treatments: []
    });
    const [files, setFiles] = useState([]);
    const [notes, setNotes] = useState([]);
    const [showAddVisit, setShowAddVisit] = useState(false);
    const [newVisit, setNewVisit] = useState({ date: '', service: '', doctor: '', status: 'Scheduled' });
    const [showAddFile, setShowAddFile] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);
    const [newFile, setNewFile] = useState({ name: '', size: '' });
    const [newNote, setNewNote] = useState({ name: '', size: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [imageError, setImageError] = useState(false);
    const photoInputRef = useRef(null);

    // ✅ PATIENT CAN EDIT THESE FIELDS ONLY
    const editableFields = [
        'name', 
        'phone', 
        'date_of_birth', 
        'gender', 
        'blood_group', 
        'address', 
        'allergies', 
        'chronic_diseases', 
        'emergency_contact'
    ];

    // ❌ DOCTOR ONLY - PATIENT CANNOT EDIT THESE
    const doctorOnlyFields = [
        'medical_history',
        'diagnoses',
        'family_history',
        'past_surgeries'
    ];

    useEffect(() => {
        fetchProfile();
        fetchVisits();
        fetchFiles();
        fetchNotes();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const fetchProfile = async () => {
        try {
            const response = await api.get('/patient/profile');
            console.log('Profile response:', response.data);
            setProfile(response.data);
            setEditForm(response.data);
            setImageError(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (user) {
                setProfile({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || null,
                });
                setEditForm({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || null,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchVisits = async () => {
        try {
            const response = await api.get('/patient/visits');
            if (response.data) {
                setVisits({
                    future: response.data.future || [],
                    past: response.data.past || [],
                    treatments: response.data.treatments || []
                });
            }
        } catch (error) {
            console.error('Error fetching visits:', error);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await api.get('/patient/files');
            setFiles(response.data || []);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await api.get('/patient/notes');
            setNotes(response.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditForm(profile);
        }
        setIsEditing(!isEditing);
        setMessage({ type: '', text: '' });
    };

    const handleInputChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            const response = await api.put('/patient/profile', editForm);
            setProfile(response.data.profile || response.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoSelect = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be 2MB or smaller' });
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setUploadingPhoto(true);
        setImageError(false);
        
        try {
            const response = await api.post('/patient/profile/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Upload response:', response.data);
            
            // Update profile with new photo URL
            setProfile((prev) => ({ 
                ...prev, 
                photo: response.data.photo,
                photo_url: response.data.photo_url 
            }));
            
            setMessage({ type: 'success', text: 'Profile photo updated!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            
            // Refresh profile to get updated data
            await fetchProfile();
        } catch (error) {
            console.error('Error uploading photo:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload photo' });
        } finally {
            setUploadingPhoto(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const handlePhotoRemove = async () => {
        if (!window.confirm('Remove your profile photo?')) return;

        setUploadingPhoto(true);
        try {
            await api.delete('/patient/profile/photo');
            setProfile((prev) => ({ ...prev, photo: null, photo_url: null }));
            setMessage({ type: 'success', text: 'Profile photo removed' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            
            // Refresh profile to get updated data
            await fetchProfile();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to remove photo' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleAddVisit = async () => {
        if (!newVisit.date || !newVisit.service) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        try {
            const response = await api.post('/patient/visits', newVisit);
            setVisits({
                ...visits,
                future: [response.data, ...visits.future]
            });
            setShowAddVisit(false);
            setNewVisit({ date: '', service: '', doctor: '', status: 'Scheduled' });
            setMessage({ type: 'success', text: 'Visit added successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add visit' });
        }
    };

    const handleDeleteVisit = async (visitId) => {
        if (!window.confirm('Are you sure you want to delete this visit?')) return;

        try {
            await api.delete(`/patient/visits/${visitId}`);
            fetchVisits();
            setMessage({ type: 'success', text: 'Visit deleted successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete visit' });
        }
    };

    const handleAddFile = async () => {
        if (!newFile.name) {
            setMessage({ type: 'error', text: 'Please enter a file name' });
            return;
        }

        try {
            const response = await api.post('/patient/files', newFile);
            setFiles([...files, response.data]);
            setShowAddFile(false);
            setNewFile({ name: '', size: '' });
            setMessage({ type: 'success', text: 'File added successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add file' });
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await api.delete(`/patient/files/${fileId}`);
            setFiles(files.filter(f => f.id !== fileId));
            setMessage({ type: 'success', text: 'File deleted successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete file' });
        }
    };

    const handleAddNote = async () => {
        if (!newNote.name) {
            setMessage({ type: 'error', text: 'Please enter a note name' });
            return;
        }

        try {
            const response = await api.post('/patient/notes', newNote);
            setNotes([...notes, response.data]);
            setShowAddNote(false);
            setNewNote({ name: '', size: '' });
            setMessage({ type: 'success', text: 'Note added successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add note' });
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await api.delete(`/patient/notes/${noteId}`);
            setNotes(notes.filter(n => n.id !== noteId));
            setMessage({ type: 'success', text: 'Note deleted successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete note' });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': 'bg-blue-100 text-blue-700',
            'Completed': 'bg-emerald-100 text-emerald-700',
            'In Progress': 'bg-amber-100 text-amber-700',
            'Cancelled': 'bg-red-100 text-red-700',
            'Pending': 'bg-amber-100 text-amber-700',
            'Confirmed': 'bg-blue-100 text-blue-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const renderField = (label, key, value, isTextarea = false) => {
        const isEditable = isEditing && editableFields.includes(key);
        const isDoctorOnly = doctorOnlyFields.includes(key);
        const isEmail = key === 'email';

        return (
            <div className={`flex justify-between items-start py-2 border-b border-slate-100 last:border-0 ${
                isEmail ? 'opacity-75' : ''
            }`}>
                <span className="text-slate-500 text-sm flex items-center gap-1">
                    {label}
                    {isDoctorOnly && (
                        <span className="ml-1 text-[10px] text-blue-500 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" />
                        </span>
                    )}
                    {isEmail && (
                        <span className="ml-1 text-[10px] text-slate-400">(read-only)</span>
                    )}
                </span>
                <div className="text-right max-w-[60%]">
                    {isEditable ? (
                        isTextarea ? (
                            <textarea
                                name={key}
                                value={editForm[key] || ''}
                                onChange={handleInputChange}
                                className="text-slate-700 font-medium border rounded-lg px-2 py-1 w-full text-right"
                                rows="2"
                            />
                        ) : key === 'gender' ? (
                            <select
                                name={key}
                                value={editForm[key] || ''}
                                onChange={handleInputChange}
                                className="text-slate-700 font-medium border rounded-lg px-2 py-1"
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        ) : key === 'blood_group' ? (
                            <select
                                name={key}
                                value={editForm[key] || ''}
                                onChange={handleInputChange}
                                className="text-slate-700 font-medium border rounded-lg px-2 py-1"
                            >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        ) : key === 'date_of_birth' ? (
                            <input
                                type="date"
                                name={key}
                                value={editForm[key] ? editForm[key].split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="text-slate-700 font-medium border rounded-lg px-2 py-1"
                            />
                        ) : (
                            <input
                                type="text"
                                name={key}
                                value={editForm[key] || ''}
                                onChange={handleInputChange}
                                className="text-slate-700 font-medium border rounded-lg px-2 py-1 w-full"
                            />
                        )
                    ) : (
                        <span className={`text-slate-700 font-medium ${isDoctorOnly ? 'text-blue-600' : ''} ${isEmail ? 'text-slate-500' : ''}`}>
                            {key === 'date_of_birth' ? formatDate(value) : value || 'N/A'}
                            {isDoctorOnly && (
                                <span className="ml-1 text-[10px] text-blue-400 block text-right">
                                    Doctor recorded
                                </span>
                            )}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Helper function to get the correct photo URL
    const getPhotoUrl = () => {
        if (!profile?.photo_url) return null;
        let url = profile.photo_url;
        // Ensure the URL has the correct port
        if (url.includes('localhost/storage') && !url.includes('localhost:8000')) {
            url = url.replace('localhost/storage', 'localhost:8000/storage');
        }
        return url;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Patient Profile</h1>
                <div className="flex items-center gap-3">
                    {message.text && (
                        <div className={`px-4 py-2 rounded-lg text-sm ${
                            message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    <button
                        onClick={handleEditToggle}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                            isEditing 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                    {isEditing && (
                        <button
                            onClick={handleProfileUpdate}
                            disabled={saving}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        {/* Avatar Section - FIXED */}
                        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                            <div className="relative mb-3">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                    {profile?.photo_url && !imageError ? (
                                        <img
                                            src={getPhotoUrl()}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Image failed to load:', profile.photo_url);
                                                setImageError(true);
                                                e.target.style.display = 'none';
                                                const parent = e.target.parentElement;
                                                const fallback = document.createElement('div');
                                                fallback.className = 'w-full h-full flex items-center justify-center text-white text-3xl font-bold';
                                                fallback.textContent = profile?.name?.charAt(0) || user?.name?.charAt(0) || 'P';
                                                parent.appendChild(fallback);
                                            }}
                                            onLoad={() => {
                                                console.log('Image loaded successfully:', getPhotoUrl());
                                                setImageError(false);
                                            }}
                                        />
                                    ) : (
                                        profile?.name?.charAt(0) || user?.name?.charAt(0) || 'P'
                                    )}
                                </div>

                                {/* Upload button */}
                                <button
                                    onClick={handlePhotoSelect}
                                    disabled={uploadingPhoto}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition disabled:opacity-60"
                                    aria-label="Change profile photo"
                                >
                                    {uploadingPhoto ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4" />
                                    )}
                                </button>

                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image.webp"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            {profile?.photo_url && !uploadingPhoto && (
                                <button
                                    onClick={handlePhotoRemove}
                                    className="text-[11px] text-red-500 hover:text-red-700 -mt-1 mb-2 transition"
                                >
                                    Remove photo
                                </button>
                            )}
                            
                            {/* Name - Editable */}
                            <div className="w-full">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name || ''}
                                        onChange={handleInputChange}
                                        className="text-lg font-bold text-slate-800 border rounded-lg px-3 py-1 text-center w-full"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {profile?.name || user?.name || 'Patient'}
                                    </h2>
                                )}
                            </div>
                            
                            {/* Email - Read Only */}
                            <p className="text-sm text-slate-500 mt-1">
                                {profile?.email || user?.email || 'No email'}
                                <span className="ml-1 text-[10px] text-slate-400">(read-only)</span>
                            </p>
                            
                            {/* Phone - Editable */}
                            <div className="w-full mt-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        value={editForm.phone || ''}
                                        onChange={handleInputChange}
                                        className="text-sm text-slate-500 border rounded-lg px-3 py-1 text-center w-full"
                                        placeholder="Phone number"
                                    />
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        {profile?.phone || user?.phone || 'No phone'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User className="w-3 h-3" /> General Information
                            </h4>
                            {renderField('Date of Birth', 'date_of_birth', profile?.date_of_birth)}
                            {renderField('Gender', 'gender', profile?.gender)}
                            {renderField('Blood Group', 'blood_group', profile?.blood_group)}
                            {renderField('Address', 'address', profile?.address)}
                        </div>

                        {/* Patient-Filled Section */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Heart className="w-3 h-3 text-red-500" /> Medical History (Self-Reported)
                            </h4>
                            {renderField('Allergies', 'allergies', profile?.allergies)}
                            {renderField('Chronic Diseases', 'chronic_diseases', profile?.chronic_diseases)}
                            {renderField('Emergency Contact', 'emergency_contact', profile?.emergency_contact)}
                        </div>

                        {/* Doctor-Filled Section - View Only */}
                        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-lg p-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Stethoscope className="w-3 h-3 text-blue-600" /> Clinical Records
                                <span className="text-[10px] text-blue-500 ml-1 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Doctor Only - View Only
                                </span>
                            </h4>
                            <div className="space-y-2 text-sm">
                                {renderField('Medical History', 'medical_history', profile?.medical_history)}
                                {renderField('Diagnoses', 'diagnoses', profile?.diagnoses)}
                                {renderField('Family History', 'family_history', profile?.family_history)}
                                {renderField('Past Surgeries', 'past_surgeries', profile?.past_surgeries)}
                            </div>
                            <div className="mt-3 text-xs text-slate-400 italic flex items-center gap-1">
                                <Lock className="w-3 h-3" /> This information is recorded by your healthcare provider
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Visits, Files, Notes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Visits Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setActiveTab('future')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                        activeTab === 'future' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Future ({visits.future.length})
                                </button>
                                <button 
                                    onClick={() => setActiveTab('past')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                        activeTab === 'past' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Past ({visits.past.length})
                                </button>
                                <button 
                                    onClick={() => setActiveTab('treatments')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                        activeTab === 'treatments' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    Treatments
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowAddVisit(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        {showAddVisit && (
                            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New Visit</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="datetime-local"
                                        value={newVisit.date}
                                        onChange={(e) => setNewVisit({...newVisit, date: e.target.value})}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Date"
                                    />
                                    <input
                                        type="text"
                                        value={newVisit.service}
                                        onChange={(e) => setNewVisit({...newVisit, service: e.target.value})}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Service"
                                    />
                                    <input
                                        type="text"
                                        value={newVisit.doctor}
                                        onChange={(e) => setNewVisit({...newVisit, doctor: e.target.value})}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Doctor"
                                    />
                                    <select
                                        value={newVisit.status}
                                        onChange={(e) => setNewVisit({...newVisit, status: e.target.value})}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleAddVisit}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowAddVisit(false)}
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Service</th>
                                        <th className="pb-3 font-medium">Doctor</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeTab === 'future' ? visits.future : 
                                      activeTab === 'past' ? visits.past : 
                                      visits.treatments).map((visit, index) => (
                                        <tr key={index} className="text-sm hover:bg-slate-50 transition">
                                            <td className="py-3 text-slate-700">{visit.date}</td>
                                            <td className="py-3 text-slate-700">{visit.service}</td>
                                            <td className="py-3 text-slate-700">{visit.doctor}</td>
                                            <td className="py-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                                                    {visit.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteVisit(visit.id)}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Files</h4>
                            <button 
                                onClick={() => setShowAddFile(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        {showAddFile && (
                            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New File</h4>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newFile.name}
                                        onChange={(e) => setNewFile({...newFile, name: e.target.value})}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="File name"
                                    />
                                    <input
                                        type="text"
                                        value={newFile.size}
                                        onChange={(e) => setNewFile({...newFile, size: e.target.value})}
                                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Size"
                                    />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleAddFile}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowAddFile(false)}
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {files.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No files yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-700 font-medium">{file.name}</p>
                                                <p className="text-xs text-slate-400">{file.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button className="p-1 text-blue-600 hover:text-blue-800 transition">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-1 text-red-600 hover:text-red-800 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</h4>
                            <button 
                                onClick={() => setShowAddNote(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        {showAddNote && (
                            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New Note</h4>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newNote.name}
                                        onChange={(e) => setNewNote({...newNote, name: e.target.value})}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Note name"
                                    />
                                    <input
                                        type="text"
                                        value={newNote.size}
                                        onChange={(e) => setNewNote({...newNote, size: e.target.value})}
                                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Size"
                                    />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleAddNote}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowAddNote(false)}
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {notes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No notes yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {notes.map((note) => (
                                    <div key={note.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-xs font-bold">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-700 font-medium">{note.name}</p>
                                                <p className="text-xs text-slate-400">{note.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button className="p-1 text-blue-600 hover:text-blue-800 transition">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="p-1 text-red-600 hover:text-red-800 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;