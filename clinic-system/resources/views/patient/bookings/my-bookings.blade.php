@extends('patient.layouts.app')

@section('title', 'My Bookings')

@section('content')

<div class="space-y-6">

    <x-doctor.page-header
        title="My Bookings"
        description="View and manage appointments scheduled for your medical services." />



            @if(session('success'))
                <div class="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
                    {{ session('success') }}
                </div>
            @endif

            <div class="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
                @if($bookings->isEmpty())
                    <div class="text-center py-12">
                        <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-slate-500 text-sm">You have no bookings yet.</p>
                        <a href="{{ route('patient.services.index') }}" class="inline-block mt-3 text-blue-600 text-sm font-medium hover:underline">
                            Browse services to book one →
                        </a>
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th class="px-6 py-3 font-medium">Service</th>
                                    <th class="px-6 py-3 font-medium">Doctor</th>
                                    <th class="px-6 py-3 font-medium">Date</th>
                                    <th class="px-6 py-3 font-medium">Time</th>
                                    <th class="px-6 py-3 font-medium">Status</th>
                                    <th class="px-6 py-3 font-medium">Notes</th>
                                    <th class="px-6 py-3 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                @foreach($bookings as $booking)
                                    <tr class="hover:bg-slate-50/60 transition">
                                        <td class="px-6 py-4 font-medium text-slate-800">{{ $booking->service->name ?? 'N/A' }}</td>
                                        <td class="px-6 py-4 text-slate-600">{{ $booking->service->doctor->name ?? 'N/A' }}</td>
                                        <td class="px-6 py-4 text-slate-600">{{ $booking->date }}</td>
                                        <td class="px-6 py-4 text-slate-600">{{ $booking->time }}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-2.5 py-1 text-xs font-medium rounded-full
                                                @if($booking->status == 'pending') bg-yellow-50 text-yellow-600
                                                @elseif($booking->status == 'cancelled') bg-red-50 text-red-600
                                                @else bg-green-50 text-green-600 @endif">
                                                {{ ucfirst($booking->status) }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-slate-500">{{ $booking->notes ?? '—' }}</td>
                                        <td class="px-6 py-4 text-center">
                                            @if($booking->status !== 'cancelled')
                                                <form action="{{ route('bookings.cancel', $booking) }}" method="POST">
                                                    @csrf
                                                    @method('PATCH')
                                                    <a href="{{ route('patient.bookings.edit', $booking) }}"
                                                    class="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                        Edit
                                                    </a>
                                                    <button type="submit" onclick="return confirm('Cancel this appointment?')"
                                                        class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100" style="background-color:brown; color: white;">
                                                        Cancel
                                                    </button>
                                                </form>
                                            @else
                                                <span class="text-slate-400">—</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection
