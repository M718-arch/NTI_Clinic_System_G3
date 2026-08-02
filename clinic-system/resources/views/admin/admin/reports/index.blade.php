@extends('admin.layouts.app')

@section('title', 'Reports')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="Reports"
        description="A snapshot of clinic activity and performance." />

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <x-admin.stat-card title="Total Bookings" :value="$totalBookings" />
        <x-admin.stat-card title="Pending" :value="$pendingBookings" />
        <x-admin.stat-card title="Accepted" :value="$acceptedBookings" />
        <x-admin.stat-card title="Cancelled" :value="$cancelledBookings" />

    </div>

    <div class="grid gap-6 xl:grid-cols-3">

        <x-admin.card class="xl:col-span-2">

            <h2 class="mb-4 text-lg font-semibold text-slate-800">
                Bookings — Last 6 Months
            </h2>

            <canvas id="bookingsChart" height="120"></canvas>

        </x-admin.card>

        <x-admin.card>

            <h2 class="mb-4 text-lg font-semibold text-slate-800">
                Booking Status Breakdown
            </h2>

            <canvas id="statusChart" height="220"></canvas>

        </x-admin.card>

    </div>

    <div class="grid gap-6 xl:grid-cols-2">

        <!-- Top Doctors -->
        <x-admin.card>

            <h2 class="mb-5 text-lg font-semibold text-slate-800">
                Top Doctors by Bookings
            </h2>

            <div class="space-y-4">

                @forelse($topDoctors as $doctor)

                    <div class="flex items-center justify-between">

                        <div class="flex items-center gap-3">

                            <x-admin.avatar
                                :src="$doctor->image"
                                :name="$doctor->user->name" />

                            <div>
                                <p class="font-medium text-slate-800">
                                    {{ $doctor->user->name }}
                                </p>
                                <p class="text-sm text-slate-500">
                                    {{ $doctor->specialization->name ?? '' }}
                                </p>
                            </div>

                        </div>

                        <x-admin.badge variant="primary">
                            {{ $doctor->bookings_total }} bookings
                        </x-admin.badge>

                    </div>

                @empty

                    <p class="text-center text-slate-500">No booking data yet.</p>

                @endforelse

            </div>

        </x-admin.card>

        <!-- Top Services -->
        <x-admin.card>

            <h2 class="mb-5 text-lg font-semibold text-slate-800">
                Most Booked Services
            </h2>

            <div class="space-y-4">

                @forelse($topServices as $service)

                    <div class="flex items-center justify-between">

                        <div>
                            <p class="font-medium text-slate-800">
                                {{ $service->name }}
                            </p>
                            <p class="text-sm text-slate-500">
                                {{ $service->doctor->name ?? 'N/A' }}
                            </p>
                        </div>

                        <x-admin.badge variant="secondary">
                            {{ $service->bookings_count }} bookings
                        </x-admin.badge>

                    </div>

                @empty

                    <p class="text-center text-slate-500">No service data yet.</p>

                @endforelse

            </div>

        </x-admin.card>

    </div>

</div>

@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const monthLabels = @json($monthLabels);
        const bookingsPerMonth = @json($bookingsPerMonth);

        new Chart(document.getElementById('bookingsChart'), {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Bookings',
                    data: bookingsPerMonth,
                    backgroundColor: '#2563eb',
                    borderRadius: 8,
                    maxBarThickness: 48,
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                },
            },
        });

        new Chart(document.getElementById('statusChart'), {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Accepted', 'Cancelled'],
                datasets: [{
                    data: [{{ $pendingBookings }}, {{ $acceptedBookings }}, {{ $cancelledBookings }}],
                    backgroundColor: ['#eab308', '#16a34a', '#dc2626'],
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
            },
        });
    });
</script>
@endpush
