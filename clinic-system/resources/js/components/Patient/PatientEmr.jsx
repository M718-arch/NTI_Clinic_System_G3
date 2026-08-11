// resources/js/components/patient/PatientEmr.jsx

import React, { useState, useEffect } from 'react';
import { createPatientPhase8Api } from '../../api/patientapi';

const TABS = [
  { key: 'diagnoses', label: 'Diagnoses' },
  { key: 'labs', label: 'Lab Results' },
  { key: 'radiology', label: 'Radiology' },
  { key: 'prescriptions', label: 'Prescriptions' },
];

/**
 * PatientEmr
 *
 * Standalone, read-only — patients can't create records, only doctors
 * can (see DoctorPatientChart). "Download Invoice"-style PDF download
 * isn't wired here for the same reason as invoice receipts (Phase 6):
 * no PDF library confirmed installed. Each prescription/result row has
 * a "Print" button that calls window.print() on the whole page instead.
 *
 * Props: token (required), onError (optional).
 */
export default function PatientEmr({ token, onError }) {
  const api = createPatientPhase8Api(token);

  const [tab, setTab] = useState('diagnoses');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getEmr()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => { if (!cancelled) { setError(e.message); onError?.(e.message); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <div className="mg-spinner" />;
  if (error && !data) return <div className="mg-card" style={{ color: 'var(--mg-error)' }}>{error}</div>;

  const items = {
    diagnoses: data?.diagnoses || [],
    labs: data?.lab_results || [],
    radiology: data?.radiology_results || [],
    prescriptions: data?.prescriptions || [],
  };

  return (
    <div className="mg-app" style={{ minHeight: 'auto' }}>
      <div className="mg-flex mg-justify-between mg-items-center">
        <div style={{ fontWeight: 700, fontSize: 20 }}>My Medical Records</div>
        <button type="button" className="mg-btn mg-btn-outline mg-btn-sm" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="mg-flex mg-gap-md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', margin: '12px 0 16px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', padding: '10px 4px', marginBottom: -1,
              borderBottom: tab === t.key ? '2px solid var(--mg-primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--mg-primary)' : 'var(--mg-on-surface-variant)',
              fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer', fontSize: 15,
            }}
          >
            {t.label} {items[t.key].length > 0 && <span className="mg-muted">({items[t.key].length})</span>}
          </button>
        ))}
      </div>

      <div className="mg-card">
        {tab === 'diagnoses' && (
          items.diagnoses.length === 0 ? <Empty text="No diagnoses on record." /> :
          items.diagnoses.map((d) => (
            <Row key={d.id} title={d.title} subtitle={`${d.diagnosed_date} · Dr. ${d.doctor?.full_name || d.doctor?.user?.name || 'N/A'}`} body={d.description} />
          ))
        )}
        {tab === 'labs' && (
          items.labs.length === 0 ? <Empty text="No lab results on record." /> :
          items.labs.map((r) => (
            <Row key={r.id} title={r.test_name} subtitle={r.result_date} body={[r.result, r.unit, r.reference_range ? `(ref: ${r.reference_range})` : null].filter(Boolean).join(' ')} />
          ))
        )}
        {tab === 'radiology' && (
          items.radiology.length === 0 ? <Empty text="No radiology results on record." /> :
          items.radiology.map((r) => (
            <Row key={r.id} title={`${r.imaging_type}${r.body_area ? ` — ${r.body_area}` : ''}`} subtitle={r.result_date} body={r.findings} />
          ))
        )}
        {tab === 'prescriptions' && (
          items.prescriptions.length === 0 ? <Empty text="No prescriptions on record." /> :
          items.prescriptions.map((p) => (
            <Row
              key={p.id}
              title={p.medicine}
              subtitle={`${p.prescribed_date} · Dr. ${p.doctor?.full_name || p.doctor?.user?.name || 'N/A'}`}
              body={[p.dose, p.frequency, p.duration].filter(Boolean).join(' · ')}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Row({ title, subtitle, body }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="mg-flex mg-justify-between">
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
        <span className="mg-muted mg-text-sm">{subtitle}</span>
      </div>
      {body && <div className="mg-muted mg-text-sm mg-mt-sm">{body}</div>}
    </div>
  );
}

function Empty({ text }) {
  return <div className="mg-muted mg-text-sm">{text}</div>;
}
