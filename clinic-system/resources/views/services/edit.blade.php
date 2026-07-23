@extends('doctor.layouts.app')

@section('title', 'Update Service')

@section('content')

   <x-doctor.page-header
    title="Update Service"
    description="Update a medical service for patients to book." />


            <div class="grid md:grid-cols-5 gap-6">

                <!-- Form card -->
                <div class="md:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

                    <div class="px-8 pt-8 pb-6 border-b border-slate-100">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-800">Service Details</h3>
                                <p class="text-xs text-slate-500">Fill in the information below</p>
                            </div>
                        </div>
                    </div>

                    <form action="{{ route('doctor.services.update', $service) }}" method="POST" class="p-8 space-y-6" x-data="{
        name: @js(old('name', $service->name)),
        description: @js(old('description', $service->description))
    }">
    @csrf
    @method('PUT')
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1.5">
                                Service Name <span class="text-red-500">*</span>
                            </label>
                            <input
    type="text"
    name="name"
    x-model="name"
    value="{{ old('name', $service->name) }}"
    class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-sm px-3.5 py-2.5 transition"
    placeholder="e.g. General Checkup"
    required>
                            @error('name')
                                <p class="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="block text-sm font-medium text-slate-700">Description</label>
                                <span class="text-xs text-slate-400" x-text="description.length + ' / 300'"></span>
                            </div>
                            <textarea name="description" x-model="description" maxlength="300" rows="5"
                                      class="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-sm px-3.5 py-2.5 transition resize-none"
                                      placeholder="Briefly describe what this service involves, what patients should expect, and any preparation needed...">{{ old('description') }}</textarea>
                            <p class="text-xs text-slate-400 mt-1.5">This will be shown to patients browsing available services.</p>
                        </div>

                        <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <button type="submit"
                                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition">

                                Update Service
                            </button>
                            <a href="{{ route('doctor.dashboard') }}" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>

                <!-- Live preview card -->
                <div class="md:col-span-2" x-data="{ name: '', description: '' }">
                    <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Preview</p>
                    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 sticky top-6">
                        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 class="font-semibold text-slate-800 text-sm" x-text="name || 'Your service name'" :class="!name && 'text-slate-300'"></h4>
                        <p class="text-xs text-slate-500 mt-1.5 leading-relaxed" x-text="description || 'Description will appear here as you type...'" :class="!description && 'text-slate-300'"></p>
                        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-xs text-slate-400">Patients booked</span>
                            <span class="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full bg-slate-50 text-slate-400 text-xs font-semibold">0</span>
                        </div>
                    </div>
                </div>

            </div>

@endsection
