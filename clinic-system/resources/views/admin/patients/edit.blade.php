@extends('admin.layouts.app')

@section('title', 'Edit Patient')

@section('content')

<x-admin.page-header
    title="Edit Patient"
    description="Update patient information." />

<x-admin.card>

    <form
        action="{{ route('admin.patients.update', $patient) }}"
        method="POST">

        @csrf
        @method('PUT')

        @include('admin.patients._form')

    </form>

</x-admin.card>

@endsection
