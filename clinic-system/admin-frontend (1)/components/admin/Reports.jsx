import React, { useEffect, useState } from 'react';
import { createAdminApi } from '../../api/adminApi';
import { useToast } from '../shared/ToastProvider';

/**
 * Reports
 *
 * Covers every item in the roadmap's Phase 7 list: Total Doctors/
 * Patients/Appointments, Revenue, Monthly Revenue, Appointment Status,
 * Most Booked Doctor, Most Booked Service, New Patients, Returning
 * Patients.
 *
 * The monthly revenue chart is a small dependency-free inline SVG bar
 * chart rather than pulling in recharts/chart.js — consistent with the
 * rest of this portal (ToastProvider, icons) not assuming any specific
 * charting library is installed in your actual project. Swap it for
 * your existing chart component if you have one.
 */
export default function Reports({ token }) {
  const api = createAdminApi(token);
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getReportsOverview()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => toast.error(e.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <div className="mg-spinner" />;
  if (!data) return <div className="mg-empty-state">Couldn't load reports.</div>;

  const statusTotal = Object.values(data.appointment_status).reduce((a, b) => a + b, 0) || 1;
  const patientsTotal = data.patients_this_month.new + data.patients_this_month.returning || 1;

  return (
    <div>
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Reports</h1>
          <p className="mg-page-subtitle">Clinic-wide performance and financial overview.</p>
        </div>
      </div>

      <div className="mg-stat-grid">
        <StatCard label="Total Doctors" value={data.totals.doctors} />
        <StatCard label="Total Patients" value={data.totals.patients} />
        <StatCard label="Total Appointments" value={data.totals.appointments} />
        <StatCard label="Total Services" value={data.totals.services} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--mg-space-md)', marginBottom: 'var(--mg-space-md)' }}>
        {/* Revenue */}
        <div className="mg-card">
          <div className="mg-flex mg-justify-between mg-items-center">
            <div style={{ fontWeight: 700, fontSize: 18 }}>Monthly Revenue</div>
            <div style={{ textAlign: 'right' }}>
              <div className="mg-muted mg-text-sm">Total Revenue</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--mg-primary)' }}>
                ${data.revenue.total.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mg-mt-md">
            <RevenueBarChart data={data.revenue.monthly} />
          </div>
          <div className="mg-mt-sm mg-text-sm mg-muted">
            Outstanding: <strong style={{ color: 'var(--mg-error)' }}>${data.revenue.outstanding.toLocaleString()}</strong>
          </div>
        </div>

        {/* Appointment status */}
        <div className="mg-card">
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Appointment Status</div>
          {Object.entries(data.appointment_status).map(([status, count]) => (
            <StatusRow key={status} status={status} count={count} total={statusTotal} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--mg-space-md)', marginBottom: 'var(--mg-space-md)' }}>
        {/* Top doctors */}
        <div className="mg-card">
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Most Booked Doctors</div>
          {data.top_doctor && (
            <div className="mg-muted mg-text-sm mg-mt-sm" style={{ marginBottom: 12 }}>
              Top: <strong style={{ color: 'var(--mg-on-surface)' }}>{data.top_doctor.name}</strong> with {data.top_doctor.bookings_total} bookings
            </div>
          )}
          <RankedList
            items={data.top_doctors}
            renderPrimary={(d) => d.name}
            renderSecondary={(d) => d.specialization}
            renderValue={(d) => d.bookings_total}
          />
        </div>

        {/* Top services */}
        <div className="mg-card">
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Most Booked Services</div>
          {data.top_service && (
            <div className="mg-muted mg-text-sm mg-mt-sm" style={{ marginBottom: 12 }}>
              Top: <strong style={{ color: 'var(--mg-on-surface)' }}>{data.top_service.name}</strong> with {data.top_service.bookings_count} bookings
            </div>
          )}
          <RankedList
            items={data.top_services}
            renderPrimary={(s) => s.name}
            renderSecondary={(s) => s.doctor_name}
            renderValue={(s) => s.bookings_count}
          />
        </div>
      </div>

      {/* New vs returning */}
      <div className="mg-card">
        <div className="mg-flex mg-justify-between mg-items-center" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Patients This Month</div>
          <div className="mg-muted mg-text-sm">
            {data.patients_this_month.range.from} – {data.patients_this_month.range.to}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--mg-space-md)' }}>
          <div className="mg-card-flat" style={{ textAlign: 'center' }}>
            <div className="mg-stat-value" style={{ color: '#1a8a5e' }}>{data.patients_this_month.new}</div>
            <div className="mg-stat-label">New Patients</div>
          </div>
          <div className="mg-card-flat" style={{ textAlign: 'center' }}>
            <div className="mg-stat-value">{data.patients_this_month.returning}</div>
            <div className="mg-stat-label">Returning Patients</div>
          </div>
        </div>
        <div className="mg-mt-md">
          <SplitBar
            segments={[
              { value: data.patients_this_month.new, color: '#1a8a5e', label: 'New' },
              { value: data.patients_this_month.returning, color: 'var(--mg-primary)', label: 'Returning' },
            ]}
            total={patientsTotal}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="mg-card">
      <div className="mg-stat-value">{value}</div>
      <div className="mg-stat-label">{label}</div>
    </div>
  );
}

function StatusRow({ status, count, total }) {
  const colors = {
    pending: 'var(--mg-on-surface-variant)',
    confirmed: 'var(--mg-primary)',
    completed: '#1a8a5e',
    cancelled: 'var(--mg-error)',
  };
  const pct = Math.round((count / total) * 100);

  return (
    <div style={{ marginBottom: 12 }}>
      <div className="mg-flex mg-justify-between mg-text-sm" style={{ marginBottom: 4 }}>
        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{status}</span>
        <span className="mg-muted">{count} ({pct}%)</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--mg-surface-container-high)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: colors[status] || 'var(--mg-primary)' }} />
      </div>
    </div>
  );
}

function RankedList({ items, renderPrimary, renderSecondary, renderValue }) {
  if (!items || items.length === 0) {
    return <div className="mg-muted mg-text-sm">No data yet.</div>;
  }
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          className="mg-flex mg-justify-between mg-items-center"
          style={{ padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
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
              <div style={{ fontWeight: 600, fontSize: 14 }}>{renderPrimary(item)}</div>
              <div className="mg-muted mg-text-sm">{renderSecondary(item)}</div>
            </div>
          </div>
          <div style={{ fontWeight: 700 }}>{renderValue(item)}</div>
        </div>
      ))}
    </div>
  );
}

function SplitBar({ segments, total }) {
  return (
    <div className="mg-flex" style={{ height: 10, borderRadius: 5, overflow: 'hidden', background: 'var(--mg-surface-container-high)' }}>
      {segments.map((seg) => (
        <div
          key={seg.label}
          style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
          title={`${seg.label}: ${seg.value}`}
        />
      ))}
    </div>
  );
}

/**
 * Minimal dependency-free bar chart for the 6-month revenue trend.
 */
function RevenueBarChart({ data }) {
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
}
