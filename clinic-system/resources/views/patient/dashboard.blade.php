<x-app-layout>
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
</x-app-layout>