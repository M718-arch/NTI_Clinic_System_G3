@props([
    'title',
    'value',
    'icon' => null,
])

<div class="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">

    <div class="flex items-center justify-between">

        <div>

            <p class="text-sm text-slate-500">
                {{ $title }}
            </p>

            <h2 class="mt-2 text-3xl font-bold text-slate-800">
                {{ $value }}
            </h2>

        </div>

        @if($icon)

            <div class="rounded-xl bg-blue-100 p-3 text-blue-600">

                {{ $icon }}

            </div>

        @endif

    </div>

</div>
