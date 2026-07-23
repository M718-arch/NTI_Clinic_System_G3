@extends('admin.layouts.app')

@section('title', 'Doctor Bookings')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="Patient Bookings"
        description="View and manage appointments scheduled for your medical services." />

    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">
            {{ session('success') }}
        </div>
    @endif

    <x-admin.card>
        @if($bookings->isEmpty())
            <p class="text-center text-slate-500 py-6">You have no patient bookings yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-200 text-slate-600 text-sm">
                            <th class="pb-3 px-4 font-semibold">Patient Name</th>
                            <th class="pb-3 px-4 font-semibold">Service</th>
                            <th class="pb-3 px-4 font-semibold">Date</th>
                            <th class="pb-3 px-4 font-semibold">Time</th>
                            <th class="pb-3 px-4 font-semibold">Status</th>
                            <th class="pb-3 px-4 font-semibold text-center">Actions</th>
                            <th class="pb-3 px-4 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                        @foreach($bookings as $booking)
                            <tr>
                                <td class="py-3 px-4 font-medium text-slate-800">{{ $booking->patient->name ?? 'N/A' }}</td>
                                <td class="py-3 px-4">{{ $booking->service->name ?? 'N/A' }}</td>
                                <td class="py-3 px-4">{{ $booking->date }}</td>
                                <td class="py-3 px-4">{{ $booking->time }}</td>
                                <td class="py-3 px-4">
                                    <span class="px-2.5 py-1 text-xs font-medium rounded-full 
                                        @if($booking->status == 'pending') bg-yellow-50 text-yellow-600 
                                        @elseif($booking->status == 'cancelled') bg-red-50 text-red-600 
                                        @else bg-green-50 text-green-600 @endif">
                                        {{ ucfirst($booking->status) }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
    <div class="flex items-center gap-2">

        @if($booking->status == 'pending')

            <form action="{{ route('bookings.accept', $booking) }}" method="POST">
                @csrf
                @method('PATCH')
                <button
                    type="submit"
                    onclick="return confirm('Accept this appointment?')"
                    class="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700">
                    Accept
                </button>
            </form>

            <form action="{{ route('bookings.cancel', $booking) }}" method="POST">
                @csrf
                @method('PATCH')
                <button
                    type="submit"
                    onclick="return confirm('Cancel this appointment?')"
                    class="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700">
                    Cancel
                </button>
            </form>

        @elseif($booking->status == 'accepted')

            <span class="text-green-600 font-semibold text-xs">
                Accepted
            </span>

        @elseif($booking->status == 'cancelled')

            <span class="text-red-600 font-semibold text-xs">
                Cancelled
            </span>

        @endif

    </div>
</td>
                                <td class="py-3 px-4 text-slate-500">{{ $booking->notes ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-admin.card>

</div>

@endsection