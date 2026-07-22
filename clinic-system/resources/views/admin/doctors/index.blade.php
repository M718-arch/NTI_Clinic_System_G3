@extends('admin.layouts.app')

@section('title', 'Doctors')

@section('content')

<div
    x-data="{
        openDeleteModal: false,
        deleteUrl: '',
        doctorName: ''
    }"
    class="space-y-6">

    <x-admin.page-header
        title="Doctors"
        description="Manage all doctors in your clinic.">

        <x-slot:actions>

            <x-admin.button
                :href="route('admin.doctors.create')">

                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke-width="2"
                     stroke="currentColor"
                     class="h-5 w-5">

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15" />

                </svg>

                Add Doctor

            </x-admin.button>

        </x-slot:actions>

    </x-admin.page-header>


    <x-admin.card>

        <form method="GET">

            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">

                <x-admin.input
                    name="search"
                    placeholder="Search doctor..."
                    :value="request('search')" />

                <x-admin.select
                    name="specialization"
                    placeholder="All Specializations"
                    :options="$specializations->pluck('name','id')->toArray()"
                    :value="request('specialization')" />

                <x-admin.select
                    name="status"
                    placeholder="All Status"
                    :options="[
                        '1' => 'Active',
                        '0' => 'Inactive'
                    ]"
                    :value="request('status')" />

                <x-admin.button
                    type="submit"
                    class="w-full self-end">

                    Filter

                </x-admin.button>

            </div>

        </form>

    </x-admin.card>


    <x-admin.card class="overflow-hidden p-0">

        <x-admin.table>

            <x-admin.table-head>

                <x-admin.table-head-cell>
                    Doctor
                </x-admin.table-head-cell>

                <x-admin.table-head-cell>
                    Specialization
                </x-admin.table-head-cell>

                <x-admin.table-head-cell>
                    Experience
                </x-admin.table-head-cell>

                <x-admin.table-head-cell>
                    Fee
                </x-admin.table-head-cell>

                <x-admin.table-head-cell>
                    Status
                </x-admin.table-head-cell>

                <x-admin.table-head-cell class="text-center">
                    Actions
                </x-admin.table-head-cell>

            </x-admin.table-head>

            <x-admin.table-body>

                @forelse($doctors as $doctor)

                    <x-admin.table-row>

                        <x-admin.table-cell>

                            <div class="flex items-center gap-4">

                                <x-admin.avatar
                                    :src="$doctor->image"
                                    :name="$doctor->user->name" />

                                <div>

                                    <h3 class="font-semibold text-slate-800">

                                        {{ $doctor->user->name }}

                                    </h3>

                                    <p class="text-sm text-slate-500">

                                        {{ $doctor->user->email }}

                                    </p>

                                </div>

                            </div>

                        </x-admin.table-cell>


                        <x-admin.table-cell>

                            {{ $doctor->specialization->name }}

                        </x-admin.table-cell>


                        <x-admin.table-cell>

                            {{ $doctor->experience_years ?? 0 }} Years

                        </x-admin.table-cell>


                        <x-admin.table-cell>

                            ${{ number_format($doctor->consultation_fee ?? 0, 2) }}

                        </x-admin.table-cell>


                        <x-admin.table-cell>

                            <x-admin.badge
                                :variant="$doctor->status ? 'success' : 'danger'">

                                {{ $doctor->status ? 'Active' : 'Inactive' }}

                            </x-admin.badge>

                        </x-admin.table-cell>


                        <x-admin.table-cell>

                            <div class="flex justify-center gap-2">

                                <x-admin.button
                                    :href="route('admin.doctors.edit', $doctor)"
                                    variant="secondary">

                                    Edit

                                </x-admin.button>

                                <button
                                    type="button"
                                    @click="
                                        deleteUrl='{{ route('admin.doctors.destroy', $doctor) }}';
                                        doctorName='{{ addslashes($doctor->user->name) }}';
                                        openDeleteModal=true;
                                    "
                                    class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50">

                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke-width="2"
                                         stroke="currentColor"
                                         class="h-5 w-5">

                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M6 7.5h12m-9.75 0V6a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0114.25 6v1.5M9 10.5v6m6-6v6M5.25 7.5h13.5l-.75 12A2.25 2.25 0 0116.5 21H7.5a2.25 2.25 0 01-2.25-2.25l-.75-12Z"/>

                                    </svg>

                                </button>

                            </div>

                        </x-admin.table-cell>

                    </x-admin.table-row>

                @empty

                    <x-admin.table-row>

                        <x-admin.table-cell
                            colspan="6"
                            class="py-16 text-center">

                            <div class="flex flex-col items-center">

                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     stroke-width="1.5"
                                     stroke="currentColor"
                                     class="mb-4 h-14 w-14 text-slate-300">

                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19.5 21V5.25A2.25 2.25 0 0017.25 3H6.75A2.25 2.25 0 004.5 5.25V21m15 0H4.5"/>

                                </svg>

                                <h3 class="text-lg font-semibold text-slate-700">

                                    No Doctors Found

                                </h3>

                                <p class="mt-1 text-sm text-slate-500">

                                    Try changing your filters or add a new doctor.

                                </p>

                            </div>

                        </x-admin.table-cell>

                    </x-admin.table-row>

                @endforelse

            </x-admin.table-body>

        </x-admin.table>

    </x-admin.card>
        <div class="flex items-center justify-between">

        <p class="text-sm text-slate-500">

            Showing
            <span class="font-semibold">{{ $doctors->firstItem() ?? 0 }}</span>
            -
            <span class="font-semibold">{{ $doctors->lastItem() ?? 0 }}</span>

            of

            <span class="font-semibold">{{ $doctors->total() }}</span>

            doctors

        </p>

        {{ $doctors->links() }}

    </div>


    <!-- Delete Modal -->

    <div
        x-cloak
        x-show="openDeleteModal"
        x-transition.opacity
        @keydown.escape.window="openDeleteModal = false"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

        <div
            @click.away="openDeleteModal = false"
            x-transition
            class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div class="flex items-start gap-4">

                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">

                    <svg xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke-width="2"
                         stroke="currentColor"
                         class="h-6 w-6 text-red-600">

                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0"/>

                    </svg>

                </div>

                <div class="flex-1">

                    <h3 class="text-lg font-semibold text-slate-800">

                        Delete Doctor

                    </h3>

                    <p class="mt-2 text-sm leading-6 text-slate-500">

                        Are you sure you want to delete

                        <span
                            class="font-semibold text-slate-700"
                            x-text="doctorName">
                        </span>

                        ?

                        <br>

                        This action cannot be undone.

                    </p>

                </div>

            </div>

            <div class="mt-8 flex justify-end gap-3">

                <button
                    type="button"
                    @click="openDeleteModal = false"
                    class="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100">

                    Cancel

                </button>

                <form
                    :action="deleteUrl"
                    method="POST">

                    @csrf
                    @method('DELETE')

                    <button
                        type="submit"
                        class="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700">

                        Delete

                    </button>

                </form>

            </div>

        </div>

    </div>

</div>

@endsection
