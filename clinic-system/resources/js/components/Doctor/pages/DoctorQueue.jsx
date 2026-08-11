// resources/js/components/Doctor/pages/DoctorQueue.jsx

import React, { useState, useEffect, useRef } from 'react';
import { createDoctorPhase8Api } from '../../../api/doctorapi';

/* ------------------------------------------------------------------ */
/* CLINICAL CLARITY GLASS — Light variant                             */
/* Tokens sourced 1:1 from DESIGN.md, matching Calendar.jsx/Sidebar.jsx*/
/* ------------------------------------------------------------------ */

const pageBg = {
    backgroundColor: '#f7f9fb',
    backgroundImage:
        'radial-gradient(circle at 15% 20%, rgba(0,94,184,0.06), transparent 42%),' +
        'radial-gradient(circle at 85% 10%, rgba(0,71,141,0.05), transparent 42%),' +
        'radial-gradient(circle at 50% 100%, rgba(0,94,184,0.04), transparent 48%)',
};

const glassPanel = 'bg-white/70 backdrop-blur-[12px] border border-black/[0.06] shadow-[0_8px_28px_-10px_rgba(16,24,40,0.10)]';
const glassRow = 'bg-white/50 hover:bg-white/85 border border-black/[0.05] backdrop-blur-[6px] transition-colors';
const btnPrimary = 'bg-[#00478d] hover:bg-[#00478d]/90 text-white';
const btnSuccess = 'bg-[#0f7a4d] hover:bg-[#0f7a4d]/90 text-white';
const btnGhost = 'bg-black/[0.05] hover:bg-black/[0.08] text-[#424752]';

export default function DoctorQueue({ token, onSelectPatient }) {
    const [queue, setQueue] = useState({ waiting: [], in_progress: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);
    const api = createDoctorPhase8Api(token);
    const isMounted = useRef(true);
    const intervalRef = useRef(null);

    const fetchQueue = async () => {
        if (!isMounted.current) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const data = await api.getQueue();
            
            if (!isMounted.current) return;
            
            if (data) {
                let waiting = [];
                let inProgress = [];
                
                if (data.waiting && Array.isArray(data.waiting)) {
                    waiting = data.waiting || [];
                    inProgress = data.in_progress || [];
                } else if (Array.isArray(data)) {
                    waiting = data;
                } else if (data.data && Array.isArray(data.data)) {
                    waiting = data.data;
                }
                
                const normalizedWaiting = waiting
                    .map(item => normalizeQueueItem(item))
                    .filter(item => item !== null);
                    
                const normalizedInProgress = inProgress
                    .map(item => normalizeQueueItem(item))
                    .filter(item => item !== null);
                
                if (isMounted.current) {
                    setQueue({ 
                        waiting: normalizedWaiting, 
                        in_progress: normalizedInProgress 
                    });
                    setLoading(false);
                }
            } else {
                if (isMounted.current) {
                    setQueue({ waiting: [], in_progress: [] });
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Error fetching queue:', err);
            if (isMounted.current) {
                setError('Failed to load queue. Please try again.');
                setLoading(false);
            }
        }
    };

    const normalizeQueueItem = (item) => {
        if (!item) return null;
        
        // Extract booking ID
        const bookingId = item?.booking_id || 
                         item?.booking?.id || 
                         item?.id || 
                         item?.bookingId;
        
        if (!bookingId) {
            return null;
        }
        
        // Extract patient data - check all possible locations
        let patient = item?.patient || item?.user || {};
        
        // If patient is nested in booking
        if (item?.booking?.patient) {
            patient = item.booking.patient;
        }
        
        // Extract patient ID from various locations
        const patientId = patient?.id || 
                         item?.patient_id || 
                         item?.patientId || 
                         item?.user_id ||
                         item?.booking?.patient_id ||
                         (patient?.user ? patient.user.id : null);
        
        // Extract patient name
        const patientName = patient?.name || 
                           patient?.full_name ||
                           (patient?.first_name && patient?.last_name ? 
                               `${patient.first_name} ${patient.last_name}` : null) ||
                           item?.patient_name ||
                           item?.name ||
                           'Unknown Patient';
        
        // Get patient photo if available
        const patientPhoto = patient?.photo || 
                            patient?.photo_url || 
                            patient?.avatar || 
                            null;
        
        // Extract status
        const status = item?.status || 
                      item?.booking?.status || 
                      'waiting';
        
        // Extract time
        const time = item?.time || 
                    item?.booking?.time || 
                    item?.start_time ||
                    item?.appointment_time;
        
        // Extract date
        const date = item?.date || 
                    item?.booking?.date || 
                    item?.appointment_date;
        
        // Extract service
        const service = item?.service || 
                       item?.booking?.service || 
                       (item?.service_name ? { name: item.service_name } : null);
        
        return {
            booking_id: bookingId,
            id: bookingId,
            patient_id: patientId,
            patient: {
                id: patientId,
                name: patientName,
                photo: patientPhoto,
                ...patient
            },
            status: status,
            time: time || 'N/A',
            date: date,
            service: service,
            room: item?.room || item?.booking?.room,
        };
    };

    useEffect(() => {
        isMounted.current = true;
        fetchQueue();
        
        intervalRef.current = setInterval(() => {
            if (isMounted.current) {
                fetchQueue();
            }
        }, 30000);
        
        return () => {
            isMounted.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const handleCall = async (item) => {
        const bookingId = item.booking_id || item.id;
        if (!bookingId) {
            setError('Cannot call patient: missing booking ID');
            return;
        }

        setProcessing(bookingId);
        try {
            await api.callPatient(bookingId);
            await fetchQueue();
        } catch (err) {
            console.error('Error calling patient:', err);
            setError('Failed to call patient: ' + (err.message || 'Unknown error'));
        } finally {
            setProcessing(null);
        }
    };

    const handleComplete = async (item) => {
        const bookingId = item.booking_id || item.id;
        if (!bookingId) {
            setError('Cannot complete consultation: missing booking ID');
            return;
        }

        setProcessing(bookingId);
        try {
            await api.completeConsult(bookingId);
            await fetchQueue();
        } catch (err) {
            console.error('Error completing consultation:', err);
            setError('Failed to complete consultation: ' + (err.message || 'Unknown error'));
        } finally {
            setProcessing(null);
        }
    };

    const handleViewChart = (item) => {
        const patientId = item.patient_id || item.patient?.id;
        if (!patientId) {
            setError('Cannot view chart: missing patient ID');
            return;
        }
        
        if (onSelectPatient) {
            onSelectPatient({
                id: patientId,
                name: item.patient?.name || 'Patient',
                ...item.patient
            }, item.booking_id || item.id);
        }
    };

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px] p-4" style={pageBg}>
                <div className="bg-[#ba1a1a]/[0.06] border border-[#ba1a1a]/25 backdrop-blur-[10px] rounded-lg p-6 text-center max-w-md">
                    <div className="text-[#ba1a1a] text-lg mb-2">⚠️ Error</div>
                    <p className="text-[#424752] mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchQueue();
                        }}
                        className={`px-4 py-2 rounded-lg transition ${btnPrimary}`}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]" style={pageBg}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-[#00478d] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#424752]">Loading queue...</p>
                </div>
            </div>
        );
    }

    const totalWaiting = queue.waiting?.length || 0;
    const totalInProgress = queue.in_progress?.length || 0;

    return (
        <div className="flex-1 p-6" style={pageBg}>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#191c1e]">Queue Management</h1>
                    <div className="flex items-center gap-4">
                        <span className="bg-[#005eb8]/10 text-[#00478d] border border-[#005eb8]/20 px-3 py-1 rounded-full text-sm">
                            Waiting: {totalWaiting}
                        </span>
                        <span className="bg-[#0f7a4d]/10 text-[#0f7a4d] border border-[#0f7a4d]/20 px-3 py-1 rounded-full text-sm">
                            In Progress: {totalInProgress}
                        </span>
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchQueue();
                            }}
                            className={`px-3 py-1.5 text-sm rounded-lg transition ${btnGhost}`}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Waiting List */}
                    <div className={`rounded-xl p-4 ${glassPanel}`}>
                        <h2 className="text-lg font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#a15c00] rounded-full"></span>
                            Waiting ({totalWaiting})
                        </h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {queue.waiting?.length === 0 ? (
                                <p className="text-[#727783] text-center py-8">No patients waiting</p>
                            ) : (
                                queue.waiting.map((item, index) => (
                                    <QueueItem
                                        key={item.booking_id || item.id || index}
                                        item={item}
                                        onCall={handleCall}
                                        onViewChart={handleViewChart}
                                        processing={processing}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className={`rounded-xl p-4 ${glassPanel}`}>
                        <h2 className="text-lg font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#0f7a4d] rounded-full"></span>
                            In Progress ({totalInProgress})
                        </h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {queue.in_progress?.length === 0 ? (
                                <p className="text-[#727783] text-center py-8">No patients in progress</p>
                            ) : (
                                queue.in_progress.map((item, index) => (
                                    <QueueItem
                                        key={item.booking_id || item.id || index}
                                        item={item}
                                        onComplete={handleComplete}
                                        onViewChart={handleViewChart}
                                        processing={processing}
                                        isInProgress
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Queue Item Component
function QueueItem({ item, onCall, onComplete, onViewChart, processing, isInProgress }) {
    const patientName = item.patient?.name || 'Unknown Patient';
    const patientId = item.patient_id || item.patient?.id;
    const bookingId = item.booking_id || item.id;
    const isProcessing = processing === bookingId;
    const time = item.time || 'N/A';

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${glassRow}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0" style={{ background: 'linear-gradient(135deg, #005eb8 0%, #00478d 100%)' }}>
                        {patientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-[#191c1e] truncate">{patientName}</p>
                        <div className="flex items-center gap-2 text-xs text-[#424752]">
                            <span>ID: {patientId || 'N/A'}</span>
                            <span>•</span>
                            <span>{time}</span>
                        </div>
                        {item.service?.name && (
                            <span className="text-xs text-[#727783]">{item.service.name}</span>
                        )}
                        {item.room && (
                            <span className="text-xs text-[#00478d] ml-2">Room: {item.room}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* View Chart Button */}
                <button
                    onClick={() => onViewChart(item)}
                    className="p-2 text-[#00478d] hover:bg-[#005eb8]/10 rounded-lg transition"
                    title="View Patient Chart"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>
                
                {isInProgress ? (
                    <button
                        onClick={() => onComplete(item)}
                        disabled={isProcessing}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-50 ${btnSuccess}`}
                    >
                        {isProcessing ? '...' : 'Complete'}
                    </button>
                ) : (
                    <button
                        onClick={() => onCall(item)}
                        disabled={isProcessing}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-50 ${btnPrimary}`}
                    >
                        {isProcessing ? '...' : 'Call In'}
                    </button>
                )}
            </div>
        </div>
    );
}