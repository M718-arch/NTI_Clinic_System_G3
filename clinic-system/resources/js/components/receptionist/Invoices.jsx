// resources/js/components/receptionist/Invoices.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

function Invoices() {
    const api = receptionistApi;
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(searchParams.get('status') || 'all');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [actioningId, setActioningId] = useState(null);

    useEffect(() => {
        loadInvoices();
    }, [filter]);

    const loadInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.listInvoices(filter === 'all' ? null : filter);
            const data = response.data || response || [];
            setInvoices(data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load invoices';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (invoice) => {
        if (!window.confirm(`Mark invoice ${invoice.invoice_number} as paid?`)) return;
        
        setActioningId(invoice.id);
        try {
            await api.markInvoicePaid(invoice.id, 'cash');
            toast.success(`Invoice ${invoice.invoice_number} marked as paid`);
            loadInvoices();
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to mark invoice as paid';
            toast.error(message);
        } finally {
            setActioningId(null);
        }
    };

    const handleMarkPending = async (invoice) => {
        if (!window.confirm(`Mark invoice ${invoice.invoice_number} as pending?`)) return;
        
        setActioningId(invoice.id);
        try {
            await api.markInvoicePending(invoice.id);
            toast.success(`Invoice ${invoice.invoice_number} marked as pending`);
            loadInvoices();
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to mark invoice as pending';
            toast.error(message);
        } finally {
            setActioningId(null);
        }
    };

    const handleViewInvoice = (id) => {
        navigate(`/receptionist/invoices/${id}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadInvoices();
    };

    const filteredInvoices = invoices.filter(inv => {
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            return (
                (inv.patient_name || '').toLowerCase().includes(term) ||
                (inv.invoice_number || '').toLowerCase().includes(term) ||
                (inv.service_name || '').toLowerCase().includes(term)
            );
        }
        return true;
    });

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'pending').length,
        cancelled: invoices.filter(i => i.status === 'cancelled').length,
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                        Invoices
                    </h2>
                    <p className="text-[#424752] mt-1">
                        Manage patient invoices and payments
                    </p>
                </div>
                <button
                    className="bg-[#00478d] text-white px-6 py-2.5 rounded-full hover:bg-[#00366e] transition flex items-center gap-2 shadow-sm"
                    onClick={() => navigate('/receptionist/invoices/create')}
                >
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    Create Invoice
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-panel rounded-xl p-4 text-center bg-[#00478d]/10 text-[#00478d]">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs font-medium uppercase tracking-wider">Total</div>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center bg-[#10b981]/10 text-[#10b981]">
                    <div className="text-2xl font-bold">{stats.paid}</div>
                    <div className="text-xs font-medium uppercase tracking-wider">Paid</div>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center bg-[#f59e0b]/10 text-[#f59e0b]">
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <div className="text-xs font-medium uppercase tracking-wider">Pending</div>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center bg-[#ef4444]/10 text-[#ef4444]">
                    <div className="text-2xl font-bold">{stats.cancelled}</div>
                    <div className="text-xs font-medium uppercase tracking-wider">Cancelled</div>
                </div>
            </div>

            <div className="glass-panel rounded-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                                filter === 'all' ? 'bg-[#00478d] text-white' : 'bg-[#e0e3e5] text-[#424752] hover:bg-[#d0d3d5]'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                                filter === 'paid' ? 'bg-[#10b981] text-white' : 'bg-[#d1fae5] text-[#059669] hover:bg-[#a7f3d0]'
                            }`}
                        >
                            Paid
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                                filter === 'pending' ? 'bg-[#f59e0b] text-white' : 'bg-[#fef3c7] text-[#d97706] hover:bg-[#fde68a]'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                                filter === 'cancelled' ? 'bg-[#ef4444] text-white' : 'bg-[#fee2e2] text-[#dc2626] hover:bg-[#fca5a5]'
                            }`}
                        >
                            Cancelled
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 glass-input rounded-lg px-4 py-2 text-sm"
                            placeholder="Search by patient or invoice #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="px-4 py-2 bg-[#00478d] text-white rounded-lg hover:bg-[#00366e] transition">
                            <span className="material-symbols-outlined text-[18px]">search</span>
                        </button>
                    </form>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
                </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="mg-spinner" />
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-4xl text-[#424752]/30 block mb-2">receipt_long</span>
                        <p className="text-[#424752]">
                            {invoices.length === 0 ? 'No invoices found.' : 'No invoices match the current filters.'}
                        </p>
                        {invoices.length > 0 && filter !== 'all' && (
                            <button className="mt-2 text-sm text-[#00478d] hover:underline" onClick={() => setFilter('all')}>
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-black/5 bg-[#f2f4f6]/50">
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Invoice #</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Patient</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 hidden md:table-cell">Service</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Amount</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 hidden lg:table-cell">Date</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4">Status</th>
                                    <th className="text-xs text-[#424752] uppercase tracking-wider py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-black/5 hover:bg-[#e0e3e5]/30 transition-colors cursor-pointer">
                                        <td className="py-3 px-4 font-mono text-sm font-medium text-[#00478d]">{invoice.invoice_number}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-[#191c1e]">{invoice.patient_name}</div>
                                        </td>
                                        <td className="py-3 px-4 text-[#424752] text-sm hidden md:table-cell">{invoice.service_name}</td>
                                        <td className="py-3 px-4 font-semibold text-[#191c1e]">{invoice.amount}</td>
                                        <td className="py-3 px-4 text-[#424752] text-sm hidden lg:table-cell">{invoice.date}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                                invoice.status === 'paid' ? 'bg-[#10b981]/20 text-[#059669]' :
                                                invoice.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#d97706]' :
                                                'bg-[#ef4444]/20 text-[#dc2626]'
                                            }`}>
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {invoice.status === 'paid' ? 'check_circle' : 
                                                     invoice.status === 'pending' ? 'pending' : 'cancel'}
                                                </span>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice.id)}
                                                    className="p-1.5 rounded-lg hover:bg-[#00478d]/10 transition text-[#00478d]"
                                                    title="View Invoice"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>
                                                {invoice.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(invoice)}
                                                        disabled={actioningId === invoice.id}
                                                        className="p-1.5 rounded-lg hover:bg-green-100 transition text-[#10b981] disabled:opacity-50"
                                                        title="Mark as Paid"
                                                    >
                                                        {actioningId === invoice.id ? (
                                                            <span className="animate-spin">⟳</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        )}
                                                    </button>
                                                )}
                                                {invoice.status === 'paid' && (
                                                    <button
                                                        onClick={() => handleMarkPending(invoice)}
                                                        disabled={actioningId === invoice.id}
                                                        className="p-1.5 rounded-lg hover:bg-yellow-100 transition text-[#f59e0b] disabled:opacity-50"
                                                        title="Mark as Pending"
                                                    >
                                                        {actioningId === invoice.id ? (
                                                            <span className="animate-spin">⟳</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-[18px]">pending</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {invoices.length > 0 && (
                <div className="mt-4 flex justify-between items-center text-sm text-[#424752]">
                    <div>
                        Showing <span className="font-medium">{filteredInvoices.length}</span> of{' '}
                        <span className="font-medium">{invoices.length}</span> invoices
                    </div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981]" />
                            {stats.paid} paid
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b]" />
                            {stats.pending} pending
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#ef4444]" />
                            {stats.cancelled} cancelled
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Invoices;