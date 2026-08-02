import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    MessageSquare, Search, Paperclip, Send, Phone, Video,
    MoreVertical, Check, CheckCheck, Clock, AlertCircle,
    Plus, X, Stethoscope, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { PageTopBar } from "../Doctor/components/TopBar";
import { SearchBox } from "../Doctor/components/SearchBox";
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const PatientMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: string }
    const [showNewChat, setShowNewChat] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [doctorSearch, setDoctorSearch] = useState('');
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    const notify = (type, text) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchConversations();
        fetchDoctors();
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

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/messages/conversations');
            setConversations(response.data);
            if (response.data.length > 0) {
                setActiveConversation((prev) => prev || response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            notify('error', 'Could not load your conversations. Pull to refresh and try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            setLoadingDoctors(true);
            const response = await api.get('/patient/doctors');
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoadingDoctors(false);
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
                prev.map(c =>
                    c.id === conversationId ? { ...c, unread_count: 0 } : c
                )
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const openConversation = (conv) => {
        setActiveConversation(conv);
        setShowChatOnMobile(true);
    };

    const startNewConversation = async (doctor) => {
        const receiverId = doctor.user_id || doctor.id;

        try {
            await api.post('/messages/send', {
                receiver_id: receiverId,
                content: `Hello Dr. ${doctor.name}, I have a question about my health.`,
            });

            setShowNewChat(false);
            setDoctorSearch('');

            const response = await api.get('/messages/conversations');
            setConversations(response.data);

            const newConv = response.data.find(c => c.other_user?.id === receiverId);
            if (newConv) {
                openConversation(newConv);
            }

            notify('success', 'Conversation started.');
        } catch (error) {
            console.error('Error starting conversation:', error);
            notify('error', 'Could not start the conversation. Please try again.');
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
                prev.map(m =>
                    m.id === tempId ? { ...response.data.data, is_sent: true } : m
                )
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

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
    };

    const getStatusIcon = (msg) => {
        if (msg.is_temp && !msg.error) return <Clock size={12} className="text-blue-200" />;
        if (msg.error) return <AlertCircle size={12} className="text-red-200" />;
        if (msg.is_read) return <CheckCheck size={12} className="text-blue-200" />;
        return <Check size={12} className="text-blue-200" />;
    };

    // Group messages into day buckets so the chat can show date dividers.
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

    const filteredDoctors = doctors.filter(d =>
        d.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading your conversations…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                        toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                >
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    {toast.text}
                </div>
            )}

            <PageTopBar
                title="Messages"
                icon={MessageSquare}
                right={
                    <div className="flex items-center gap-2">
                        <SearchBox
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-[0.98] transition"
                        >
                            <Plus size={16} />
                            New Chat
                        </button>
                    </div>
                }
            />

            <div className="flex-1 flex min-h-0 rounded-xl overflow-hidden border border-slate-200 bg-white mt-2">
                {/* Conversations List */}
                <div className={`w-full md:w-80 shrink-0 border-r border-slate-200 overflow-auto bg-white ${showChatOnMobile ? 'hidden md:block' : 'block'}`}>
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                <MessageSquare size={26} className="opacity-40" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">No conversations yet</p>
                            <p className="text-xs text-slate-400 mt-1">Start a chat with your doctor to ask a question.</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                            >
                                Start a new chat
                            </button>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isActive = activeConversation?.id === conv.id;
                            const otherUser = conv.other_user;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => openConversation(conv)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 text-left hover:bg-slate-50 transition relative ${
                                        isActive ? 'bg-blue-50/70' : ''
                                    }`}
                                >
                                    {isActive && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600" />}
                                    <div className="relative shrink-0">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                            {getInitials(otherUser?.name)}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                                                {otherUser?.name ? `Dr. ${otherUser.name}` : 'Unknown User'}
                                            </span>
                                            {conv.last_message_time && (
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                    {formatTime(conv.last_message_time)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5 gap-2">
                                            <span className={`text-xs truncate ${conv.unread_count > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                                {conv.last_message || 'No messages yet'}
                                            </span>
                                            {conv.unread_count > 0 && (
                                                <span className="bg-blue-600 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 px-1 font-semibold">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Chat Area */}
                {activeConversation ? (
                    <div className={`flex-1 flex-col min-w-0 bg-slate-50/40 ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 md:px-5 h-16 border-b border-slate-200 bg-white shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    onClick={() => setShowChatOnMobile(false)}
                                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 text-slate-500"
                                    aria-label="Back to conversations"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                    {getInitials(activeConversation.other_user?.name)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-800 truncate">
                                        {activeConversation.other_user?.name ? `Dr. ${activeConversation.other_user.name}` : 'Unknown User'}
                                    </div>
                                    <div className="text-[11px] text-slate-400">Usually replies within a day</div>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                                <button className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600" aria-label="Call">
                                    <Phone size={18} />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600" aria-label="Video call">
                                    <Video size={18} />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600" aria-label="More options">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={chatContainerRef} className="flex-1 overflow-auto px-4 md:px-5 py-4 bg-slate-50/40">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                                    <MessageSquare size={44} className="mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No messages yet</p>
                                    <p className="text-xs">Say hello to Dr. {activeConversation.other_user?.name}</p>
                                </div>
                            ) : (
                                groupedMessages.map((group, gi) => (
                                    <div key={gi}>
                                        <div className="flex items-center justify-center my-3">
                                            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                                {formatDayLabel(group.day)}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {group.items.map((msg) => {
                                                const isMine = msg.sender_id === user?.id;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMine ? 'flex-row-reverse' : ''}`}>
                                                            <div
                                                                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                                                    isMine
                                                                        ? `bg-blue-600 text-white rounded-br-sm ${msg.error ? 'opacity-60 ring-1 ring-red-400' : ''}`
                                                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                                                                }`}
                                                            >
                                                                {msg.content}
                                                                <div className={`flex items-center gap-1 text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                    {formatMessageTime(msg.created_at)}
                                                                    {isMine && getStatusIcon(msg)}
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

                        {/* Message Input */}
                        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-3 border-t border-slate-200 bg-white shrink-0">
                            <button className="text-slate-400 hover:text-slate-600 transition shrink-0" aria-label="Attach file">
                                <Paperclip size={20} />
                            </button>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 text-sm rounded-full border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition min-w-0"
                                disabled={sending}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || sending}
                                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm shrink-0"
                                aria-label="Send message"
                            >
                                {sending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/40">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare size={36} className="text-slate-300" />
                            </div>
                            <p className="text-slate-600 font-medium">Select a conversation</p>
                            <p className="text-sm text-slate-400">Choose a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal - Doctors List */}
            {showNewChat && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">New conversation</h3>
                            <button
                                onClick={() => { setShowNewChat(false); setDoctorSearch(''); }}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-500"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="relative mb-4 shrink-0">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search doctors by name or specialty..."
                                value={doctorSearch}
                                onChange={(e) => setDoctorSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            />
                        </div>

                        <div className="space-y-2 overflow-auto">
                            {loadingDoctors ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredDoctors.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <Stethoscope size={30} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">
                                        {doctors.length === 0 ? 'No doctors available yet' : 'No doctors match your search'}
                                    </p>
                                </div>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <button
                                        key={doctor.id}
                                        onClick={() => startNewConversation(doctor)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100 text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                            {getInitials(doctor.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-slate-800 truncate">Dr. {doctor.name}</p>
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                                                    {doctor.specialization || 'General'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{doctor.clinic_name || 'No clinic'}</p>
                                            {doctor.consultation_fee && (
                                                <p className="text-[11px] text-slate-400">Consultation: ${doctor.consultation_fee}</p>
                                            )}
                                        </div>
                                        <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg shrink-0">
                                            Message
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientMessages;