// resources/js/components/admin/Reports.jsx

import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

const Reports = () => {
    const toast = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadReport = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await adminApi.getReportsOverview();
                const result = response.data || response;
                setData(result);
                console.log('Report data loaded:', result);
            } catch (err) {
                const message = err.response?.data?.message || err.message || 'Failed to load report';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="mg-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#ef4444] block mb-4">error</span>
                <h3 className="text-lg font-semibold text-[#191c1e] mb-2">Error Loading Report</h3>
                <p className="text-[#424752] mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#00478d] text-white rounded-lg hover:bg-[#00366e] transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="glass-panel rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#424752] block mb-4">assessment</span>
                <h3 className="text-lg font-semibold text-[#191c1e] mb-2">No Data Available</h3>
                <p className="text-[#424752]">No report data found. Please try again later.</p>
            </div>
        );
    }

    const { totals, appointment_status, revenue, top_doctors, top_services, patients_this_month } = data;
    
    // Calculate totals for status percentages
    const statusTotal = Object.values(appointment_status || {}).reduce((a, b) => a + b, 0) || 1;
    const patientsTotal = (patients_this_month?.new || 0) + (patients_this_month?.returning || 0) || 1;

    // Filter doctors with bookings > 0
    const activeDoctors = (top_doctors || []).filter(d => d.bookings_total > 0);
    const activeServices = (top_services || []).filter(s => s.bookings_count > 0);

    return (
        <div>
            {/* Page Header */}
            <div className="mg-page-header">
                <div>
                    <h1 className="mg-page-title">Reports</h1>
                    <p className="mg-page-subtitle">Clinic-wide performance and financial overview.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mg-stat-grid">
                <div className="mg-card">
                    <div className="mg-stat-value">{totals?.doctors || 0}</div>
                    <div className="mg-stat-label">Total Doctors</div>
                </div>
                <div className="mg-card">
                    <div className="mg-stat-value">{totals?.patients || 0}</div>
                    <div className="mg-stat-label">Total Patients</div>
                </div>
                <div className="mg-card">
                    <div className="mg-stat-value">{totals?.appointments || 0}</div>
                    <div className="mg-stat-label">Total Appointments</div>
                </div>
                <div className="mg-card">
                    <div className="mg-stat-value">{totals?.services || 0}</div>
                    <div className="mg-stat-label">Total Services</div>
                </div>
            </div>

            {/* Revenue & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--mg-space-md)', marginBottom: 'var(--mg-space-md)' }}>
                {/* Revenue Card */}
                <div className="mg-card">
                    <div className="mg-flex mg-justify-between mg-items-center">
                        <div style={{ fontWeight: 700, fontSize: 18 }}>Monthly Revenue</div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="mg-muted mg-text-sm">Total Revenue</div>
                            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--mg-primary)' }}>
                                ${(revenue?.total || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className="mg-mt-md">
                        <RevenueBarChart data={revenue?.monthly || []} />
                    </div>
                    <div className="mg-mt-sm mg-text-sm mg-muted">
                        Outstanding: <strong style={{ color: 'var(--mg-error)' }}>${(revenue?.outstanding || 0).toFixed(2)}</strong>
                    </div>
                </div>

                {/* Appointment Status */}
                <div className="mg-card">
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Appointment Status</div>
                    {appointment_status && Object.entries(appointment_status).map(([status, count]) => (
                        <div key={status} style={{ marginBottom: 12 }}>
                            <div className="mg-flex mg-justify-between mg-text-sm" style={{ marginBottom: 4 }}>
                                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{status}</span>
                                <span className="mg-muted">{count} ({Math.round((count / statusTotal) * 100)}%)</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: 'var(--mg-surface-container-high)', overflow: 'hidden' }}>
                                <div 
                                    style={{ 
                                        width: `${(count / statusTotal) * 100}%`, 
                                        height: '100%', 
                                        background: status === 'pending' ? '#f59e0b' : 
                                                   status === 'confirmed' ? 'var(--mg-primary)' : 
                                                   status === 'completed' ? '#1a8a5e' : 
                                                   status === 'cancelled' ? 'var(--mg-error)' : 'var(--mg-primary)'
                                    }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Doctors & Services */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--mg-space-md)', marginBottom: 'var(--mg-space-md)' }}>
                {/* Top Doctors */}
                <div className="mg-card">
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Most Booked Doctors</div>
                    {activeDoctors.length > 0 && (
                        <div className="mg-muted mg-text-sm mg-mt-sm" style={{ marginBottom: 12 }}>
                            Top: <strong style={{ color: 'var(--mg-on-surface)' }}>{activeDoctors[0]?.name}</strong> with {activeDoctors[0]?.bookings_total} bookings
                        </div>
                    )}
                    {activeDoctors.length > 0 ? (
                        <div>
                            {activeDoctors.map((doctor, i) => (
                                <div
                                    key={doctor.id}
                                    className="mg-flex mg-justify-between mg-items-center"
                                    style={{ padding: '10px 0', borderBottom: i < activeDoctors.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                                >
                                    <div className="mg-flex mg-items-center mg-gap-xs">
                                        <span
                                            style={{
                                                width: 22, height: 22, borderRadius: '50%', background: 'var(--mg-secondary-container)',
                                                color: 'var(--mg-primary)', fontSize: 11, fontWeight: 700, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}
                                        >
                                            {i + 1}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{doctor.name}</div>
                                            <div className="mg-muted mg-text-sm">{doctor.specialization}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{doctor.bookings_total}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mg-muted mg-text-sm">No doctor data yet.</div>
                    )}
                </div>

                {/* Top Services */}
                <div className="mg-card">
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Most Booked Services</div>
                    {activeServices.length > 0 && (
                        <div className="mg-muted mg-text-sm mg-mt-sm" style={{ marginBottom: 12 }}>
                            Top: <strong style={{ color: 'var(--mg-on-surface)' }}>{activeServices[0]?.name}</strong> with {activeServices[0]?.bookings_count} bookings
                        </div>
                    )}
                    {activeServices.length > 0 ? (
                        <div>
                            {activeServices.map((service, i) => (
                                <div
                                    key={service.id}
                                    className="mg-flex mg-justify-between mg-items-center"
                                    style={{ padding: '10px 0', borderBottom: i < activeServices.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                                >
                                    <div className="mg-flex mg-items-center mg-gap-xs">
                                        <span
                                            style={{
                                                width: 22, height: 22, borderRadius: '50%', background: 'var(--mg-secondary-container)',
                                                color: 'var(--mg-primary)', fontSize: 11, fontWeight: 700, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}
                                        >
                                            {i + 1}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{service.name}</div>
                                            <div className="mg-muted mg-text-sm">{service.doctor_name || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{service.bookings_count}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mg-muted mg-text-sm">No service data yet.</div>
                    )}
                </div>
            </div>

            {/* New vs Returning Patients */}
            <div className="mg-card">
                <div className="mg-flex mg-justify-between mg-items-center" style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>Patients This Month</div>
                    <div className="mg-muted mg-text-sm">
                        {patients_this_month?.range?.from} – {patients_this_month?.range?.to}
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--mg-space-md)' }}>
                    <div className="mg-card-flat" style={{ textAlign: 'center' }}>
                        <div className="mg-stat-value" style={{ color: '#1a8a5e' }}>{patients_this_month?.new || 0}</div>
                        <div className="mg-stat-label">New Patients</div>
                    </div>
                    <div className="mg-card-flat" style={{ textAlign: 'center' }}>
                        <div className="mg-stat-value">{patients_this_month?.returning || 0}</div>
                        <div className="mg-stat-label">Returning Patients</div>
                    </div>
                </div>
                <div className="mg-mt-md">
                    <div className="mg-flex" style={{ height: 10, borderRadius: 5, overflow: 'hidden', background: 'var(--mg-surface-container-high)' }}>
                        <div 
                            style={{ 
                                width: `${((patients_this_month?.new || 0) / patientsTotal) * 100}%`, 
                                background: '#1a8a5e' 
                            }} 
                        />
                        <div 
                            style={{ 
                                width: `${((patients_this_month?.returning || 0) / patientsTotal) * 100}%`, 
                                background: 'var(--mg-primary)' 
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== Revenue Bar Chart Component =====

const RevenueBarChart = ({ data }) => {
    if (!data || data.length === 0 || data.every(d => d.amount === 0)) {
        return <div className="mg-muted mg-text-sm">No revenue data available yet.</div>;
    }

    const max = Math.max(...data.map((d) => d.amount), 1);
    const width = 560;
    const height = 160;
    const barGap = 16;
    const barWidth = (width - barGap * (data.length - 1)) / data.length;

    return (
        <svg viewBox={`0 0 ${width} ${height + 24}`} style={{ width: '100%', height: 'auto' }}>
            {data.map((d, i) => {
                const barHeight = Math.max((d.amount / max) * height, 2);
                const x = i * (barWidth + barGap);
                const y = height - barHeight;
                return (
                    <g key={d.label}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={6}
                            fill="var(--mg-primary-container)"
                            opacity="0.85"
                        />
                        <text
                            x={x + barWidth / 2}
                            y={height + 16}
                            textAnchor="middle"
                            fontSize="11"
                            fill="var(--mg-on-surface-variant)"
                        >
                            {d.label.split(' ')[0]}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default Reports;