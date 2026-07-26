@extends('patient.layouts.app')

@section('title', 'My Bookings')

@section('content')

<div class="space-y-6">

    <x-doctor.page-header
        title="My Bookings"
        description="View and manage appointments scheduled for your medical services." />


<<<<<<< Updated upstream:clinic-system/resources/views/patient/bookings/my-bookings.blade.php
=======
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
>>>>>>> Stashed changes:clinic-system/resources/views/patient/my-bookings.blade.php

            @if(session('success'))
                <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ session('success') }}
                </div>
            @endif

            <!-- Stats Cards -->
            <div class="grid gap-4 md:grid-cols-4">
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-slate-800">{{ $bookings->count() }}</p>
                    <p class="text-sm text-slate-500 mt-1">Total Bookings</p>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-amber-600">{{ $bookings->where('status', 'pending')->count() }}</p>
                    <p class="text-sm text-slate-500 mt-1">Pending</p>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-emerald-600">{{ $bookings->where('status', 'confirmed')->count() }}</p>
                    <p class="text-sm text-slate-500 mt-1">Confirmed</p>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <p class="text-2xl font-bold text-red-600">{{ $bookings->where('status', 'cancelled')->count() }}</p>
                    <p class="text-sm text-slate-500 mt-1">Cancelled</p>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <form method="GET" class="flex flex-wrap gap-3">
                    <div class="flex-1 min-w-[150px]">
                        <label class="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select name="status" class="w-full rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">All Status</option>
                            <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                            <option value="confirmed" {{ request('status') == 'confirmed' ? 'selected' : '' }}>Confirmed</option>
                            <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                            <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                        </select>
                    </div>
                    <div class="flex-1 min-w-[150px]">
                        <label class="block text-xs font-medium text-slate-500 mb-1">From</label>
                        <input type="date" name="date_from" value="{{ request('date_from') }}" class="w-full rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="flex-1 min-w-[150px]">
                        <label class="block text-xs font-medium text-slate-500 mb-1">To</label>
                        <input type="date" name="date_to" value="{{ request('date_to') }}" class="w-full rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="flex items-end gap-2">
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition">
                            Filter
                        </button>
                        <a href="{{ route('patient.my.bookings') }}" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                            Reset
                        </a>
                    </div>
                </form>
            </div>

            <!-- Bookings Table -->
            <div class="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
                @if($bookings->isEmpty())
                    <div class="text-center py-16">
                        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-slate-500 text-sm">You have no bookings yet.</p>
                        <a href="{{ route('patient.services.index') }}" class="inline-block mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 transition">
                            Browse Services
                        </a>
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th class="px-6 py-4 font-semibold">Service</th>
                                    <th class="px-6 py-4 font-semibold">Doctor</th>
                                    <th class="px-6 py-4 font-semibold">Date</th>
                                    <th class="px-6 py-4 font-semibold">Time</th>
                                    <th class="px-6 py-4 font-semibold">Status</th>
                                    <th class="px-6 py-4 font-semibold">Notes</th>
                                    <th class="px-6 py-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                @foreach($bookings as $booking)
                                    <tr class="hover:bg-slate-50/60 transition">
                                        <td class="px-6 py-4 font-medium text-slate-800">
                                            {{ $booking->service->name ?? 'N/A' }}
                                        </td>
                                        <td class="px-6 py-4 text-slate-600">
                                            Dr. {{ $booking->service->doctor->name ?? 'N/A' }}
                                        </td>
                                        <td class="px-6 py-4 text-slate-600">
                                            {{ \Carbon\Carbon::parse($booking->date)->format('M d, Y') }}
                                        </td>
                                        <td class="px-6 py-4 text-slate-600">
                                            {{ \Carbon\Carbon::parse($booking->time)->format('g:i A') }}
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 text-xs font-medium rounded-full
                                                @if($booking->status == 'pending') bg-amber-100 text-amber-700
                                                @elseif($booking->status == 'confirmed') bg-blue-100 text-blue-700
                                                @elseif($booking->status == 'completed') bg-emerald-100 text-emerald-700
                                                @else bg-red-100 text-red-700 @endif">
                                                {{ ucfirst($booking->status) }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-slate-500 max-w-[150px] truncate">
                                            {{ $booking->notes ?? '—' }}
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            @if($booking->status !== 'cancelled' && $booking->status !== 'completed')
                                                <form action="{{ route('bookings.cancel', $booking) }}" method="POST" onsubmit="return confirmCancel(event)">
                                                    @csrf
                                                    @method('PATCH')
<<<<<<< Updated upstream:clinic-system/resources/views/patient/bookings/my-bookings.blade.php
                                                    <a href="{{ route('patient.bookings.edit', $booking) }}"
                                                    class="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                        Edit
                                                    </a>
                                                    <button type="submit" onclick="return confirm('Cancel this appointment?')"
                                                        class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100" style="background-color:brown; color: white;">
=======
                                                    <button type="submit" class="text-red-600 text-xs font-medium hover:text-red-800 transition">
>>>>>>> Stashed changes:clinic-system/resources/views/patient/my-bookings.blade.php
                                                        Cancel
                                                    </button>
                                                </form>
                                            @elseif($booking->status == 'completed')
                                                <span class="text-emerald-600 text-xs font-medium">Completed</span>
                                            @else
                                                <span class="text-slate-400 text-xs">Cancelled</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if(method_exists($bookings, 'links'))
                        <div class="px-6 py-4 border-t border-slate-100">
                            {{ $bookings->links() }}
                        </div>
                    @endif
                @endif
            </div>

            <!-- Quick Action -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h4 class="font-semibold text-slate-800">Need to book a new appointment?</h4>
                        <p class="text-sm text-slate-500">Browse available medical services and schedule your next visit.</p>
                    </div>
                    <a href="{{ route('patient.services.index') }}" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 transition text-center whitespace-nowrap">
                        Book Now
                    </a>
                </div>
            </div>

        </div>
    </div>
<<<<<<< Updated upstream:clinic-system/resources/views/patient/bookings/my-bookings.blade.php
@endsection
=======
</x-app-layout>

@push('scripts')
<script>
    function confirmCancel(event) {
        event.preventDefault();
        if (confirm('Are you sure you want to cancel this appointment?')) {
            event.target.submit();
        }
        return false;
    }
</script>
@endpush
>>>>>>> Stashed changes:clinic-system/resources/views/patient/my-bookings.blade.php
