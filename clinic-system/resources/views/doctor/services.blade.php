
@extends('admin.layouts.app')

@section('title', 'Available Services')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="Available Medical Services"
        description="Choose a service and book an appointment with our specialist doctors." />

    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">
            {{ session('success') }}
        </div>
    @endif

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        @forelse($services as $service)
            <x-admin.card>
                <div class="flex flex-col justify-between h-full space-y-4">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <h2 class="text-lg font-semibold text-slate-800">
                                {{ $service->name }}
                            </h2>
                            <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                                Dr. {{ $service->doctor->name ?? 'Specialist' }}
                            </span>
                        </div>

                        <p class="text-sm text-slate-500">
                            {{ $service->description ?? 'No description provided.' }}
                        </p>
                    </div>

                    <div class="pt-4 border-t border-slate-100 flex justify-end">
                        <a href="{{ route('patient.book.create', $service->id) }}" class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition">
                            Book Appointment
                        </a>
                    </div>
                </div>
            </x-admin.card>
        @empty
            <div class="col-span-full">
                <x-admin.card>
                    <p class="text-center text-slate-500 py-6">No medical services available right now.</p>
                </x-admin.card>
            </div>
        @endforelse
    </div>

</div>

@endsection