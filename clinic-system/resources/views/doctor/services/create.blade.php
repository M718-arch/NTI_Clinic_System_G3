@extends('admin.layouts.app')

@section('title', 'Add Service')

@section('content')

<x-admin.page-header
    title="Add New Service"
    description="Create a medical service for patients to book." />

<x-admin.card>

    <form action="{{ route('doctor.services.store') }}" method="POST">
        @csrf

        <div class="space-y-5">
            <x-admin.input
                label="Service Name"
                name="name"
                required />

            <x-admin.textarea
                label="Description"
                name="description"
                rows="4"
                required />
        </div>

        <div class="mt-8 flex justify-end gap-3">
            <x-admin.button type="submit">
                Save Service
            </x-admin.button>
        </div>

    </form>

</x-admin.card>

@endsection