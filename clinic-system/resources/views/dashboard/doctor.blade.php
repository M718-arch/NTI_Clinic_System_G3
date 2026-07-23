<!-- <x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">My Services</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">

            @if (session('success'))
                <div class="mb-4 p-4 bg-green-100 text-green-700 rounded">{{ session('success') }}</div>
            @endif

<a href="{{ route('doctor.services.create') }}" class="inline-block mb-4 bg-blue-600 text-white px-4 py-2 rounded-md">                + Add New Service
            </a>

            <div class="bg-white shadow sm:rounded-lg">
                <table class="w-full text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2">Service Name</th>
                            <th class="px-4 py-2">Description</th>
                            <th class="px-4 py-2">Patients Booked</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($services as $service)
                            <tr class="border-t">
                                <td class="px-4 py-2">{{ $service->name }}</td>
                                <td class="px-4 py-2">{{ $service->description }}</td>
                                <td class="px-4 py-2">{{ $service->bookings_count }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="px-4 py-2 text-gray-500">No services yet.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-app-layout> -->

@extends('admin.layouts.app')

@section('title', 'My Services')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="My Services"
        description="Manage your medical services and view patient counts." />

    <div class="flex justify-end">
        <x-admin.button :href="route('doctor.services.create')">
            + Add New Service
        </x-admin.button>
    </div>

    <x-admin.card>
        <div class="space-y-4">
            @forelse ($services as $service)
                <div class="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div>
                        <h3 class="font-medium text-slate-800">{{ $service->name }}</h3>
                        <p class="text-sm text-slate-500">{{ $service->description }}</p>
                    </div>

                    <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                        Patients Booked: {{ $service->bookings_count ?? 0 }}
                    </span>
                </div>
            @empty
                <p class="text-center text-slate-500 py-6">No services yet.</p>
            @endforelse
        </div>
    </x-admin.card>

</div>

@endsection