<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">My Services</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">

            @if (session('success'))
                <div class="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
                    {{ session('success') }}
                </div>
            @endif

            <!-- Stats row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-semibold text-slate-800">{{ $services->count() }}</p>
                        <p class="text-xs text-slate-500">Total Services</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-semibold text-slate-800">{{ $services->sum('bookings_count') }}</p>
                        <p class="text-xs text-slate-500">Total Patients Booked</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-semibold text-slate-800">
                            {{ $services->sortByDesc('bookings_count')->first()?->name ?? '—' }}
                        </p>
                        <p class="text-xs text-slate-500">Most Booked Service</p>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <a href="{{ route('doctor.bookings.index') }}"
                   class="inline-flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition">
                    View Bookings
                </a>
                <a href="{{ route('doctor.services.create') }}"
                   class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition">
                    + Add New Service
                </a>
            </div>

            <!-- Services table -->
            <div class="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
                @if ($services->isEmpty())
                    <div class="text-center py-12">
                        <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p class="text-slate-500 text-sm">You haven't added any services yet.</p>
                        <p class="text-slate-400 text-xs mt-1">Click "Add New Service" above to get started.</p>
                    </div>
                @else
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th class="px-6 py-3 font-medium">Service</th>
                                <th class="px-6 py-3 font-medium">Description</th>
                                <th class="px-6 py-3 font-medium text-right">Patients Booked</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @foreach ($services as $service)
                                <tr class="hover:bg-slate-50/60 transition">
                                    <td class="px-6 py-4 font-medium text-slate-800">{{ $service->name }}</td>
                                    <td class="px-6 py-4 text-slate-500">{{ $service->description ?: '—' }}</td>
                                    <td class="px-6 py-4 text-right">
                                        <span class="inline-flex items-center justify-center min-w-[2rem] h-7 px-2.5 rounded-full text-xs font-semibold
                                            {{ $service->bookings_count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400' }}">
                                            {{ $service->bookings_count ?? 0 }}
                                        </span>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>