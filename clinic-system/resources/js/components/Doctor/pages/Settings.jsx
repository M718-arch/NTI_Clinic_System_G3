import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Users, Building2, Bell, Lock, Camera, Loader2, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

const SETTINGS_NAV = [
  { key: "profile", label: "Profile", icon: Users },
  { key: "clinic", label: "Clinic", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Lock },
];

function Field({ label, name, value, onChange, type = "text", placeholder = "", disabled = false }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          disabled ? 'bg-slate-50 text-slate-500' : ''
        }`}
      />
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, rows = 3, placeholder = "" }) {
  return (
    <label className="block mt-4">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full text-sm rounded-lg border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

export const SettingsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({
    id: '',
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    experience_years: '',
    consultation_fee: '',
    address: '',
    bio: '',
    clinic_name: '',
    branch: '',
    operating_hours: '',
    specialization_id: '',
    specialization: null,
    status: true,
    image: null,
    image_url: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching doctor profile...');
      const response = await api.get('/doctor/profile');
      console.log('Profile data:', response.data);
      
      const data = response.data;
      
      let firstName = data.first_name || '';
      let lastName = data.last_name || '';
      
      if (!firstName && !lastName && user?.name) {
        const nameParts = user.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      setProfile(prev => ({
        ...prev,
        id: data.id || '',
        user_id: data.user_id || '',
        first_name: firstName,
        last_name: lastName,
        email: data.email || user?.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        experience_years: data.experience_years || '',
        consultation_fee: data.consultation_fee || '',
        address: data.address || '',
        bio: data.bio || '',
        clinic_name: data.clinic_name || '',
        branch: data.branch || '',
        operating_hours: data.operating_hours || '',
        specialization_id: data.specialization_id || '',
        specialization: data.specialization || null,
        status: data.status ?? true,
        image: data.image || null,
        image_url: data.image_url || null,
      }));
      setImageError(false);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      if (user) {
        const nameParts = user.name ? user.name.split(' ') : [];
        setProfile(prev => ({
          ...prev,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
        }));
      }
      
      if (error.response?.status !== 404) {
        setMessage({ type: 'error', text: 'Failed to load profile data' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setProfile({
        ...profile,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const dataToSend = {};
      
      if (profile.first_name?.trim()) dataToSend.first_name = profile.first_name.trim();
      if (profile.last_name?.trim()) dataToSend.last_name = profile.last_name.trim();
      if (profile.email?.trim()) dataToSend.email = profile.email.trim();
      if (profile.phone?.trim()) dataToSend.phone = profile.phone.trim();
      if (profile.gender) dataToSend.gender = profile.gender;
      if (profile.address?.trim()) dataToSend.address = profile.address.trim();
      if (profile.bio?.trim()) dataToSend.bio = profile.bio.trim();
      if (profile.clinic_name?.trim()) dataToSend.clinic_name = profile.clinic_name.trim();
      if (profile.branch?.trim()) dataToSend.branch = profile.branch.trim();
      if (profile.operating_hours?.trim()) dataToSend.operating_hours = profile.operating_hours.trim();
      
      if (profile.experience_years) {
        dataToSend.experience_years = parseInt(profile.experience_years);
      }
      if (profile.consultation_fee) {
        dataToSend.consultation_fee = parseFloat(profile.consultation_fee);
      }
      if (profile.specialization_id) {
        dataToSend.specialization_id = parseInt(profile.specialization_id);
      }
      
      if (profile.date_of_birth) {
        dataToSend.date_of_birth = profile.date_of_birth;
      }
      
      if (profile.status !== undefined) {
        dataToSend.status = profile.status;
      }
      
      console.log('Saving doctor profile:', dataToSend);
      const response = await api.put('/doctor/profile', dataToSend);
      console.log('Save response:', response.data);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        setProfile(prev => ({
          ...prev,
          ...data,
          specialization: data.specialization || prev.specialization,
        }));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.status === 422 && error.response.data.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied. Please check your user role.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Profile not found. Please contact support.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    if (!profile.currentPassword || !profile.newPassword || !profile.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      setSaving(false);
      return;
    }
    
    if (profile.newPassword !== profile.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setSaving(false);
      return;
    }
    
    if (profile.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setSaving(false);
      return;
    }
    
    try {
      const passwordData = {
        current_password: profile.currentPassword,
        new_password: profile.newPassword,
        new_password_confirmation: profile.confirmPassword
      };
      
      const response = await api.put('/doctor/password', passwordData);
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      setProfile({
        ...profile,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Failed to update password';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect.';
      }
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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
    formData.append('image', file);

    setUploadingPhoto(true);
    setImageError(false);
    
    try {
      const response = await api.post('/doctor/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload response:', response.data);
      
      setProfile(prev => ({
        ...prev,
        image: response.data.image_path || response.data.image,
        image_url: response.data.image_url,
      }));
      
      setMessage({ type: 'success', text: 'Profile photo updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
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
      await api.delete('/doctor/image');
      setProfile(prev => ({ ...prev, image: null, image_url: null }));
      setMessage({ type: 'success', text: 'Profile photo removed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      await fetchProfile();
    } catch (error) {
      console.error('Error removing photo:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to remove photo' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // FIXED: Get the correct photo URL with port
  const getPhotoUrl = () => {
    if (!profile?.image_url) return null;
    
    let url = profile.image_url;
    
    // If it's already a full URL with protocol, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Get the base URL from the API client or use environment
    // Since your API uses relative URLs, we need to construct the full URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    // If it starts with /storage/, prepend the base URL
    if (url.startsWith('/storage/')) {
      return `${baseUrl}${url}`;
    }
    
    // If it's just the path without /storage/ (e.g., doctor-images/...)
    if (url.startsWith('doctor-images/')) {
      return `${baseUrl}/storage/${url}`;
    }
    
    // Fallback: use the image path with storage
    if (profile.image && !profile.image.startsWith('http')) {
      return `${baseUrl}/storage/${profile.image}`;
    }
    
    return url;
  };

  const getDisplayName = () => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.name || 'No Name';
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', getPhotoUrl());
    setImageError(true);
    
    // Try fallback with port 8000
    if (profile.image) {
      const fallbackUrl = `http://localhost:8000/storage/${profile.image}`;
      console.log('Trying fallback URL:', fallbackUrl);
      e.target.src = fallbackUrl;
      
      setTimeout(() => {
        if (e.target.naturalWidth === 0) {
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (parent) {
            const initials = document.createElement('span');
            initials.className = 'text-white text-2xl font-bold';
            initials.textContent = (displayName?.charAt(0) || 'D').toUpperCase();
            parent.appendChild(initials);
          }
        }
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName();
  const photoUrl = getPhotoUrl();
  console.log('Final photo URL:', photoUrl);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <p className="text-sm text-slate-500">Manage your account settings</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {SETTINGS_NAV.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => setTab(s.key)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition ${
                    tab === s.key 
                      ? "text-blue-600 border-blue-600" 
                      : "text-slate-500 border-transparent hover:text-slate-700"
                  }`}
                >
                  <Icon size={16} />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 max-w-2xl">
            {message.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {tab === "profile" && (
              <>
                <h3 className="text-sm font-semibold text-slate-700 mb-5">Profile information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {photoUrl && !imageError ? (
                        <img
                          src={photoUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          onLoad={() => setImageError(false)}
                        />
                      ) : (
                        <span>{(displayName?.charAt(0) || 'D').toUpperCase()}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={handlePhotoSelect}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white hover:bg-blue-700 transition disabled:opacity-50"
                      title="Change profile photo"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera size={14} />
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
                  <div>
                    <div className="font-semibold text-slate-800 text-lg">
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-400">{profile.email || user?.email || 'No email'}</div>
                    {profile.specialization && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        {profile.specialization.name || 'No Specialization'}
                      </div>
                    )}
                    {photoUrl && !uploadingPhoto && (
                      <button
                        onClick={handlePhotoRemove}
                        className="text-xs text-red-500 hover:text-red-700 mt-1 transition"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field 
                    label="First Name" 
                    name="first_name"
                    value={profile.first_name || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                  <Field 
                    label="Last Name" 
                    name="last_name"
                    value={profile.last_name || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                  <Field 
                    label="Email" 
                    name="email"
                    value={profile.email || user?.email || ''} 
                    type="email"
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                  <Field 
                    label="Phone" 
                    name="phone"
                    value={profile.phone || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                  <Field 
                    label="Specialization" 
                    name="specialization_id"
                    value={profile.specialization?.name || profile.specialization_id || ''} 
                    onChange={handleInputChange}
                    placeholder="Specialization"
                    disabled={!!profile.specialization}
                  />
                  <Field 
                    label="Years of Experience" 
                    name="experience_years"
                    value={profile.experience_years || ''} 
                    type="number"
                    onChange={handleInputChange}
                    placeholder="Years of experience"
                  />
                </div>
                <TextAreaField
                  label="Bio"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 text-sm font-medium text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </>
            )}

            {tab === "clinic" && (
              <>
                <h3 className="text-sm font-semibold text-slate-700 mb-5">Clinic information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field 
                    label="Clinic name" 
                    name="clinic_name"
                    value={profile.clinic_name || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter clinic name"
                  />
                  <Field 
                    label="Branch" 
                    name="branch"
                    value={profile.branch || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter branch name"
                  />
                  <Field 
                    label="Address" 
                    name="address"
                    value={profile.address || ''} 
                    onChange={handleInputChange}
                    placeholder="Enter clinic address"
                  />
                  <Field 
                    label="Operating hours" 
                    name="operating_hours"
                    value={profile.operating_hours || ''} 
                    onChange={handleInputChange}
                    placeholder="e.g., 09:00 - 17:00"
                  />
                  <Field 
                    label="Consultation Fee" 
                    name="consultation_fee"
                    value={profile.consultation_fee || ''} 
                    type="number"
                    onChange={handleInputChange}
                    placeholder="Enter consultation fee"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 text-sm font-medium text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </>
            )}

            {tab === "notifications" && (
              <>
                <h3 className="text-sm font-semibold text-slate-700 mb-5">Notification preferences</h3>
                {[
                  "New appointment requests",
                  "Appointment reminders", 
                  "Patient messages", 
                  "Payment updates",
                  "Clinic announcements"
                ].map((n) => (
                  <div key={n} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{n}</span>
                    <button className="w-10 h-6 rounded-full bg-blue-600 relative">
                      <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
                    </button>
                  </div>
                ))}
              </>
            )}

            {tab === "security" && (
              <>
                <h3 className="text-sm font-semibold text-slate-700 mb-5">Security</h3>
                <div className="grid grid-cols-1 gap-4 max-w-sm">
                  <Field 
                    label="Current password" 
                    name="currentPassword"
                    type="password" 
                    placeholder="Enter current password"
                    value={profile.currentPassword || ''}
                    onChange={handleInputChange}
                  />
                  <Field 
                    label="New password" 
                    name="newPassword"
                    type="password" 
                    placeholder="Enter new password"
                    value={profile.newPassword || ''}
                    onChange={handleInputChange}
                  />
                  <Field 
                    label="Confirm new password" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="Confirm new password"
                    value={profile.confirmPassword || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                  className="mt-5 text-sm font-medium text-white bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update password'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};