import React from 'react';
import { Search } from 'lucide-react';

export const SearchBox = ({ placeholder = "Search" }) => {
  return (
    <div className="relative hidden md:block">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
      <input
        placeholder={placeholder}
        className="pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 w-40"
      />
    </div>
  );
};