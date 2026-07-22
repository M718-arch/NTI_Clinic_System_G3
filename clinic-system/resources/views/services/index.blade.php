<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Available Services') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">

            @if($services->isEmpty())
                <div class="bg-white p-6 rounded shadow">
                    No services available.
                </div>
            @else
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($services as $service)
                        <div class="bg-white p-6 rounded shadow">
                            <h3 class="text-lg font-bold">
                                {{ $service->name }}
                            </h3>

                            <p class="mt-2">
                                {{ $service->description }}
                            </p>

                            <p class="mt-2">
                                <strong>Doctor:</strong>
                                {{ $service->doctor?->name ?? 'Not Assigned' }}
                            </p>

                            <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                                Book
                            </button>
                        </div>
                    @endforeach
                </div>
            @endif

        </div>
    </div>
</x-app-layout>