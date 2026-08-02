import React from 'react';

export const Badge = ({ tone = "slate", children }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-500",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-600",
  };
  return <span className={`text-[11px] font-medium px-2 py-1 rounded-md ${tones[tone]}`}>{children}</span>;
};