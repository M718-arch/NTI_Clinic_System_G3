import React, { useEffect, useState, useCallback } from 'react';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

/**
 * Billing (admin view)
 *
 * Per the roadmap, admin's billing role is "View Revenue, Financial
 * Reports, Outstanding Payments, Paid Invoices" — no create/edit here.
 * That's the receptionist's job (Phase 6). This page is read-only.
 */
export default function Billing({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();

  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, i] = await Promise.all([
        api.getBillingSummary(),
        api.getInvoices(statusFilter ? { status: statusFilter } : {}),
      ]);
      setSummary(s);
      setInvoices(i);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const invoiceList = invoices?.data || invoices || [];

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Billing</h1>
          <p className="mg-page-subtitle">Revenue, outstanding payments, and invoice history.</p>
        </div>
      </div>

      {summary && (
        <div className="mg-stat-grid">
          <StatCard label="Total Revenue" value={`$${summary.total_revenue.toLocaleString()}`} />
          <StatCard label="Outstanding" value={`$${summary.outstanding_amount.toLocaleString()}`} color="var(--mg-error)" />
          <StatCard label="Paid Invoices" value={summary.paid_count} />
          <StatCard label="Outstanding Invoices" value={summary.outstanding_count} />
        </div>
      )}

      <div className="mg-card-flat mg-flex mg-items-center mg-gap-sm" style={{ marginBottom: 'var(--mg-space-md)' }}>
        <select className="mg-select" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mg-card-flat">
        {loading ? (
          <div className="mg-spinner" />
        ) : invoiceList.length === 0 ? (
          <div className="mg-empty-state">No invoices found.</div>
        ) : (
          <table className="mg-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoiceList.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                  <td>{inv.patient?.user?.name || '—'}</td>
                  <td>{inv.doctor?.full_name || inv.doctor?.user?.name || '—'}</td>
                  <td style={{ fontWeight: 700 }}>${Number(inv.amount).toFixed(2)}</td>
                  <td><InvoiceBadge status={inv.status} /></td>
                  <td className="mg-muted mg-text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="mg-card">
      <div className="mg-stat-value" style={color ? { color } : undefined}>{value}</div>
      <div className="mg-stat-label">{label}</div>
    </div>
  );
}

function InvoiceBadge({ status }) {
  const map = {
    pending: 'mg-badge-pending',
    paid: 'mg-badge-completed',
    cancelled: 'mg-badge-cancelled',
  };
  return <span className={`mg-badge ${map[status] || 'mg-badge-pending'}`}>{status}</span>;
}
