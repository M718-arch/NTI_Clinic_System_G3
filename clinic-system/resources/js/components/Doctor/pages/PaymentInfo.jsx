import React from 'react';
import { CreditCard, Search, SlidersHorizontal, DollarSign, UserCheck, Clock } from 'lucide-react';
import { PageTopBar } from '../components/TopBar';
import { SearchBox } from '../components/SearchBox';
import { Badge } from '../components/Badge';
import { INVOICES, PAYMENT_STATS } from '../data';

export const PaymentInfo = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageTopBar
        title="Payment information"
        icon={CreditCard}
        right={
          <>
            <SearchBox placeholder="Search invoice" />
            <button className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
              <SlidersHorizontal size={12} /> Filter
            </button>
          </>
        }
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PAYMENT_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.tint }}>
                  <Icon size={18} style={{ color: s.fg }} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="py-3 pl-5 pr-3 font-medium">Patient</th>
                <th className="py-3 px-3 font-medium">Treatment</th>
                <th className="py-3 px-3 font-medium">Date</th>
                <th className="py-3 px-3 font-medium">Amount</th>
                <th className="py-3 pr-5 pl-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="py-3 pl-5 pr-3 font-semibold text-slate-800">{inv.patient}</td>
                  <td className="py-3 px-3 text-slate-500">{inv.treatment}</td>
                  <td className="py-3 px-3 text-slate-500">{inv.date}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{inv.amount}</td>
                  <td className="py-3 pr-5 pl-3">
                    <Badge tone={inv.status === "Paid" ? "green" : inv.status === "Pending" ? "orange" : "red"}>
                      {inv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};