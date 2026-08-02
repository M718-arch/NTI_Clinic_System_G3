@extends('admin.layouts.app')

@section('title', 'Appointments')

@section('content')

<div
    x-data="{
        openCancelModal: false,
        cancelUrl: ''
    }"
    class="space-y-6">

    <x-admin.page-header
        title="Appointments"
        description="View and manage every booking across the clinic." />

    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">
            {{ session('success') }}
        </div>
    @endif

    <x-admin.card>

        <form method="GET" class="grid grid-cols-1 gap-4 md:grid-cols-4">

            <x-admin.input
                name="search"
                placeholder="Search patient, doctor, or service..."
                :value="request('search')" />

            <x-admin.select
                name="status"
                placeholder="All Status"
                :options="[
                    'pending' => 'Pending',
                    'accepted' => 'Accepted',
                    'cancelled' => 'Cancelled',
                ]"
                :value="request('status')" />

            <x-admin.input
                name="date"
                type="date"
                :value="request('date')" />

            <x-admin.button
                type="submit"
                class="w-full self-start">
                Filter
            </x-admin.button>

        </form>

    </x-admin.card>

    <x-admin.card class="overflow-hidden p-0">

        <x-admin.table>

            <x-admin.table-head>
                <x-admin.table-head-cell>Patient</x-admin.table-head-cell>
                <x-admin.table-head-cell>Doctor</x-admin.table-head-cell>
                <x-admin.table-head-cell>Service</x-admin.table-head-cell>
                <x-admin.table-head-cell>Date &amp; Time</x-admin.table-head-cell>
                <x-admin.table-head-cell>Status</x-admin.table-head-cell>
                <x-admin.table-head-cell class="text-center">Actions</x-admin.table-head-cell>
            </x-admin.table-head>

            <x-admin.table-body>

                @forelse($bookings as $booking)

                    <x-admin.table-row>

                        <x-admin.table-cell>
                            <div class="font-semibold text-slate-800">
                                {{ $booking->patient->name ?? 'N/A' }}
                            </div>
                            <div class="text-sm text-slate-500">
                                {{ $booking->patient->email ?? '' }}
                            </div>
                        </x-admin.table-cell>

                        <x-admin.table-cell>
                            {{ $booking->service->doctor->name ?? 'N/A' }}
                        </x-admin.table-cell>

                        <x-admin.table-cell>
                            {{ $booking->service->name ?? 'N/A' }}
                        </x-admin.table-cell>

                        <x-admin.table-cell>
                            {{ \Carbon\Carbon::parse($booking->date)->format('M d, Y') }}
                            <span class="text-slate-400">&middot;</span>
                            {{ \Carbon\Carbon::parse($booking->time)->format('h:i A') }}
                        </x-admin.table-cell>

                        <x-admin.table-cell>
                            <x-admin.badge
                                :variant="match($booking->status) {
                                    'pending' => 'warning',
                                    'accepted' => 'success',
                                    'cancelled' => 'danger',
                                    default => 'secondary',
                                }">
                                {{ ucfirst($booking->status) }}
                            </x-admin.badge>
                        </x-admin.table-cell>

                        <x-admin.table-cell>
                            <div class="flex justify-center">
                                @if($booking->status !== 'cancelled')
                                    <button
                                        type="button"
                                        @click="
                                            cancelUrl='{{ route('bookings.cancel', $booking) }}';
                                            openCancelModal=true;
                                        "
                                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50">

                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             fill="none"
                                             viewBox="0 0 24 24"
                                             stroke-width="2"
                                             stroke="currentColor"
                                             class="h-5 w-5">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M6 18L18 6M6 6l12 12"/>
                                        </svg>

                                    </button>
                                @else
                                    <span class="text-sm text-slate-400">&mdash;</span>
                                @endif
                            </div>
                        </x-admin.table-cell>

                    </x-admin.table-row>

                @empty

                    <x-admin.table-row>
                        <x-admin.table-cell colspan="6" class="py-16 text-center">
                            <div class="flex flex-col items-center">

                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     stroke-width="1.5"
                                     stroke="currentColor"
                                     class="mb-4 h-14 w-14 text-slate-300">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z"/>
                                </svg>

                                <h3 class="text-lg font-semibold text-slate-700">
                                    No Appointments Found
                                </h3>

                                <p class="mt-1 text-sm text-slate-500">
                                    Try changing your filters.
                                </p>

                            </div>
                        </x-admin.table-cell>
                    </x-admin.table-row>

                @endforelse

            </x-admin.table-body>

        </x-admin.table>

    </x-admin.card>

    <div class="flex items-center justify-between">

        <p class="text-sm text-slate-500">
            Showing
            <span class="font-semibold">{{ $bookings->firstItem() ?? 0 }}</span>
            -
            <span class="font-semibold">{{ $bookings->lastItem() ?? 0 }}</span>
            of
            <span class="font-semibold">{{ $bookings->total() }}</span>
            appointments
        </p>

        {{ $bookings->links() }}

    </div>

    <!-- Cancel Confirmation Modal -->
    <div
        x-cloak
        x-show="openCancelModal"
        x-transition.opacity
        @keydown.escape.window="openCancelModal = false"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

        <div
            @click.away="openCancelModal = false"
            x-transition
            class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div class="flex items-start gap-4">

                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke-width="2"
                         stroke="currentColor"
                         class="h-6 w-6 text-red-600">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0"/>
                    </svg>
                </div>

                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-slate-800">
                        Cancel Appointment
                    </h3>
                    <p class="mt-2 text-sm leading-6 text-slate-500">
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                    </p>
                </div>

            </div>

            <div class="mt-8 flex justify-end gap-3">

                <button
                    type="button"
                    @click="openCancelModal = false"
                    class="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100">
                    Keep It
                </button>

                <form :action="cancelUrl" method="POST">
                    @csrf
                    @method('PATCH')
                    <button
                        type="submit"
                        class="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700">
                        Cancel Appointment
                    </button>
                </form>

            </div>

        </div>

    </div>

</div>

@endsection
