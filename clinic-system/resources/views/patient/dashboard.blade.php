@extends('patient.layouts.app')

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
            </div>

            <div class="grid gap-6 md:grid-cols-2">

                <!-- Browse services card -->
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 class="text-base font-semibold text-slate-800 mb-1.5">Browse Medical Services</h3>
                    <p class="text-sm text-slate-500 mb-5 flex-1">Explore available services from our doctors and book an appointment that fits your needs.</p>
                    <a href="{{ route('patient.services.index') }}"
                       class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        Browse Services
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

                <!-- My bookings card -->
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <div class="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 class="text-base font-semibold text-slate-800 mb-1.5">My Bookings</h3>
                    <p class="text-sm text-slate-500 mb-5 flex-1">View, track, and manage the status of all your booked appointments in one place.</p>
                    <a href="{{ route('patient.my.bookings') }}"
                       class="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                        View My Bookings
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

            </div>
        </div>
    </div>
@endsection
