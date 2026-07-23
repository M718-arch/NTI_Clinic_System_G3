@extends('patient.layouts.app')

@section('title', 'Doctor Bookings')

@section('content')

<div class="space-y-6">

    <x-doctor.page-header
        title="Patient Bookings"
        description="View and manage appointments scheduled for your medical services." />

    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">
            {{ session('success') }}
        </div>
    @endif



            <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-8 pt-8 pb-6 border-b border-slate-100">
                    <h3 class="font-semibold text-slate-800">{{ $service->name }}</h3>
                    <p class="text-sm text-slate-500 mt-1">{{ $service->description }}</p>
                </div>

                <form action="{{ route('patient.book.store', $service->id) }}" method="POST" class="p-8 space-y-5">
                    @csrf
                    <input type="hidden" name="service_id" value="{{ $service->id }}">

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Appointment Date</label>
                        <input type="date" name="date" min="{{ date('Y-m-d') }}" value="{{ old('date') }}" required
                               class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3.5 py-2.5">
                        @error('date') <p class="text-red-600 text-xs mt-1.5">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Appointment Time</label>
                        <input type="time" name="time" value="{{ old('time') }}" required
                               class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3.5 py-2.5">
                        @error('time') <p class="text-red-600 text-xs mt-1.5">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Notes (Optional)</label>
                        <textarea name="notes" rows="3"
                                  class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3.5 py-2.5">{{ old('notes') }}</textarea>
                        @error('notes') <p class="text-red-600 text-xs mt-1.5">{{ $message }}</p> @enderror
                    </div>

                    <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button type="submit"
                                class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition">
                            Confirm Booking
                        </button>
                        <a href="{{ route('patient.services.index') }}" class="text-sm font-medium text-slate-500 hover:text-slate-800">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        
@endsection
