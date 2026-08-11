// resources/js/components/Doctor/d_dashboard.jsx

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import Calendar from "./pages/Calendar";
import { PatientList } from './pages/PatientList';
import { Messages } from './pages/Messages';
import { PaymentInfo } from './pages/PaymentInfo';
import { SettingsPage } from './pages/Settings';
import DoctorQueue from "./pages/DoctorQueue";
import { useAuth } from '../../context/AuthContext';
import DoctorPatientChart from "./pages/DoctorPatientChart";

export default function DoctorDashboard() {
  const [page, setPage] = useState("overview");
  const { token, user } = useAuth();
  
  // State for patient chart
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const renderPage = () => {
    switch(page) {
      case "overview":
        return <Overview />;
        
      case "calendar":
        return <Calendar />;
        
      case "patients":
        return (
          <PatientList 
            onSelectPatient={(patient) => {
              console.log('Patient selected from list:', patient);
              setSelectedPatient(patient);
              setSelectedPatientId(patient.id);
              setSelectedPatientName(patient.name || patient.user?.name || 'Patient');
              setSelectedBookingId(null);
              setPage("chart");
            }} 
          />
        );
        
      case "messages":
        return <Messages />;
        
      case "payment":
        return <PaymentInfo />;
        
      case "settings":
        return <SettingsPage />;
        
      case "queue": 
        return (
          <DoctorQueue 
            token={token} 
            onSelectPatient={(patient, bookingId) => {
              console.log('Patient selected from queue:', patient);
              setSelectedPatient(patient);
              setSelectedPatientId(patient.id);
              setSelectedPatientName(patient.name || patient.user?.name || 'Patient');
              setSelectedBookingId(bookingId);
              setPage("chart");
            }}
          />
        );
        
      case "chart":
        if (!selectedPatientId) {
          return (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Patient Chart</h2>
                <p className="text-gray-500 mb-4">
                  Select a patient from the Patient List or Queue to view their medical chart
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setPage("patients")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Patient List
                  </button>
                  <button 
                    onClick={() => setPage("queue")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    View Queue
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="flex-1 overflow-auto">
            <DoctorPatientChart 
              token={token} 
              patientId={selectedPatientId}
              patientName={selectedPatientName}
              bookingId={selectedBookingId}
              patient={selectedPatient}
              onError={(error) => {
                console.error('Chart error:', error);
                // You could show a toast notification here
              }}
            />
          </div>
        );
        
      default:
        return <Overview />;
    }
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans text-slate-800">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex min-w-0 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}