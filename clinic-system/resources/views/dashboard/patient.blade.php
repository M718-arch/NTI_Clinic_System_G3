<!-- @extends('admin.layouts.app')

@section('title', 'Patient Dashboard')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="Patient Dashboard"
        description="Welcome back, {{ auth()->user()->name }} 👋" />

    <div class="grid gap-6 md:grid-cols-2">

        <x-admin.card>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Browse Medical Services</h3>
            <p class="text-sm text-slate-500 mb-4">Explore available professional services and book your appointments easily.</p>
            <x-admin.button :href="route('patient.services.index')">
                Browse Services
            </x-admin.button>
        </x-admin.card>

        <x-admin.card>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">My Bookings</h3>
            <p class="text-sm text-slate-500 mb-4">View and track the status of all your booked appointments.</p>
            <x-admin.button :href="route('patient.my.bookings')" variant="secondary">
                View My Bookings
            </x-admin.button>
        </x-admin.card>

    </div>

</div>

@endsection -->
<!-- <x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Patient Dashboard</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white p-6 shadow sm:rounded-lg">
                <p class="mb-4">Welcome, {{ Auth::user()->name }}.</p>

                <div class="flex gap-4">
                    <a href="{{ route('patient.services.index') }}" class="bg-blue-600 text-white px-4 py-2 rounded-md">
                        Browse Services
                    </a>
                    <a href="{{ route('patient.my.bookings') }}" class="bg-gray-600 text-white px-4 py-2 rounded-md">
    My Bookings
</a>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> -->
@extends('admin.layouts.app')

@section('title', 'Patient Dashboard')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="Patient Dashboard"
        description="Welcome back, {{ auth()->user()->name }} 👋" />

    <div class="grid gap-6 md:grid-cols-2">

        <x-admin.card>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Browse Medical Services</h3>
            <p class="text-sm text-slate-500 mb-4">Explore available professional services and book your appointments easily.</p>
            <x-admin.button :href="route('patient.services.index')">
                Browse Services
            </x-admin.button>
        </x-admin.card>

        <x-admin.card>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">My Bookings</h3>
            <p class="text-sm text-slate-500 mb-4">View and track the status of all your booked appointments.</p>
            <x-admin.button :href="route('patient.my.bookings')" variant="secondary">
                View My Bookings
            </x-admin.button>
        </x-admin.card>

    </div>

</div>

@endsection