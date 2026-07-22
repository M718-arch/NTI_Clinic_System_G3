@extends('admin.layouts.app')

@section('title','Dashboard')

@section('content')

<div class="space-y-6">

    <x-admin.page-header
        title="Dashboard"
        description="Welcome back, manage your clinic from one place." />

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <x-admin.stat-card
            title="Total Doctors"
            :value="$totalDoctors" />

        <x-admin.stat-card
            title="Total Patients"
            :value="$totalPatients" />

        <x-admin.stat-card
            title="Active Doctors"
            :value="$activeDoctors" />

        <x-admin.stat-card
            title="Active Patients"
            :value="$activePatients" />

    </div>
        <div class="grid gap-6 xl:grid-cols-2">

        <!-- Latest Doctors -->

        <x-admin.card>

            <div class="mb-5 flex items-center justify-between">

                <h2 class="text-lg font-semibold text-slate-800">

                    Latest Doctors

                </h2>

                <a
                    href="{{ route('admin.doctors.index') }}"
                    class="text-sm font-medium text-blue-600 hover:text-blue-700">

                    View All

                </a>

            </div>

            <div class="space-y-4">

                @forelse($latestDoctors as $doctor)

                    <div class="flex items-center justify-between">

                        <div class="flex items-center gap-3">

                            <x-admin.avatar
                                :src="$doctor->image"
                                :name="$doctor->user->name" />

                            <div>

                                <p class="font-medium text-slate-800">

                                    {{ $doctor->user->name }}

                                </p>

                                <p class="text-sm text-slate-500">

                                    {{ $doctor->specialization->name }}

                                </p>

                            </div>

                        </div>

                        <x-admin.badge
                            :variant="$doctor->status ? 'success' : 'danger'">

                            {{ $doctor->status ? 'Active' : 'Inactive' }}

                        </x-admin.badge>

                    </div>

                @empty

                    <p class="text-center text-slate-500">

                        No doctors found.

                    </p>

                @endforelse

            </div>

        </x-admin.card>

        <!-- Latest Patients -->

        <x-admin.card>

            <div class="mb-5 flex items-center justify-between">

                <h2 class="text-lg font-semibold text-slate-800">

                    Latest Patients

                </h2>

                <a
                    href="{{ route('admin.patients.index') }}"
                    class="text-sm font-medium text-blue-600 hover:text-blue-700">

                    View All

                </a>

            </div>

            <div class="space-y-4">

                @forelse($latestPatients as $patient)

                    <div class="flex items-center justify-between">

                        <div class="flex items-center gap-3">

                            <x-admin.avatar
                                :name="$patient->user->name" />

                            <div>

                                <p class="font-medium text-slate-800">

                                    {{ $patient->user->name }}

                                </p>

                                <p class="text-sm text-slate-500">

                                    {{ ucfirst($patient->gender) }}

                                </p>

                            </div>

                        </div>

                        <x-admin.badge
                            :variant="$patient->status ? 'success' : 'danger'">

                            {{ $patient->status ? 'Active' : 'Inactive' }}

                        </x-admin.badge>

                    </div>

                @empty

                    <p class="text-center text-slate-500">

                        No patients found.

                    </p>

                @endforelse

            </div>

        </x-admin.card>

    </div>
        <x-admin.card>

        <h2 class="mb-6 text-lg font-semibold text-slate-800">

            System Overview

        </h2>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <div>

                <p class="text-sm text-slate-500">

                    Total Doctors

                </p>

                <h3 class="mt-2 text-2xl font-bold">

                    {{ $totalDoctors }}

                </h3>

            </div>

            <div>

                <p class="text-sm text-slate-500">

                    Total Patients

                </p>

                <h3 class="mt-2 text-2xl font-bold">

                    {{ $totalPatients }}

                </h3>

            </div>

            <div>

                <p class="text-sm text-slate-500">

                    Active Doctors

                </p>

                <h3 class="mt-2 text-2xl font-bold text-green-600">

                    {{ $activeDoctors }}

                </h3>

            </div>

            <div>

                <p class="text-sm text-slate-500">

                    Active Patients

                </p>

                <h3 class="mt-2 text-2xl font-bold text-green-600">

                    {{ $activePatients }}

                </h3>

            </div>

        </div>

    </x-admin.card>

</div>

@endsection
