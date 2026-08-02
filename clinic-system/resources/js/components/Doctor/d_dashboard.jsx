import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import Calendar from "./pages/Calendar";
import { PatientList } from './pages/PatientList';
import { Messages } from './pages/Messages';
import { PaymentInfo } from './pages/PaymentInfo';
import { SettingsPage } from './pages/Settings';

export default function DoctorDashboard() {
  const [page, setPage] = useState("overview");

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans text-slate-800">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex min-w-0">
        {page === "overview" && <Overview />}
        {page === "calendar" && <Calendar />}
        {page === "patients" && <PatientList />}
        {page === "messages" && <Messages />}
        {page === "payment" && <PaymentInfo />}
        {page === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}