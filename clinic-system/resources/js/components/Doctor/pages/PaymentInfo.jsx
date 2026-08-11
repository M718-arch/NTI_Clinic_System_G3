import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

export const PaymentInfo = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        paidInvoices: 0,
        pendingPayments: 0,
        overdueCount: 0
    });

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/doctor/invoices');
            setInvoices(response.data || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/doctor/payment-stats');
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            paid: 'status-paid',
            pending: 'status-pending',
            overdue: 'status-overdue'
        };
        const iconMap = {
            paid: 'check',
            pending: 'hourglass_empty',
            overdue: 'error'
        };
        const style = statusMap[status?.toLowerCase()] || 'status-pending';
        const icon = iconMap[status?.toLowerCase()] || 'hourglass_empty';

        return (
            <span className={`${style} text-xs px-2.5 py-1 rounded-full flex items-center gap-1 w-max font-bold`}>
                <span className="material-symbols-outlined text-[12px]">{icon}</span>
                {status || 'Pending'}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const filteredInvoices = invoices.filter(invoice => {
        const searchLower = searchTerm.toLowerCase();
        return (
            invoice.patient?.name?.toLowerCase().includes(searchLower) ||
            invoice.service?.toLowerCase().includes(searchLower)
        );
    });

    const displayInvoices = filteredInvoices;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#f5f6ff]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-[#006382] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#525b72]">Loading payment information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f5f6ff] text-[#252f43] font-body">
            {/* Ambient Background Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#006382]/30 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6f4b94]/30 rounded-full blur-[180px]"></div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto relative z-10">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#252f43] glow-text mb-1">Payment Information</h1>
                        <p className="text-[#525b72] text-body-md">Manage your invoices and track financial history.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525b72]">search</span>
                            <input
                                className="glass-input w-full py-2 pl-10 pr-4 rounded-full text-[#252f43] placeholder:text-[#525b72]/70 focus:ring-0"
                                placeholder="Search payments..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-[#006382]/20 hover:bg-[#006382]/30 border border-[#006382]/30 text-[#006382] px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,99,130,0.15)] hover:shadow-[0_0_30px_rgba(0,99,130,0.25)] whitespace-nowrap">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Download Statement
                        </button>
                    </div>
                </div>

                {/* Bento Grid Stats - Bigger background icons with inline styles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group animate-fade-in-up cursor-pointer hover:shadow-[0_8px_40px_rgba(0,99,130,0.15)] transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#006382]/25 rounded-full blur-2xl group-hover:bg-[#006382]/40 group-hover:scale-125 group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#006382]/10 rounded-full blur-xl group-hover:bg-[#006382]/20 transition-all duration-500"></div>
                        {/* Bigger wallet icon with inline style */}
                        <div className="absolute right-2 top-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                            <span className="material-symbols-outlined" style={{ fontSize: '80px', color: '#006382' }}>account_balance_wallet</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="h-10 w-10 rounded-full bg-[#006382]/10 flex items-center justify-center text-[#006382] border border-[#006382]/20 group-hover:border-[#006382]/40 group-hover:bg-[#006382]/20 transition-all duration-300">
                                <span className="material-symbols-outlined text-xl">payments</span>
                            </div>
                            <h3 className="text-sm font-label text-[#525b72] uppercase tracking-wider font-semibold">Total Revenue</h3>
                        </div>
                        <div className="text-3xl font-headline font-bold text-[#252f43] glow-text relative z-10 mb-2">
                            ${stats.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group animate-fade-in-up cursor-pointer hover:shadow-[0_8px_40px_rgba(74,222,128,0.15)] transition-all duration-300" style={{ animationDelay: '0.25s' }}>
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#4ade80]/25 rounded-full blur-2xl group-hover:bg-[#4ade80]/40 group-hover:scale-125 group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#4ade80]/10 rounded-full blur-xl group-hover:bg-[#4ade80]/20 transition-all duration-500"></div>
                        {/* Bigger checkmark icon with inline style */}
                        <div className="absolute right-2 top-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                            <span className="material-symbols-outlined" style={{ fontSize: '80px', color: '#4ade80' }}>check_circle</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="h-10 w-10 rounded-full bg-[#4ade80]/10 flex items-center justify-center text-[#166534] border border-[#4ade80]/20 group-hover:border-[#4ade80]/40 group-hover:bg-[#4ade80]/20 transition-all duration-300">
                                <span className="material-symbols-outlined text-xl">receipt_long</span>
                            </div>
                            <h3 className="text-sm font-label text-[#525b72] uppercase tracking-wider font-semibold">Paid Invoices</h3>
                        </div>
                        <div className="text-3xl font-headline font-bold text-[#252f43] relative z-10 mb-2">
                            {stats.paidInvoices?.toLocaleString() || '0'}
                        </div>
                        <div className="text-[#525b72] text-sm font-medium relative z-10">
                            This quarter
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group animate-fade-in-up cursor-pointer hover:shadow-[0_8px_40px_rgba(250,204,21,0.15)] transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#facc15]/25 rounded-full blur-2xl group-hover:bg-[#facc15]/40 group-hover:scale-125 group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#facc15]/10 rounded-full blur-xl group-hover:bg-[#facc15]/20 transition-all duration-500"></div>
                        {/* Bigger clock icon with inline style */}
                        <div className="absolute right-2 top-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                            <span className="material-symbols-outlined" style={{ fontSize: '80px', color: '#facc15' }}>schedule</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="h-10 w-10 rounded-full bg-[#facc15]/10 flex items-center justify-center text-[#854d0e] border border-[#facc15]/20 group-hover:border-[#facc15]/40 group-hover:bg-[#facc15]/20 transition-all duration-300">
                                <span className="material-symbols-outlined text-xl">pending_actions</span>
                            </div>
                            <h3 className="text-sm font-label text-[#525b72] uppercase tracking-wider font-semibold">Pending Payments</h3>
                        </div>
                        <div className="text-3xl font-headline font-bold text-[#252f43] relative z-10 mb-2">
                            ${stats.pendingPayments?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </div>
                        <div className="text-[#991b1b] text-sm flex items-center gap-1 relative z-10 font-medium">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            <span>{stats.overdueCount || 0} invoice{stats.overdueCount === 1 ? '' : 's'} overdue</span>
                        </div>
                    </div>
                </div>

                {/* Invoices Table - Glassmorphism Elevated */}
                <div className="glass-elevated rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-white/20 flex justify-between items-center bg-white/10">
                        <h2 className="text-lg font-headline font-semibold text-[#252f43]">Recent Invoices</h2>
                        <button className="text-[#006382] text-sm hover:underline font-medium">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/20 bg-white/5">
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Patient</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Treatment</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Date</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold">Status</th>
                                    <th className="px-6 py-4 font-label text-sm text-[#525b72] font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {displayInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[#525b72]">
                                            {searchTerm ? 'No invoices match your search.' : 'No invoices yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    displayInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-white/30 transition-colors group">
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full overflow-hidden border border-white/40 shadow-sm bg-white/50 flex items-center justify-center text-[#252f43] font-bold group-hover:border-[#006382]/40 transition-all duration-300">
                                                    {invoice.patient?.name?.charAt(0) || 'P'}
                                                </div>
                                                <span className="text-[#252f43] font-semibold group-hover:text-[#006382] transition-colors duration-300">{invoice.patient?.name || 'Unknown'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#525b72] font-medium">{invoice.service || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-[#525b72] font-medium">{formatDate(invoice.date)}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-[#252f43]">${invoice.amount?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-[#525b72] hover:text-[#006382] transition-colors rounded-full hover:bg-white/50">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <style>{`
                /* Glacier Glassmorphism Utility Classes */
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

                /* Status badge colors */
                .status-paid {
                    background-color: rgba(74, 222, 128, 0.15);
                    color: #166534;
                    border: 1px solid rgba(74, 222, 128, 0.3);
                }
                
                .status-pending {
                    background-color: rgba(250, 204, 21, 0.15);
                    color: #854d0e;
                    border: 1px solid rgba(250, 204, 21, 0.3);
                }

                .status-overdue {
                    background-color: rgba(255, 107, 107, 0.15);
                    color: #991b1b;
                    border: 1px solid rgba(255, 107, 107, 0.3);
                }

                /* Animations */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
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

export default PaymentInfo;