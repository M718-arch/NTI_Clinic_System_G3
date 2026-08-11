import React, { useEffect, useState, useCallback } from 'react';
import { createReceptionistApi } from '../../api/receptionistApi';
import { useToast } from '../shared/ToastProvider';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
];

const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance', 'Bank Transfer'];

/**
 * Billing
 *
 * Phase 6. Not one of the original six mockups — added once the backend
 * existed, following the same visual language (glass cards, badge
 * styles, table pattern) as the rest of the receptionist portal.
 *
 * Invoice creation here is patient + free-text amount, not tied to a
 * specific booking — there's no "list this patient's bookings" endpoint
 * for a receptionist yet, so booking linkage is left for a follow-up
 * rather than half-built into this form.
 */
export default function Billing({ token }) {
  const api = createReceptionistApi(token);
  const toast = useToast();

  const [tab, setTab] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listInvoices(tab || undefined);
      setInvoices(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function confirmMarkPaid() {
    if (!payingInvoice) return;
    setActioningId(payingInvoice.id);
    try {
      await api.markInvoicePaid(payingInvoice.id, paymentMethod);
      toast.success(`${payingInvoice.invoice_number} marked as paid`);
      setPayingInvoice(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleMarkPending(invoice) {
    setActioningId(invoice.id);
    try {
      await api.markInvoicePending(invoice.id);
      toast.success(`${invoice.invoice_number} reopened as pending`);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActioningId(null);
    }
  }

  async function openReceipt(invoice) {
    try {
      const data = await api.getReceipt(invoice.id);
      setReceipt(data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  const outstandingTotal = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Billing</h1>
          <p className="mg-page-subtitle">Create invoices and record payments.</p>
        </div>
        <button type="button" className="mg-btn mg-btn-primary" onClick={() => setShowCreate(true)}>
          + New Invoice
        </button>
      </div>

      <div className="mg-flex mg-gap-md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 'var(--mg-space-md)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 4px',
              marginBottom: -1,
              borderBottom: tab === t.key ? '2px solid var(--mg-primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--mg-primary)' : 'var(--mg-on-surface-variant)',
              fontWeight: tab === t.key ? 700 : 500,
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            {t.label}
          </button>
        ))}
        {tab === 'pending' && invoices.length > 0 && (
          <span className="mg-muted mg-text-sm" style={{ marginLeft: 'auto', paddingTop: 10 }}>
            Total outstanding: <strong>${outstandingTotal.toFixed(2)}</strong>
          </span>
        )}
      </div>

      <div className="mg-card-flat">
        {loading ? (
          <div className="mg-spinner" />
        ) : invoices.length === 0 ? (
          <div className="mg-empty-state">No invoices found.</div>
        ) : (
          <table className="mg-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                  <td>{inv.patient?.user?.name || '—'}</td>
                  <td>{inv.service_name || '—'}</td>
                  <td style={{ fontWeight: 700 }}>${Number(inv.amount).toFixed(2)}</td>
                  <td><InvoiceBadge status={inv.status} /></td>
                  <td className="mg-muted mg-text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="mg-flex mg-gap-xs">
                      <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => openReceipt(inv)}>
                        Receipt
                      </button>
                      {inv.status === 'pending' ? (
                        <button
                          type="button"
                          className="mg-btn mg-btn-success mg-btn-sm"
                          disabled={actioningId === inv.id}
                          onClick={() => { setPayingInvoice(inv); setPaymentMethod(PAYMENT_METHODS[0]); }}
                        >
                          Mark Paid
                        </button>
                      ) : inv.status === 'paid' ? (
                        <button
                          type="button"
                          className="mg-btn mg-btn-outline mg-btn-sm"
                          disabled={actioningId === inv.id}
                          onClick={() => handleMarkPending(inv)}
                        >
                          Reopen
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateInvoiceModal
          api={api}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); toast.success('Invoice created'); }}
          onError={(msg) => toast.error(msg)}
        />
      )}

      {payingInvoice && (
        <Modal onClose={() => setPayingInvoice(null)}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            Mark {payingInvoice.invoice_number} as paid
          </div>
          <p className="mg-muted mg-text-sm">${Number(payingInvoice.amount).toFixed(2)} — {payingInvoice.patient?.user?.name}</p>
          <div className="mg-field mg-mt-sm">
            <label className="mg-label">Payment Method</label>
            <select className="mg-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="mg-flex mg-gap-xs mg-mt-md" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="mg-btn mg-btn-outline" onClick={() => setPayingInvoice(null)}>Cancel</button>
            <button type="button" className="mg-btn mg-btn-success" disabled={actioningId === payingInvoice.id} onClick={confirmMarkPaid}>
              {actioningId === payingInvoice.id ? 'Saving…' : 'Confirm Payment'}
            </button>
          </div>
        </Modal>
      )}

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function CreateInvoiceModal({ api, onClose, onCreated, onError }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [patient, setPatient] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      setResults(await api.searchPatients(query.trim()));
    } catch (err) {
      onError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patient || !amount) return;
    setSubmitting(true);
    try {
      await api.createInvoice({
        patient_id: patient.id,
        service_name: serviceName || undefined,
        amount: parseFloat(amount),
        notes: notes || undefined,
      });
      onCreated();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} width={480}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>New Invoice</div>
      <form onSubmit={handleSubmit}>
        {patient ? (
          <div className="mg-flex mg-justify-between mg-items-center mg-card-flat">
            <div>
              <div style={{ fontWeight: 700 }}>{patient.user?.name}</div>
              <div className="mg-muted mg-text-sm">{patient.user?.email}</div>
            </div>
            <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => setPatient(null)}>Change</button>
          </div>
        ) : (
          <>
            <div className="mg-field">
              <label className="mg-label">Patient</label>
              <div className="mg-flex mg-gap-xs">
                <input className="mg-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, phone..." />
                <button type="button" className="mg-btn mg-btn-secondary" onClick={handleSearch} disabled={searching}>
                  {searching ? '…' : 'Search'}
                </button>
              </div>
            </div>
            {results.length > 0 && (
              <div className="mg-card-flat mg-mt-sm" style={{ maxHeight: 180, overflowY: 'auto' }}>
                {results.map((p) => (
                  <div
                    key={p.id}
                    style={{ padding: '8px 4px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                    onClick={() => { setPatient(p); setResults([]); }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.user?.name}</div>
                    <div className="mg-muted mg-text-sm">{p.user?.email}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mg-form-grid-2 mg-mt-sm">
          <div className="mg-field">
            <label className="mg-label">Service / Description</label>
            <input className="mg-input" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g. Consultation" />
          </div>
          <div className="mg-field">
            <label className="mg-label">Amount ($)</label>
            <input type="number" min="0" step="0.01" className="mg-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        </div>

        <div className="mg-field mg-mt-sm">
          <label className="mg-label">Notes (optional)</label>
          <textarea className="mg-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="mg-flex mg-gap-xs mg-mt-md" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="mg-btn mg-btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="mg-btn mg-btn-primary" disabled={!patient || !amount || submitting}>
            {submitting ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReceiptModal({ receipt, onClose }) {
  return (
    <Modal onClose={onClose} width={420}>
      <div id="mg-receipt-print">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Receipt</div>
          <div className="mg-muted mg-text-sm">{receipt.invoice_number}</div>
        </div>
        <ReceiptRow label="Date" value={receipt.date} />
        <ReceiptRow label="Patient" value={receipt.patient_name} />
        {receipt.doctor_name && <ReceiptRow label="Doctor" value={receipt.doctor_name} />}
        <ReceiptRow label="Service" value={receipt.service_name || '—'} />
        <ReceiptRow label="Amount" value={receipt.amount} bold />
        <ReceiptRow label="Status" value={receipt.status} />
        {receipt.paid_at && <ReceiptRow label="Paid At" value={receipt.paid_at} />}
        {receipt.payment_method && <ReceiptRow label="Method" value={receipt.payment_method} />}
      </div>
      <div className="mg-flex mg-gap-xs mg-mt-md" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="mg-btn mg-btn-outline" onClick={onClose}>Close</button>
        <button type="button" className="mg-btn mg-btn-primary" onClick={() => window.print()}>🖨 Print</button>
      </div>
    </Modal>
  );
}

function ReceiptRow({ label, value, bold }) {
  return (
    <div className="mg-flex mg-justify-between" style={{ padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <span className="mg-muted mg-text-sm">{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

function Modal({ children, onClose, width = 420 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
      onClick={onClose}
    >
      <div className="mg-card" style={{ width, background: '#fff', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function InvoiceBadge({ status }) {
  const map = {
    pending: { className: 'mg-badge-pending', label: 'Pending' },
    paid: { className: 'mg-badge-completed', label: 'Paid' },
    cancelled: { className: 'mg-badge-cancelled', label: 'Cancelled' },
  };
  const cfg = map[status] || map.pending;
  return <span className={`mg-badge ${cfg.className}`}>{cfg.label}</span>;
}
