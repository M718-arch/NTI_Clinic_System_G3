// resources/js/components/receptionist/Settings.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../shared/ToastProvider';

/**
 * Settings & Profile Component
 * 
 * Features:
 * - Profile information management
 * - Password change with validation
 * - Staff ID display
 * - Role display
 * - Toast notifications for feedback
 * - Phase 6: Billing settings (future)
 * - Glassmorphism design
 */
const Settings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // ===== STATE =====
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    const [pwForm, setPwForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [savingPw, setSavingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);
    const [pwError, setPwError] = useState(null);

    // ===== LOAD PROFILE =====
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await receptionistApi.getProfile();
                const data = response.data || response;
                setProfile(data);
                
                // Populate form with user data
                setForm({
                    name: data.user?.name || user?.name || '',
                    email: data.user?.email || user?.email || '',
                    phone: data.phone || user?.phone || '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                });
            } catch (err) {
                const message = err.response?.data?.message || err.message || 'Failed to load profile';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [toast, user]);

    // ===== HANDLERS =====
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMsg(null);

        try {
            await receptionistApi.updateProfile(form);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
            toast.success('Profile updated successfully');
            
            // Update user context if available
            if (user) {
                // You might want to update the user context here
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to update profile';
            setProfileMsg({ type: 'error', text: message });
            toast.error(message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setSavingPw(true);
        setPwMsg(null);
        setPwError(null);

        // Client-side validation
        if (pwForm.new_password.length < 8) {
            setPwError('New password must be at least 8 characters.');
            setSavingPw(false);
            return;
        }

        if (pwForm.new_password !== pwForm.new_password_confirmation) {
            setPwError('New passwords do not match.');
            setSavingPw(false);
            return;
        }

        try {
            await receptionistApi.updatePassword({
                current_password: pwForm.current_password,
                new_password: pwForm.new_password,
                new_password_confirmation: pwForm.new_password_confirmation,
            });
            
            setPwMsg('Password updated successfully.');
            toast.success('Password updated successfully');
            setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to update password';
            setPwError(message);
            toast.error(message);
        } finally {
            setSavingPw(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // ===== LOADING =====
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="mg-spinner" />
            </div>
        );
    }

    // ===== RENDER =====
    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                    Settings &amp; Profile
                </h2>
                <p className="text-[#424752] mt-1">
                    Manage your receptionist account details and security preferences.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="glass-panel rounded-xl p-4 h-fit sticky top-24">
                    <nav className="space-y-1">
                        <button 
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-[#00478d]/10 text-[#00478d] font-medium text-left transition"
                            onClick={() => document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="material-symbols-outlined">person</span>
                            Profile Information
                        </button>
                        <button 
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#424752] hover:bg-black/5 transition text-left"
                            onClick={() => document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="material-symbols-outlined">security</span>
                            Security
                        </button>
                        <button 
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#424752] hover:bg-black/5 transition text-left opacity-50 cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            Notifications
                            <span className="ml-auto text-xs text-[#424752]">Soon</span>
                        </button>
                        <div className="border-t border-black/5 my-2" />
                        <button 
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#ba1a1a] hover:bg-red-50 transition text-left"
                            onClick={() => navigate('/receptionist')}
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to Dashboard
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="md:col-span-3 space-y-6">
                    {/* Profile Section */}
                    <div id="profile-section" className="glass-panel rounded-xl p-6 scroll-mt-24">
                        <h3 className="text-lg font-semibold text-[#191c1e] flex items-center gap-2 border-b border-black/5 pb-4 mb-4">
                            <span className="material-symbols-outlined text-[#00478d]">manage_accounts</span>
                            Profile Details
                        </h3>

                        <form onSubmit={handleProfileSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Full Name <span className="text-[#ba1a1a]">*</span>
                                    </label>
                                    <input
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        value={form.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        First Name
                                    </label>
                                    <input
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        value={form.first_name}
                                        onChange={(e) => handleFieldChange('first_name', e.target.value)}
                                        placeholder="Enter first name"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        value={form.last_name}
                                        onChange={(e) => handleFieldChange('last_name', e.target.value)}
                                        placeholder="Enter last name"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Work Email <span className="text-[#ba1a1a]">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        value={form.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        required
                                        placeholder="Enter work email"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        value={form.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                {/* Staff ID - Read Only */}
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Staff ID
                                    </label>
                                    <input
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm bg-[#f2f4f6] cursor-not-allowed"
                                        value={profile?.id ? `REC-${String(profile.id).padStart(4, '0')}` : 'REC-0000'}
                                        disabled
                                    />
                                </div>

                                {/* Role - Read Only */}
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Role
                                    </label>
                                    <input
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm bg-[#f2f4f6] cursor-not-allowed"
                                        value={profile?.role || 'Receptionist'}
                                        disabled
                                    />
                                </div>
                            </div>

                            {profileMsg && (
                                <div className={`mt-4 text-sm p-3 rounded-lg ${
                                    profileMsg.type === 'error' 
                                        ? 'bg-red-50 text-red-700 border border-red-200' 
                                        : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                    {profileMsg.text}
                                </div>
                            )}

                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="px-6 py-2.5 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition"
                                    onClick={() => setForm({
                                        name: profile?.user?.name || '',
                                        email: profile?.user?.email || '',
                                        phone: profile?.phone || '',
                                        first_name: profile?.first_name || '',
                                        last_name: profile?.last_name || '',
                                    })}
                                    disabled={savingProfile}
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="px-6 py-2.5 rounded-lg bg-[#00478d] text-white hover:bg-[#00366e] transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Section */}
                    <div id="security-section" className="glass-panel rounded-xl p-6 scroll-mt-24">
                        <h3 className="text-lg font-semibold text-[#191c1e] flex items-center gap-2 border-b border-black/5 pb-4 mb-4">
                            <span className="material-symbols-outlined text-[#00478d]">lock</span>
                            Password &amp; Security
                        </h3>

                        <p className="text-sm text-[#424752] mb-4">
                            Ensure your account is using a long, random password to stay secure.
                            <span className="block text-xs mt-1 text-[#424752]/70">
                                Password must be at least 8 characters.
                            </span>
                        </p>

                        <form onSubmit={handlePasswordUpdate}>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Current Password <span className="text-[#ba1a1a]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        placeholder="Enter current password"
                                        value={pwForm.current_password}
                                        onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        New Password <span className="text-[#ba1a1a]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        placeholder="Enter new password (min 8 chars)"
                                        value={pwForm.new_password}
                                        onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#424752] block mb-1">
                                        Confirm New Password <span className="text-[#ba1a1a]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                                        placeholder="Confirm new password"
                                        value={pwForm.new_password_confirmation}
                                        onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
                                        required
                                    />
                                    {pwForm.new_password && pwForm.new_password_confirmation && (
                                        <p className={`text-xs mt-1 ${
                                            pwForm.new_password === pwForm.new_password_confirmation 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {pwForm.new_password === pwForm.new_password_confirmation 
                                                ? '✓ Passwords match' 
                                                : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {pwError && (
                                <div className="mt-3 text-sm p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                                    {pwError}
                                </div>
                            )}

                            {pwMsg && (
                                <div className="mt-3 text-sm p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">
                                    {pwMsg}
                                </div>
                            )}

                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={savingPw}
                                    className="px-6 py-2.5 rounded-lg border border-[#00478d]/20 text-[#00478d] hover:bg-[#00478d]/5 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">key</span>
                                    {savingPw ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Phase 6: Billing Settings (Future) */}
                    <div className="glass-panel rounded-xl p-6 opacity-50">
                        <h3 className="text-lg font-semibold text-[#191c1e] flex items-center gap-2 border-b border-black/5 pb-4 mb-4">
                            <span className="material-symbols-outlined text-[#00478d]">receipt_long</span>
                            Billing Settings
                            <span className="ml-2 text-xs bg-[#00478d]/10 text-[#00478d] px-2 py-0.5 rounded-full">
                                Coming Soon
                            </span>
                        </h3>
                        <p className="text-sm text-[#424752]">
                            Invoice templates, payment methods, and billing preferences will be configurable here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;