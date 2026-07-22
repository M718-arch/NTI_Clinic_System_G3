@extends('admin.layouts.app')

@section('title', 'Edit Doctor')

@section('content')

<x-admin.page-header
    title="Edit Doctor"
    description="Update doctor information">

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
    action="{{ route('admin.doctors.update', $doctor) }}"
    method="POST"
    enctype="multipart/form-data">

    @csrf
    @method('PUT')

    @include('admin.doctors._form')

    <div class="mt-8 flex justify-end gap-3">

        <x-admin.button
            :href="route('admin.doctors.index')"
            variant="secondary">

            Cancel

        </x-admin.button>

        <x-admin.button type="submit">

            Update Doctor

        </x-admin.button>

    </div>

</form>

</x-admin.card>

@endsection
