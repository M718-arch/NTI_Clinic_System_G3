
@extends('admin.layouts.app')

@section('title', 'Book Appointment')

@section('content')

<div class="max-w-xl mx-auto space-y-6">

    <x-admin.page-header
        title="Book Service: {{ $service->name }}"
        description="{{ $service->description }}" />

    <x-admin.card>
        <form action="{{ route('patient.book.store', $service->id) }}" method="POST">
            @csrf

            <input type="hidden" name="service_id" value="{{ $service->id }}">

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Appointment Date</label>
                    <input type="date" name="date" min="{{ date('Y-m-d') }}" value="{{ old('date') }}" required
                        class="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    @error('date')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Appointment Time</label>
                    <input type="time" name="time" value="{{ old('time') }}" required
                        class="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    @error('time')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                    <textarea name="notes" rows="3"
                        class="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">{{ old('notes') }}</textarea>
                    @error('notes')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
                <x-admin.button type="submit">
                    Confirm Booking
                </x-admin.button>
            </div>
        </form>
    </x-admin.card>

</div>

@endsection