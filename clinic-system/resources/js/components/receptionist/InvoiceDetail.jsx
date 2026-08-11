// resources/js/components/receptionist/InvoiceDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import receptionistApi from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = receptionistApi;
    const toast = useToast();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actioning, setActioning] = useState(false);

    useEffect(() => {
        // Check if ID is valid
        if (!id || id === 'undefined' || id === 'null') {
            setError('Invalid invoice ID');
            setLoading(false);
            toast.error('Invalid invoice ID');
            navigate('/receptionist/invoices');
            return;
        }
        loadInvoice();
    }, [id]);

    const loadInvoice = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getInvoice(id);
            const data = response.data || response;
            
            // Check if data is valid
            if (!data || !data.id) {
                throw new Error('Invoice not found');
            }
            
            setInvoice(data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load invoice';
            setError(message);
            toast.error(message);
            
            // Navigate back if invoice not found
            if (err.response?.status === 404) {
                setTimeout(() => navigate('/receptionist/invoices'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async () => {
        if (!invoice) return;
        if (!window.confirm(`Mark invoice ${invoice.invoice_number} as paid?`)) return;
        
        setActioning(true);
        try {
            await api.markInvoicePaid(id, 'cash');
            toast.success(`Invoice ${invoice.invoice_number} marked as paid`);
            loadInvoice(); // Reload to get fresh data
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to mark invoice as paid';
            toast.error(message);
        } finally {
            setActioning(false);
        }
    };

    const handleMarkPending = async () => {
        if (!invoice) return;
        if (!window.confirm(`Mark invoice ${invoice.invoice_number} as pending?`)) return;
        
        setActioning(true);
        try {
            await api.markInvoicePending(id);
            toast.success(`Invoice ${invoice.invoice_number} marked as pending`);
            loadInvoice(); // Reload to get fresh data
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to mark invoice as pending';
            toast.error(message);
        } finally {
            setActioning(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const statusColors = {
        paid: 'text-[#10b981] bg-[#10b981]/10',
        pending: 'text-[#f59e0b] bg-[#f59e0b]/10',
        cancelled: 'text-[#ef4444] bg-[#ef4444]/10',
    };

    const statusIcons = {
        paid: 'check_circle',
        pending: 'pending',
        cancelled: 'cancel',
    };

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
                <h3 className="text-lg font-semibold text-[#191c1e] mb-2">Error Loading Invoice</h3>
                <p className="text-[#424752] mb-4">{error}</p>
                <button
                    onClick={() => navigate('/receptionist/invoices')}
                    className="px-4 py-2 bg-[#00478d] text-white rounded-lg hover:bg-[#00366e] transition"
                >
                    Back to Invoices
                </button>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="glass-panel rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#424752] block mb-4">receipt_long</span>
                <h3 className="text-lg font-semibold text-[#191c1e] mb-2">Invoice Not Found</h3>
                <p className="text-[#424752] mb-4">The invoice you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate('/receptionist/invoices')}
                    className="px-4 py-2 bg-[#00478d] text-white rounded-lg hover:bg-[#00366e] transition"
                >
                    Back to Invoices
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#191c1e] font-['Plus_Jakarta_Sans']">
                        Invoice Details
                    </h2>
                    <p className="text-[#424752] mt-1">
                        Invoice #{invoice.invoice_number}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/receptionist/invoices')}
                        className="px-4 py-2 rounded-lg border border-black/10 text-[#424752] hover:bg-black/5 transition flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-lg border border-[#00478d] text-[#00478d] hover:bg-[#00478d]/5 transition flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Print
                    </button>
                </div>
            </div>

            {/* Invoice Card */}
            <div className="glass-panel rounded-xl p-6 print:shadow-none print:border-none">
                {/* Status Banner */}
                <div className={`rounded-lg p-4 mb-6 flex items-center justify-between ${statusColors[invoice.status] || 'bg-[#e0e3e5]'}`}>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">
                            {statusIcons[invoice.status] || 'receipt'}
                        </span>
                        <span className="font-semibold capitalize">{invoice.status}</span>
                    </div>
                    {invoice.paid_at && (
                        <span className="text-sm">
                            Paid on {invoice.paid_at}
                        </span>
                    )}
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-sm font-medium text-[#424752] mb-2">Invoice Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[#424752]">Invoice Number</span>
                                <span className="font-mono font-medium">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#424752]">Date</span>
                                <span>{invoice.date || invoice.created_at}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#424752]">Status</span>
                                <span className={`font-medium capitalize ${
                                    invoice.status === 'paid' ? 'text-[#10b981]' :
                                    invoice.status === 'pending' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                                }`}>
                                    {invoice.status}
                                </span>
                            </div>
                            {invoice.payment_method && (
                                <div className="flex justify-between">
                                    <span className="text-[#424752]">Payment Method</span>
                                    <span className="capitalize">{invoice.payment_method}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-[#424752] mb-2">Patient Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[#424752]">Patient</span>
                                <span className="font-medium">{invoice.patient_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#424752]">Service</span>
                                <span>{invoice.service_name}</span>
                            </div>
                            {invoice.doctor_name && (
                                <div className="flex justify-between">
                                    <span className="text-[#424752]">Doctor</span>
                                    <span>Dr. {invoice.doctor_name}</span>
                                </div>
                            )}
                            {invoice.description && (
                                <div className="flex justify-between">
                                    <span className="text-[#424752]">Notes</span>
                                    <span className="text-sm max-w-[200px] truncate">{invoice.description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="border-t border-black/5 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-[#191c1e]">Total Amount</span>
                        <span className="text-2xl font-bold text-[#00478d]">{invoice.amount}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-black/5 pt-4 mt-4 flex flex-wrap gap-2">
                    {invoice.status === 'pending' && (
                        <button
                            onClick={handleMarkPaid}
                            disabled={actioning}
                            className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {actioning ? (
                                <span className="animate-spin">⟳</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            )}
                            Mark as Paid
                        </button>
                    )}
                    
                    {invoice.status === 'paid' && (
                        <button
                            onClick={handleMarkPending}
                            disabled={actioning}
                            className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {actioning ? (
                                <span className="animate-spin">⟳</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">pending</span>
                            )}
                            Mark as Pending
                        </button>
                    )}
                    
                    <button
                        onClick={() => navigate(`/receptionist/invoices`)}
                        className="px-4 py-2 border border-black/10 text-[#424752] rounded-lg hover:bg-black/5 transition flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">list</span>
                        All Invoices
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        .glass-panel {
                            box-shadow: none !important;
                            border: 1px solid #ddd !important;
                            background: white !important;
                            backdrop-filter: none !important;
                        }
                        button, .mg-btn {
                            display: none !important;
                        }
                        .print\\:shadow-none {
                            box-shadow: none !important;
                        }
                        .print\\:border-none {
                            border: none !important;
                        }
                    }
                `
            }} />
        </div>
    );
}

export default InvoiceDetail;