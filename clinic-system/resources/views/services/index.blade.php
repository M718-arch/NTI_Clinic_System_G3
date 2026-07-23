<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Available Medical Services</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">

            @if (session('success'))
                <div class="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
                    {{ session('success') }}
                </div>
            @endif

            <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                @forelse($services as $service)
                    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition">
                        <div>
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <h3 class="font-semibold text-slate-800">{{ $service->name }}</h3>
                                <span class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">
                                    Dr. {{ $service->doctor->name ?? 'Specialist' }}
                                </span>
                            </div>
                            <p class="text-sm text-slate-500">{{ $service->description ?: 'No description provided.' }}</p>
                        </div>

                        <div class="pt-4 mt-4 border-t border-slate-100">
                            <a href="{{ route('patient.book.create', $service->id) }}"
                               class="inline-flex items-center justify-center w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
                                Book Appointment
                            </a>
                        </div>
                    </div>
                @empty
                    <div class="col-span-full bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400">
                        No medical services available at the moment.
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</x-app-layout>