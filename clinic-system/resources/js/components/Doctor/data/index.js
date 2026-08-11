// resources/js/components/Doctor/data/index.js

import { 
  LayoutGrid, CalendarDays, Users, MessageSquare, CreditCard, 
  Settings as SettingsIcon, UserPlus, DollarSign, UserCheck, Clock, 
  Bell, Lock, Building2, ClipboardList, FileText 
} from 'lucide-react';

// Only ONE NAV_ITEMS export - remove the duplicate
export const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "patients", label: "Patient List", icon: Users },
  { key: "chart", label: "Patient Chart", icon: FileText }, // ✅ Added
  { key: "queue", label: "Queue", icon: Clock },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "payment", label: "Payment information", icon: CreditCard },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

// The rest of your exports...
export const STAT_CARDS = [
  { label: "Today's Appointments", value: "12", delta: "+3", up: true, icon: CalendarDays, tint: "#eef4ff", fg: "#3b7cf6" },
  { label: "Total Patients", value: "1,284", delta: "+18", up: true, icon: Users, tint: "#f0fbf6", fg: "#22b07d" },
  { label: "New Patients", value: "24", delta: "-4", up: false, icon: UserPlus, tint: "#fff8f1", fg: "#f2994a" },
  { label: "Revenue this month", value: "$18,420", delta: "+12%", up: true, icon: DollarSign, tint: "#f2f3fa", fg: "#2f3e83" },
];

export const TREATMENT_MIX = [
  { label: "Scaling", value: 32, color: "#e14a6b" },
  { label: "Root Canal", value: 18, color: "#3b7cf6" },
  { label: "Wisdom Removal", value: 14, color: "#22b07d" },
  { label: "Consultation", value: 26, color: "#f2994a" },
  { label: "Bleaching", value: 10, color: "#2f3e83" },
];

export const TODAY_LIST = [
  { time: "09:00", name: "Willy", treatment: "Scaling", status: "Waiting" },
  { time: "10:30", name: "Dimas Rome", treatment: "Root Canal", status: "Arrived" },
  { time: "13:00", name: "Rizal", treatment: "Wisdom Teeth Removal", status: "Waiting" },
  { time: "14:00", name: "Herman", treatment: "Scaling", status: "Confirmed" },
];

export const DAYS = [
  { key: "mon", label: "23", weekday: "Mon" },
  { key: "tue", label: "24", weekday: "Tue" },
  { key: "wed", label: "25", weekday: "Wed" },
  { key: "thu", label: "26", weekday: "Thu" },
  { key: "fri", label: "27", weekday: "Fri" },
  { key: "sat", label: "28", weekday: "Sat" },
  { key: "sun", label: "29", weekday: "Sun" },
];

export const TYPE_STYLES = {
  scaling: { bar: "#e14a6b", tint: "#fff5f7" },
  root_canal: { bar: "#3b7cf6", tint: "#f2f7ff" },
  wisdom: { bar: "#22b07d", tint: "#f0fbf6" },
  consultation: { bar: "#f2994a", tint: "#fff8f1" },
  bleaching: { bar: "#2f3e83", tint: "#f2f3fa" },
};

export const APPOINTMENTS = [
  { id: 1, day: "mon", start: 9, end: 10, patient: "Willy", type: "scaling", title: "Scaling", tag: "Member" },
  { id: 2, day: "mon", start: 10.5, end: 12.5, patient: "Dimas", type: "root_canal", title: "Root Canal", tag: "Member" },
  { id: 3, day: "mon", start: 13, end: 15, patient: "Rizal", type: "wisdom", title: "Wisdom Teeth Removal", tag: "Drop Here" },
  { id: 4, day: "wed", start: 13, end: 14, patient: "Herman", type: "scaling", title: "Scaling", tag: "" },
  { id: 5, day: "thu", start: 9, end: 10, patient: "Chandra", type: "consultation", title: "Consultation", tag: "" },
  { id: 6, day: "thu", start: 13, end: 14, patient: "Danu", type: "consultation", title: "Consultation", tag: "" },
  { id: 7, day: "fri", start: 10.5, end: 12.5, patient: "Hendri", type: "wisdom", title: "Wisdom Teeth Removal", tag: "" },
  { id: 8, day: "sat", start: 10.5, end: 12.5, patient: "Hendri", type: "bleaching", title: "Bleaching", tag: "" },
];

export const TIMELINE = [
  { date: "27 Nov '19", time: "14:00 - 15:00", label: "Consultation", status: "faded", dentist: "Drg. Adam H.", nurse: "Maria Reres" },
  { date: "29 Nov '19", time: "14:00 - 15:00", label: "Consultation", status: "previous", dentist: "Drg. Adam H.", nurse: "Maria Reres" },
  { date: "24 Nov '19", time: "09:00 - 10:00", label: "Open Access", status: "current", dentist: "Drg. Adam H.", nurse: "Jessicamila" },
  { date: "17 Nov '19", time: "14:00 - 15:00", label: "Consultation", status: "previous", dentist: "Drg. Adam H.", nurse: "Maria Reres" },
  { date: "4 Nov '19", time: "14:00 - 15:00", label: "Consultation", status: "previous", dentist: "Drg. Adam H.", nurse: "Malika Atelie" },
  { date: "1 Nov '19", time: "14:00 - 15:00", label: "Consultation", status: "previous", dentist: "Drg. Adam H.", nurse: "Kiki Jecky" },
];

