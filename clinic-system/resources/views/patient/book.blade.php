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

<<<<<<< Updated upstream
=======
    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
>>>>>>> Stashed changes


            <div class="grid gap-6 md:grid-cols-5">
                <!-- Form Column -->
                <div class="md:col-span-3">
                    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="px-6 pt-6 pb-4 border-b border-slate-100">
                            <h3 class="font-semibold text-slate-800">Appointment Details</h3>
                            <p class="text-sm text-slate-500 mt-0.5">Fill in the details to book your appointment</p>
                        </div>

                        <form action="{{ route('patient.book.store', $service->id) }}" method="POST" class="p-6 space-y-5">
                            @csrf
                            <input type="hidden" name="service_id" value="{{ $service->id }}">

                            <!-- Date -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                                    Appointment Date <span class="text-red-500">*</span>
                                </label>
                                <input type="date" 
                                       name="date" 
                                       min="{{ date('Y-m-d') }}" 
                                       value="{{ old('date') }}" 
                                       required
                                       class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3.5 py-2.5">
                                @error('date') 
                                    <p class="text-red-600 text-xs mt-1.5">{{ $message }}</p> 
                                @enderror
                            </div>

                            <!-- Time -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                                    Appointment Time <span class="text-red-500">*</span>
                                </label>
                                <select name="time" 
                                        required
                                        class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3.5 py-2.5">
                                    <option value="">Select time...</option>
                                    @foreach(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'] as $time)
                                        <option value="{{ $time }}" {{ old('time') == $time ? 'selected' : '' }}>
                                            {{ \Carbon\Carbon::createFromFormat('H:i', $time)->format('g:i A') }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('time') 
                                    <p class="text-red-600 text-xs mt-1.5">{{ $message }}</p> 
                                @enderror
                            </div>

                            <!-- Notes -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                                    Additional Notes <span class="text-slate-400 text-xs">(Optional)</span>
                                </label>
                                <textarea name="notes" 
                                          rows="3"
                                          placeholder="Any specific concerns or special requirements..."
                                          class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3.5 py-2.5">{{ old('notes') }}</textarea>
                                @error('notes') 
                                    <p class="text-red-600 text-xs mt-1.5">{{ $message }}</p> 
                                @enderror
                            </div>

                            <!-- Actions -->
                            <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <button type="submit"
                                        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm transition">
                                    Confirm Booking
                                </button>
                                <a href="{{ route('patient.services.index') }}" 
                                   class="text-sm font-medium text-slate-500 hover:text-slate-800 transition">
                                    Cancel
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
<<<<<<< Updated upstream
                <form action="{{ route('patient.book.store', $service) }}" method="POST" class="p-8 space-y-5">
                    @csrf
=======

                <!-- Summary Column -->
                <div class="md:col-span-2">
                    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
                        <div class="px-6 pt-6 pb-4 border-b border-slate-100">
                            <h3 class="font-semibold text-slate-800">Service Summary</h3>
                        </div>
                        <div class="p-6 space-y-4">
                            <!-- Service Info -->
                            <div>
                                <h4 class="font-semibold text-slate-800">{{ $service->name }}</h4>
                                <p class="text-sm text-slate-500 mt-1">{{ $service->description }}</p>
                            </div>
>>>>>>> Stashed changes

                            <!-- Doctor -->
                            <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {{ strtoupper(substr($service->doctor->name ?? 'S', 0, 1)) }}
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-slate-800">Dr. {{ $service->doctor->name ?? 'Specialist' }}</p>
                                    <p class="text-xs text-slate-500">{{ $service->doctor->specialty ?? 'General' }}</p>
                                </div>
                            </div>

                            <!-- Details -->
                            <div class="pt-3 border-t border-slate-100 space-y-2">
                                @if(isset($service->duration))
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500">Duration</span>
                                        <span class="font-medium text-slate-800">{{ $service->duration }} minutes</span>
                                    </div>
                                @endif
                                @if(isset($service->fee))
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500">Fee</span>
                                        <span class="font-bold text-slate-800">${{ number_format($service->fee, 2) }}</span>
                                    </div>
                                @endif
                            </div>

                            <!-- Booking Tips -->
                            <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p class="text-xs font-medium text-blue-800 flex items-center gap-1.5">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Booking Tips
                                </p>
                                <ul class="text-xs text-blue-700 space-y-1 mt-1.5">
                                    <li>• Please arrive 10 minutes before your appointment</li>
                                    <li>• Bring any relevant medical documents</li>
                                    <li>• You can reschedule 24 hours in advance</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

<<<<<<< Updated upstream
@endsection
=======
        </div>
    </div>
</x-app-layout>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Set minimum date to today
        const dateInput = document.querySelector('input[name="date"]');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // Auto-update summary with selected date/time
        const datePicker = document.querySelector('input[name="date"]');
        const timePicker = document.querySelector('select[name="time"]');
        const summarySection = document.querySelector('.summary-section');

        if (datePicker && timePicker) {
            function updateSummary() {
                const date = datePicker.value ? new Date(datePicker.value).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'Not selected';
                
                const time = timePicker.options[timePicker.selectedIndex]?.text || 'Not selected';
                
                const summary = document.getElementById('bookingSummary');
                if (summary) {
                    summary.innerHTML = `
                        <div class="flex justify-between text-sm pt-2 border-t border-slate-100">
                            <span class="text-slate-500">Date</span>
                            <span class="font-medium text-slate-800">${date}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">Time</span>
                            <span class="font-medium text-slate-800">${time}</span>
                        </div>
                    `;
                }
            }

            datePicker.addEventListener('change', updateSummary);
            timePicker.addEventListener('change', updateSummary);
        }
    });
</script>
@endpush
>>>>>>> Stashed changes
