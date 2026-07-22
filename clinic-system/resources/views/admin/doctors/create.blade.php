@extends('admin.layouts.app')

@section('title', 'Add Doctor')

@section('content')

<x-admin.page-header
    title="Add Doctor"
    description="Create a new doctor account">

    <x-slot:actions>

        <x-admin.button
            :href="route('admin.doctors.index')"
            variant="secondary">

            Back

        </x-admin.button>

    </x-slot:actions>

</x-admin.page-header>

<x-admin.card>

    <form
        action="{{ route('admin.doctors.store') }}"
        method="POST"
        enctype="multipart/form-data">

        @csrf

        @include('admin.doctors._form')

        <div class="mt-8 flex justify-end gap-3">

            <x-admin.button
                :href="route('admin.doctors.index')"
                variant="secondary">

                Cancel

            </x-admin.button>

            <x-admin.button type="submit">

                Save Doctor

            </x-admin.button>

        </div>

    </form>

</x-admin.card>

@endsection
