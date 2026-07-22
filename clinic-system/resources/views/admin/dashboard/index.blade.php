@extends('admin.layouts.app')

@section('title', 'Dashboard')

@section('content')

<x-admin.page-header
    title="Dashboard"
    description="Welcome back, {{ auth()->user()->name }} 👋">
</x-admin.page-header>

@endsection
<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

    <x-admin.card>

        <div class="flex items-center justify-between">

            <div>

                <p class="text-sm text-slate-500">
                    Doctors
                </p>

                <h2 class="mt-2 text-3xl font-bold text-slate-800">
                    {{ $doctorsCount ?? 0 }}
                </h2>

            </div>

            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">

                <!-- Heroicon -->

            </div>

        </div>

    </x-admin.card>

    <x-admin.card>

        <div class="flex items-center justify-between">

            <div>

                <p class="text-sm text-slate-500">
                    Patients
                </p>

                <h2 class="mt-2 text-3xl font-bold text-slate-800">
                    {{ $patientsCount ?? 0 }}
                </h2>

            </div>

            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">

            </div>

        </div>

    </x-admin.card>

    <x-admin.card>

        <div class="flex items-center justify-between">

            <div>

                <p class="text-sm text-slate-500">
                    Appointments
                </p>

                <h2 class="mt-2 text-3xl font-bold text-slate-800">
                    {{ $appointmentsCount ?? 0 }}
                </h2>

            </div>

            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">

            </div>

        </div>

    </x-admin.card>

    <x-admin.card>

        <div class="flex items-center justify-between">

            <div>

                <p class="text-sm text-slate-500">
                    Revenue
                </p>

                <h2 class="mt-2 text-3xl font-bold text-slate-800">
                    ${{ $revenue ?? 0 }}
                </h2>

            </div>

            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">

            </div>

        </div>

    </x-admin.card>

</div>
