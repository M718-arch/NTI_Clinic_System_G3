@extends(
    auth()->user()->role === 'admin'
        ? 'admin.layouts.app'
        : (auth()->user()->role === 'doctor'
            ? 'doctor.layouts.app'
            : 'patient.layouts.app')
)

@section('title', 'My Profile')

@section('content')

<div class="space-y-6">

    <x-doctor.page-header
        title="My Profile"
        description="View and manage Your Account Details." />

    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">
            {{ session('success') }}
        </div>
    @endif


        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.update-profile-information-form')
                </div>
            </div>

            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.update-password-form')
                </div>
            </div>

            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <div class="max-w-xl">
                    @include('profile.partials.delete-user-form')
                </div>
            </div>
        </div>

@endsection
