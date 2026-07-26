@extends('patient.layouts.app')

<<<<<<< Updated upstream
@section('title', 'Doctor Bookings')

@section('content')

<div class="space-y-6">



    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">
            {{ session('success') }}
        </div>
    @endif
            <div class="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white">
                <h3 class="text-lg font-semibold">Welcome back, {{ Auth::user()->name }}</h3>
                <p class="text-sm text-blue-100 mt-1">Here's what you can do today.</p>
=======
    @php
        // Safely get patient data
        $patient = Auth::user()->patient;
        
        // If patient exists, get appointments, otherwise use empty collection
        if ($patient) {
            $appointments = $patient->appointments;
            $totalCount = $appointments->count();
            $pendingCount = $appointments->where('status', 'pending')->count();
            $confirmedCount = $appointments->where('status', 'confirmed')->count();
            $completedCount = $appointments->where('status', 'completed')->count();
            $upcoming = $appointments->whereIn('status', ['pending', 'confirmed'])->take(3);
            $hasAppointments = true;
        } else {
            $appointments = collect();
            $totalCount = 0;
            $pendingCount = 0;
            $confirmedCount = 0;
            $completedCount = 0;
            $upcoming = collect();
            $hasAppointments = false;
        }
    @endphp

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            <!-- Welcome Banner with Stats -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 class="text-2xl font-bold">Welcome back, {{ Auth::user()->name }}!</h3>
                        <p class="text-blue-100 mt-1">Here's what you can do today.</p>
                    </div>
                    <div class="mt-4 md:mt-0 flex items-center gap-6 bg-white/10 rounded-xl px-6 py-3">
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ $totalCount }}</p>
                            <p class="text-xs text-blue-100">Total</p>
                        </div>
                        <div class="w-px h-10 bg-white/20"></div>
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ $pendingCount }}</p>
                            <p class="text-xs text-blue-100">Pending</p>
                        </div>
                        <div class="w-px h-10 bg-white/20"></div>
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ $confirmedCount }}</p>
                            <p class="text-xs text-blue-100">Confirmed</p>
                        </div>
                    </div>
                </div>
>>>>>>> Stashed changes
            </div>

            <!-- Quick Stats Cards -->
            <div class="grid gap-4 md:grid-cols-4">
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-slate-800">{{ $totalCount }}</p>
                    <p class="text-sm text-slate-500 mt-1">Total Appointments</p>
                    <div class="mt-2 w-full h-1 bg-blue-100 rounded-full">
                        <div class="w-full h-1 bg-blue-600 rounded-full"></div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-amber-600">{{ $pendingCount }}</p>
                    <p class="text-sm text-slate-500 mt-1">Pending</p>
                    <div class="mt-2 w-full h-1 bg-amber-100 rounded-full">
                        <div class="w-full h-1 bg-amber-500 rounded-full"></div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-emerald-600">{{ $confirmedCount }}</p>
                    <p class="text-sm text-slate-500 mt-1">Confirmed</p>
                    <div class="mt-2 w-full h-1 bg-emerald-100 rounded-full">
                        <div class="w-full h-1 bg-emerald-500 rounded-full"></div>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-slate-800">{{ $completedCount }}</p>
                    <p class="text-sm text-slate-500 mt-1">Completed</p>
                    <div class="mt-2 w-full h-1 bg-slate-100 rounded-full">
                        <div class="w-full h-1 bg-slate-600 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- Main Actions Grid -->
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                <!-- Browse Services Card -->
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            S
                        </div>
                        <h3 class="text-base font-semibold text-slate-800">Medical Services</h3>
                    </div>
                    <p class="text-sm text-slate-500 mb-5 flex-1">
                        Explore available services from our doctors and book an appointment that fits your needs.
                    </p>
                    <a href="{{ route('patient.services.index') }}"
                       class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        Browse Services
                        <span class="text-lg">→</span>
                    </a>
                </div>

                <!-- My Bookings Card -->
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                            B
                        </div>
                        <h3 class="text-base font-semibold text-slate-800">My Bookings</h3>
                    </div>
                    <p class="text-sm text-slate-500 mb-5 flex-1">
                        View, track, and manage the status of all your booked appointments in one place.
                    </p>
                    <a href="{{ route('patient.my.bookings') }}"
                       class="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        View Bookings
                        <span class="text-lg">→</span>
                    </a>
                </div>

                <!-- My Profile Card -->
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                            P
                        </div>
                        <h3 class="text-base font-semibold text-slate-800">My Profile</h3>
                    </div>
                    <p class="text-sm text-slate-500 mb-5 flex-1">
                        Update your personal information, contact details, and medical preferences.
                    </p>
                    <a href="{{ route('profile.edit') }}"
                       class="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        View Profile
                        <span class="text-lg">→</span>
                    </a>
                </div>

            </div>

            <!-- Upcoming Appointments Section -->
            @if($hasAppointments && $upcoming->count() > 0)
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100">
                    <h3 class="font-semibold text-slate-800">Upcoming Appointments</h3>
                </div>
                <div class="divide-y divide-slate-100">
                    @foreach($upcoming as $appointment)
                    <div class="px-6 py-4 hover:bg-slate-50 transition">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-medium text-slate-800">
                                    Dr. {{ $appointment->doctor->user->name ?? 'N/A' }}
                                </p>
                                <div class="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <span>{{ $appointment->appointment_date->format('M d, Y') }}</span>
                                    <span>•</span>
                                    <span>{{ $appointment->appointment_time }}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="px-3 py-1 rounded-full text-xs font-medium
                                    @if($appointment->status == 'pending') bg-amber-100 text-amber-700
                                    @elseif($appointment->status == 'confirmed') bg-blue-100 text-blue-700
                                    @else bg-slate-100 text-slate-700 @endif">
                                    {{ ucfirst($appointment->status) }}
                                </span>
                                <a href="{{ route('patient.my.bookings') }}" class="text-sm text-blue-600 hover:text-blue-700">
                                    View
                                </a>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif

            <!-- Quick Help Section -->
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h4 class="font-semibold text-slate-800">Need help?</h4>
                        <p class="text-sm text-slate-500">Contact our support team for assistance with bookings or services.</p>
                    </div>
                    <div class="flex gap-3">
                        <a href="#" class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                            Support Center
                        </a>
                        <a href="#" class="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>

        </div>
    </div>
@endsection
