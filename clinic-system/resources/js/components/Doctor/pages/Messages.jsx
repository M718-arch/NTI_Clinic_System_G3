import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    MessageSquare, Search, Paperclip, Send, Phone, Info,
    MoreVertical, Check, CheckCheck, Clock, AlertCircle,
    Plus, X, Users, ArrowLeft, CheckCircle2, Camera, Loader2,
    Lock, Download, FileText
} from 'lucide-react';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

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
    if (path.startsWith('doctor-images/')) {
        return `${baseUrl}/storage/${path}`;
    }
    if (!path.startsWith('/')) {
        return `${baseUrl}/storage/${path}`;
    }
    return `${baseUrl}${path}`;
};

// Reusable Avatar Component
const Avatar = ({ src, name, size = 'w-10 h-10', textSize = 'text-sm', className = '' }) => {
    const [failed, setFailed] = useState(false);
    const initials = name?.charAt(0)?.toUpperCase() || '?';

    const fullSrc = src ? getFullImageUrl(src) : null;

    if (fullSrc && !failed) {
        return (
            <img
                src={fullSrc}
                alt={name || 'Avatar'}
                className={`${size} rounded-full object-cover shrink-0 ${className}`}
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div className={`${size} rounded-full bg-gradient-to-br from-[#005EB8] to-[#003d82] flex items-center justify-center text-white font-semibold ${textSize} ${className}`}>
            {initials}
        </div>
    );
};

export const Messages = ({ updateUnreadCount }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [toast, setToast] = useState(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const photoInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    const notify = (type, text) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    };

    const getDoctorAvatar = () => {
        if (doctorProfile?.image_url) return doctorProfile.image_url;
        if (doctorProfile?.photo_url) return doctorProfile.photo_url;
        if (doctorProfile?.avatar) return doctorProfile.avatar;
        if (doctorProfile?.image) return doctorProfile.image;
        return null;
    };

    useEffect(() => {
        fetchConversations();
        fetchPatients();
        fetchDoctorProfile();
        const interval = setInterval(() => {
            if (activeConversation) {
                fetchMessages(activeConversation.id);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id);
            markAsRead(activeConversation.id);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchDoctorProfile = async () => {
        try {
            const response = await api.get('/doctor/profile');
            setDoctorProfile(response.data);
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        }
    };

    const handlePhotoSelect = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            notify('error', 'Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            notify('error', 'Image must be 2MB or smaller');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploadingPhoto(true);
        try {
            const response = await api.post('/doctor/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setDoctorProfile((prev) => ({ 
                ...prev, 
                image: response.data.image,
                image_url: response.data.image_url 
            }));
            
            notify('success', 'Profile photo updated!');
            await fetchDoctorProfile();
        } catch (error) {
            console.error('Error uploading photo:', error);
            notify('error', error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/messages/conversations');
            setConversations(response.data);
            if (response.data.length > 0) {
                setActiveConversation((prev) => prev || response.data[0]);
            }
            if (updateUnreadCount) updateUnreadCount();
        } catch (error) {
            console.error('Error fetching conversations:', error);
            notify('error', 'Could not load your conversations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            setLoadingPatients(true);
            const response = await api.get('/doctor/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await api.get(`/messages/${conversationId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await api.post(`/messages/${conversationId}/read`);
            setConversations(prev =>
                prev.map(c => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
            );
            if (updateUnreadCount) updateUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const openConversation = (conv) => {
        setActiveConversation(conv);
        setShowChatOnMobile(true);
    };

    const startNewConversation = async (patient) => {
        const receiverId = patient.user_id || patient.id;

        try {
            await api.post('/messages/send', {
                receiver_id: receiverId,
                content: `Hello ${patient.name}, how can I help you today?`,
            });

            setShowNewChat(false);
            setPatientSearch('');

            const response = await api.get('/messages/conversations');
            setConversations(response.data);

            const newConv = response.data.find(c => c.other_user?.id === receiverId);
            if (newConv) {
                openConversation(newConv);
            }

            notify('success', 'Conversation started.');
            if (updateUnreadCount) updateUnreadCount();
        } catch (error) {
            console.error('Error starting conversation:', error);
            notify('error', error.response?.data?.message || 'Could not start the conversation. Please try again.');
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            content: messageText,
            sender_id: user?.id,
            receiver_id: activeConversation.other_user?.id,
            created_at: new Date().toISOString(),
            is_read: false,
            is_sent: true,
            is_temp: true,
        };
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        try {
            const response = await api.post('/messages/send', {
                receiver_id: activeConversation.other_user?.id,
                content: messageText,
                conversation_id: activeConversation.id,
            });

            setMessages(prev =>
                prev.map(m => (m.id === tempId ? { ...response.data.data, is_sent: true } : m))
            );

            setConversations(prev =>
                prev.map(c =>
                    c.id === activeConversation.id
                        ? { ...c, last_message: messageText, last_message_time: new Date().toISOString() }
                        : c
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev =>
                prev.map(m => (m.id === tempId ? { ...m, is_sent: false, error: true } : m))
            );
            notify('error', 'Message failed to send.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return d.toLocaleDateString();
    };

    const formatMessageTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDayLabel = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    };

    const getStatusIcon = (msg) => {
        if (msg.is_temp && !msg.error) return <Clock size={12} className="text-blue-200" />;
        if (msg.error) return <AlertCircle size={12} className="text-red-200" />;
        if (msg.is_read) return <CheckCheck size={12} className="text-blue-200" />;
        return <Check size={12} className="text-blue-200" />;
    };

    const groupedMessages = useMemo(() => {
        const groups = [];
        let currentDay = null;
        let currentBucket = null;

        messages.forEach((msg) => {
            const dayKey = new Date(msg.created_at).toDateString();
            if (dayKey !== currentDay) {
                currentDay = dayKey;
                currentBucket = { day: msg.created_at, items: [] };
                groups.push(currentBucket);
            }
            currentBucket.items.push(msg);
        });

        return groups;
    }, [messages]);

    const filteredConversations = conversations.filter(c =>
        c.other_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.email?.toLowerCase().includes(patientSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#f7f9fb]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-[#005EB8] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#6b7280]">Loading your conversations…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 relative bg-[#f7f9fb] overflow-hidden">
            {/* Background atmospheric glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-[#005EB8]/15 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-[#6f4b94]/15 rounded-full blur-[150px]"></div>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                        toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                >
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {toast.text}
                </div>
            )}

            <main className="flex-1 flex overflow-hidden z-10 p-4 gap-4 max-w-7xl mx-auto w-full">
                {/* Left Panel: Conversations List */}
                <aside className="w-80 glass-panel rounded-xl flex flex-col shrink-0 overflow-hidden shadow-lg">
                    {/* Header & Search */}
                    <div className="p-4 border-b border-[rgba(0,0,0,0.05)] bg-white/20">
                        <h2 className="text-lg font-semibold text-[#191c1e] mb-4">Secure Messages</h2>
                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                            <input
                                className="w-full glass-input rounded-full py-2 pl-10 pr-4 text-sm placeholder-[#6b7280]"
                                placeholder="Search patients..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-[#6b7280] p-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center mb-3">
                                    <MessageSquare size={26} className="opacity-40" />
                                </div>
                                <p className="text-sm font-medium text-[#191c1e]">No conversations yet</p>
                                <p className="text-xs text-[#6b7280] mt-1">Message one of your patients to get started.</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="mt-4 px-4 py-2 bg-[#005EB8] text-white text-sm rounded-lg hover:bg-[#003d82] transition"
                                >
                                    Start a new chat
                                </button>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const isActive = activeConversation?.id === conv.id;
                                const otherUser = conv.other_user;
                                const avatarUrl = otherUser?.photo_url || otherUser?.image_url || null;

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => openConversation(conv)}
                                        className={`w-full p-4 border-b border-[rgba(0,0,0,0.05)] flex items-start gap-3 hover:bg-white/50 transition-colors ${
                                            isActive ? 'bg-blue-50/70 border-l-2 border-l-[#005EB8]' : 'border-l-2 border-l-transparent'
                                        }`}
                                    >
                                        <div className="relative">
                                            <Avatar src={avatarUrl} name={otherUser?.name} size="w-10 h-10" />
                                            {conv.unread_count > 0 && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-[#005EB8]' : 'text-[#191c1e]'}`}>
                                                    {otherUser?.name || 'Unknown User'}
                                                </h3>
                                                {conv.last_message_time && (
                                                    <span className={`text-xs ${isActive ? 'text-[#005EB8]' : 'text-[#6b7280]'} font-medium`}>
                                                        {formatTime(conv.last_message_time)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate ${isActive ? 'text-[#191c1e]' : 'text-[#6b7280]'}`}>
                                                {conv.last_message || 'No messages yet'}
                                            </p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <div className="w-2 h-2 bg-[#005EB8] rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,94,184,0.5)]"></div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Right Panel: Active Chat */}
                <section className="flex-1 glass-panel-elevated rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-[rgba(0,0,0,0.05)] bg-white/20 flex justify-between items-center z-10">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowChatOnMobile(false)}
                                        className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-white/30 text-[#6b7280]"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <Avatar
                                        src={activeConversation.other_user?.photo_url || activeConversation.other_user?.image_url || null}
                                        name={activeConversation.other_user?.name}
                                        size="w-12 h-12"
                                        className="border-2 border-white shadow-sm"
                                    />
                                    <div>
                                        <h2 className="font-bold text-lg text-[#191c1e] flex items-center gap-2">
                                            {activeConversation.other_user?.name || 'Unknown User'}
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-[#005EB8] text-[10px] font-semibold border border-[#005EB8]/20 uppercase tracking-wider">
                                                Patient
                                            </span>
                                        </h2>
                                        <p className="text-xs text-[#6b7280]">DOB: 11/04/1978 • ID: #PT-8829</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="glass-button p-2 rounded-lg text-[#6b7280] hover:text-[#005EB8] flex items-center justify-center w-10 h-10">
                                        <Phone size={18} />
                                    </button>
                                    <button className="glass-button p-2 rounded-lg text-[#6b7280] hover:text-[#005EB8] flex items-center justify-center w-10 h-10">
                                        <Info size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Message Thread */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/10 relative z-0">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-[#6b7280] text-center">
                                        <MessageSquare size={44} className="mb-3 opacity-20" />
                                        <p className="text-sm font-medium text-[#191c1e]">No messages yet</p>
                                        <p className="text-xs text-[#6b7280]">Say hello to {activeConversation.other_user?.name}</p>
                                    </div>
                                ) : (
                                    groupedMessages.map((group, gi) => (
                                        <div key={gi}>
                                            <div className="flex justify-center">
                                                <span className="px-3 py-1 rounded-full bg-white/60 text-[10px] font-medium text-[#6b7280] border border-[rgba(0,0,0,0.05)] backdrop-blur-sm">
                                                    {formatDayLabel(group.day)}
                                                </span>
                                            </div>
                                            <div className="space-y-4 mt-4">
                                                {group.items.map((msg, mi) => {
                                                    const isMine = msg.sender_id === user?.id;
                                                    const senderName = isMine ? 'You' : activeConversation.other_user?.name;
                                                    const senderAvatar = isMine 
                                                        ? getDoctorAvatar()
                                                        : (activeConversation.other_user?.photo_url || activeConversation.other_user?.image_url || null);
                                                    
                                                    const prev = group.items[mi - 1];
                                                    const showAvatar = !isMine && (mi === 0 || prev?.sender_id !== msg.sender_id);

                                                    return (
                                                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} max-w-3xl ${isMine ? 'ml-auto' : ''}`}>
                                                            <div className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''} items-end`}>
                                                                {!isMine && showAvatar && (
                                                                    <Avatar
                                                                        src={senderAvatar}
                                                                        name={senderName}
                                                                        size="w-8 h-8"
                                                                        className="border border-[rgba(0,0,0,0.05)] shrink-0 mb-1"
                                                                    />
                                                                )}
                                                                {!isMine && !showAvatar && <div className="w-8 shrink-0" />}
                                                                <div className="flex flex-col gap-1">
                                                                    {!isMine && (
                                                                        <span className="text-[10px] text-[#6b7280] ml-1">{senderName}</span>
                                                                    )}
                                                                    <div
                                                                        className={`p-4 rounded-2xl text-sm shadow-sm ${
                                                                            isMine
                                                                                ? 'bg-[#005EB8] text-white rounded-br-sm'
                                                                                : 'bg-white border border-[rgba(0,0,0,0.05)] text-[#191c1e] rounded-bl-sm'
                                                                        } ${msg.error ? 'opacity-60 ring-1 ring-red-400' : ''}`}
                                                                    >
                                                                        {msg.content}
                                                                        <div className={`flex items-center gap-1 text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-[#6b7280]'}`}>
                                                                            {formatMessageTime(msg.created_at)}
                                                                            {isMine && getStatusIcon(msg)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-[rgba(0,0,0,0.05)] bg-white/20 backdrop-blur-sm z-10">
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={handlePhotoSelect}
                                        disabled={uploadingPhoto}
                                        className="p-3 text-[#6b7280] hover:text-[#005EB8] transition-colors shrink-0 rounded-full hover:bg-white/30 disabled:opacity-50"
                                    >
                                        {uploadingPhoto ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : getDoctorAvatar() ? (
                                            <Avatar
                                                src={getDoctorAvatar()}
                                                name={doctorProfile?.full_name || 'You'}
                                                size="w-8 h-8"
                                            />
                                        ) : (
                                            <Camera size={20} />
                                        )}
                                    </button>
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image.webp"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />

                                    <button className="p-3 text-[#6b7280] hover:text-[#005EB8] transition-colors shrink-0 rounded-full hover:bg-white/30">
                                        <Paperclip size={20} />
                                    </button>

                                    <textarea
                                        ref={inputRef}
                                        className="flex-1 glass-input rounded-xl py-3 px-4 text-sm resize-none min-h-[44px] max-h-32 focus:ring-1 focus:ring-[#005EB8]/50"
                                        placeholder="Type a secure message..."
                                        rows="1"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={sending}
                                    />

                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="p-3 bg-[#005EB8] text-white border border-[#005EB8]/30 hover:bg-[#003d82] transition-all duration-300 shrink-0 rounded-xl shadow-[0_0_15px_rgba(0,94,184,0.2)] group disabled:opacity-40"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send size={20} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-2 px-12">
                                    <span className="text-[10px] text-[#6b7280] flex items-center gap-1">
                                        <Lock size={12} />
                                        End-to-end encrypted medical communication
                                    </span>
                                    <span className="text-[10px] text-[#6b7280]">Press Enter to send, Shift+Enter for new line</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-white/30 border border-[rgba(0,0,0,0.05)] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare size={36} className="text-[#6b7280]" />
                                </div>
                                <p className="text-[#191c1e] font-medium">Select a conversation</p>
                                <p className="text-sm text-[#6b7280]">Choose a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* New Chat Modal */}
            {showNewChat && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col border border-[rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#191c1e]">New conversation</h3>
                            <button
                                onClick={() => { setShowNewChat(false); setPatientSearch(''); }}
                                className="p-1.5 hover:bg-white/50 rounded-lg transition text-[#6b7280]"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-xs text-[#6b7280] mb-4">Only patients who have booked an appointment with you appear here.</p>

                        <div className="relative mb-4 shrink-0">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                            <input
                                type="text"
                                placeholder="Search your patients..."
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:ring-1 focus:ring-[#005EB8]/50"
                            />
                        </div>

                        <div className="space-y-2 overflow-auto">
                            {loadingPatients ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-7 h-7 border-[3px] border-[#005EB8] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="text-center py-10 text-[#6b7280]">
                                    <Users size={30} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">
                                        {patients.length === 0 ? "You don't have any booked patients yet" : 'No patients match your search'}
                                    </p>
                                </div>
                            ) : (
                                filteredPatients.map((patient) => {
                                    const avatarUrl = patient.photo_url || patient.image_url || null;
                                    return (
                                        <button
                                            key={patient.id}
                                            onClick={() => startNewConversation(patient)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition border border-[rgba(0,0,0,0.05)] text-left"
                                        >
                                            <Avatar src={avatarUrl} name={patient.name} size="w-10 h-10" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#191c1e] truncate">{patient.name}</p>
                                                <p className="text-xs text-[#6b7280] truncate">{patient.email || 'No email'}</p>
                                            </div>
                                            <span className="px-3 py-1.5 bg-[#005EB8] text-white text-xs font-medium rounded-lg hover:bg-[#003d82] transition">
                                                Message
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
                }
                
                .glass-panel-elevated {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
                }

                .glass-button {
                    background: rgba(255, 255, 255, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    transition: all 0.2s ease;
                }
                
                .glass-button:hover {
                    background: rgba(255, 255, 255, 0.5);
                    box-shadow: 0 0 15px rgba(0, 94, 184, 0.1);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    color: #191c1e;
                }
                
                .glass-input:focus {
                    outline: none;
                    border-color: rgba(0, 94, 184, 0.5);
                    box-shadow: 0 0 20px rgba(0, 94, 184, 0.1);
                }

                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(0, 94, 184, 0.2);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 94, 184, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Messages;