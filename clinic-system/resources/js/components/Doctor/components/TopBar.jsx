import React from 'react';

export const PageTopBar = ({ title, icon: Icon, right }) => {
  return (
    <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 bg-white gap-4 shrink-0">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
        {Icon && <Icon size={19} className="text-blue-600" />}
        {title}
      </div>
      <div className="flex items-center gap-2 shrink-0">{right}</div>
    </div>
  );
};