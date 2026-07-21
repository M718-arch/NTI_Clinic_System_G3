<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">My Services</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">

            @if (session('success'))
                <div class="mb-4 p-4 bg-green-100 text-green-700 rounded">{{ session('success') }}</div>
            @endif

            <a href="{{ route('services.create') }}" class="inline-block mb-4 bg-blue-600 text-white px-4 py-2 rounded-md">
                + Add New Service
            </a>

            <div class="bg-white shadow sm:rounded-lg">
                <table class="w-full text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2">Service Name</th>
                            <th class="px-4 py-2">Description</th>
                            <th class="px-4 py-2">Patients Booked</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($services as $service)
                            <tr class="border-t">
                                <td class="px-4 py-2">{{ $service->name }}</td>
                                <td class="px-4 py-2">{{ $service->description }}</td>
                                <td class="px-4 py-2">{{ $service->bookings_count }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="px-4 py-2 text-gray-500">No services yet.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-app-layout>