export const REQUESTS = [
  { day: "Thu, Oct 24", name: "Diane Cooper", treatment: "Root Canal", place: "Cilacap", time: "1.30 pm - 2.30 pm" },
  { day: "Thu, Oct 24", name: "Leslie Pena", treatment: "Bleaching", place: "Purwokerto", time: "8.00 pm - 9.00 pm" },
  { day: "Thu, Oct 23", name: "Ralph Mccoy", treatment: "Scaling", place: "Purwokerto", time: "9.00 pm - 10.00 pm" },
  { day: "Thu, Oct 23", name: "Darlene Steward", treatment: "Scaling", place: "Purwokerto", time: "1.30 pm - 2.30 pm" },
  { day: "Thu, Oct 22", name: "Ralph Mccoy", treatment: "Scaling", place: "Purwokerto", time: "9.00 pm - 10.00 pm" },
  { day: "Thu, Oct 22", name: "Arlene Bell", treatment: "Scaling", place: "Purwokerto", time: "1.30 pm - 2.30 pm" },
];

export const PATIENTS = [
  { name: "Willy Santoso", age: 34, gender: "Male", phone: "+62 812-3456-001", lastVisit: "23 Oct 2019", status: "Member" },
  { name: "Dimas Rome", age: 28, gender: "Male", phone: "+62 812-3456-002", lastVisit: "23 Oct 2019", status: "Member" },
  { name: "Rizal Fahmi", age: 41, gender: "Male", phone: "+62 812-3456-003", lastVisit: "23 Oct 2019", status: "Non-member" },
  { name: "Herman Wijaya", age: 52, gender: "Male", phone: "+62 812-3456-004", lastVisit: "25 Oct 2019", status: "Member" },
  { name: "Chandra Putri", age: 25, gender: "Female", phone: "+62 812-3456-005", lastVisit: "26 Oct 2019", status: "Member" },
  { name: "Danu Setiawan", age: 30, gender: "Male", phone: "+62 812-3456-006", lastVisit: "26 Oct 2019", status: "Non-member" },
  { name: "Hendri Kusuma", age: 47, gender: "Male", phone: "+62 812-3456-007", lastVisit: "27 Oct 2019", status: "Member" },
  { name: "Diane Cooper", age: 29, gender: "Female", phone: "+62 812-3456-008", lastVisit: "24 Oct 2019", status: "Member" },
];

export const CONVERSATIONS = [
  { name: "Dimas Rome", preview: "Thank you doctor, see you then!", time: "09:41", unread: 2 },
  { name: "Willy Santoso", preview: "Can I reschedule to next week?", time: "Yesterday", unread: 0 },
  { name: "Rizal Fahmi", preview: "Is the swelling normal after extraction?", time: "Yesterday", unread: 1 },
  { name: "Herman Wijaya", preview: "Got it, thanks for the reminder", time: "Mon", unread: 0 },
  { name: "Chandra Putri", preview: "What time should I arrive?", time: "Mon", unread: 0 },
];

export const CHAT_THREAD = [
  { from: "them", text: "Hi doctor, I wanted to confirm my appointment for tomorrow.", time: "09:12" },
  { from: "me", text: "Hi Dimas, yes it's confirmed for 10:30 - Root Canal follow up.", time: "09:15" },
  { from: "them", text: "Great, should I avoid eating before the appointment?", time: "09:20" },
  { from: "me", text: "No need to fast, just avoid anything too hard or sticky beforehand.", time: "09:22" },
  { from: "them", text: "Thank you doctor, see you then!", time: "09:41" },
];

export const INVOICES = [
  { patient: "Willy Santoso", treatment: "Scaling", date: "23 Oct 2019", amount: "$80", status: "Paid" },
  { patient: "Dimas Rome", treatment: "Root Canal", date: "23 Oct 2019", amount: "$420", status: "Pending" },
  { patient: "Rizal Fahmi", treatment: "Wisdom Teeth Removal", date: "23 Oct 2019", amount: "$260", status: "Paid" },
  { patient: "Herman Wijaya", treatment: "Scaling", date: "25 Oct 2019", amount: "$80", status: "Overdue" },
  { patient: "Chandra Putri", treatment: "Consultation", date: "26 Oct 2019", amount: "$40", status: "Paid" },
  { patient: "Hendri Kusuma", treatment: "Bleaching", date: "28 Oct 2019", amount: "$180", status: "Pending" },
];

export const PAYMENT_STATS = [
  { label: "Total Revenue", value: "$18,420", icon: DollarSign, tint: "#f0fbf6", fg: "#22b07d" },
  { label: "Paid Invoices", value: "42", icon: UserCheck, tint: "#eef4ff", fg: "#3b7cf6" },
  { label: "Pending", value: "7", icon: Clock, tint: "#fff8f1", fg: "#f2994a" },
];

export const SETTINGS_NAV = [
  { key: "profile", label: "Profile", icon: Users },
  { key: "clinic", label: "Clinic", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Lock },
];