@extends('admin.layouts.app')

@section('title', 'Browse Services')

@section('content')

<div class="space-y-6">

    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-800">Available Medical Services</h1>
            <p class="text-sm text-slate-500 mt-1">Browse through professional services and book an appointment.</p>
        </div>
        <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative">
                <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" 
                       id="searchServices"
                       placeholder="Search services..." 
                       class="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64">
            </div>
        </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div>
                    <p class="text-2xl font-bold text-slate-800">{{ $services->count() }}</p>
                    <p class="text-xs text-slate-500">Total Services</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <p class="text-2xl font-bold text-slate-800">{{ $services->unique('doctor_id')->count() }}</p>
                    <p class="text-xs text-slate-500">Doctors</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p class="text-2xl font-bold text-slate-800">{{ $services->where('duration', '<=', 30)->count() }}</p>
                    <p class="text-xs text-slate-500">Quick Services</p>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <div>
                    <p class="text-2xl font-bold text-slate-800">4.8</p>
                    <p class="text-xs text-slate-500">Average Rating</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Services Grid -->
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3" id="servicesGrid">

        @forelse($services as $service)

            <div class="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                 data-name="{{ strtolower($service->name) }}"
                 data-doctor="{{ strtolower($service->doctor->name ?? '') }}">
                
                <div class="p-5">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-semibold text-slate-800 truncate group-hover:text-blue-600 transition">
                                {{ $service->name }}
                            </h3>
                            <div class="flex flex-wrap items-center gap-2 mt-1">
                                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                                    Dr. {{ $service->doctor->name ?? 'Specialist' }}
                                </span>
                                @if(isset($service->duration))
                                    <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                        {{ $service->duration }} min
                                    </span>
                                @endif
                            </div>
                        </div>
                        @if(isset($service->fee))
                            <span class="text-lg font-bold text-slate-800 ml-2 flex-shrink-0">
                                ${{ number_format($service->fee, 0) }}
                            </span>
                        @endif
                    </div>

                    <!-- Description -->
                    <p class="text-sm text-slate-500 line-clamp-3">
                        {{ $service->description ?? 'No description available.' }}
                    </p>

                    <!-- Features -->
                    @if(isset($service->features) && $service->features)
                        <div class="mt-3 flex flex-wrap gap-1">
                            @php
                                $features = is_array($service->features) ? $service->features : explode(',', $service->features);
                            @endphp
                            @foreach(array_slice($features, 0, 3) as $feature)
                                <span class="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-200">
                                    {{ trim($feature) }}
                                </span>
                            @endforeach
                        </div>
                    @endif

                    <!-- Footer -->
                    <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{{ rand(3, 10) }} slots today</span>
                        </div>
                        <a href="{{ route('patient.book.create', $service->id) }}" 
                           class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition transform hover:scale-105">
                            Book Now
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

        @empty
            <div class="col-span-full">
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
                    <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 class="text-lg font-medium text-slate-800 mb-2">No Medical Services Available</h3>
                    <p class="text-sm text-slate-500">Please check back later for available services.</p>
                </div>
            </div>
        @endforelse

    </div>

    <!-- Pagination -->
    @if(method_exists($services, 'links'))
        <div class="mt-6">
            {{ $services->links() }}
        </div>
    @endif

</div>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('searchServices');
        const cards = document.querySelectorAll('#servicesGrid > div[data-name]');

        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                let visible = 0;

                cards.forEach(card => {
                    const name = card.dataset.name || '';
                    const doctor = card.dataset.doctor || '';
                    const matches = name.includes(searchTerm) || doctor.includes(searchTerm);

                    if (matches) {
                        card.style.display = 'flex';
                        visible++;
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    });
</script>
@endpush

@endsection