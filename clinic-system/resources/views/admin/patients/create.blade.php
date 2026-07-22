@extends('admin.layouts.app')

@section('title', 'Create Patient')

@section('content')

<x-admin.page-header
    title="Create Patient"
    description="Add a new patient to the clinic." />

<x-admin.card>

    <form
        action="{{ route('admin.patients.store') }}"
        method="POST">

        @csrf

        @include('admin.patients._form')

    </form>

</x-admin.card>

@endsection
