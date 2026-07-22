@props([
    'title',
    'description' => null,
])

<div class="mb-8 flex items-center justify-between">

    <div>

        <h1 class="text-3xl font-bold text-slate-800">
            {{ $title }}
        </h1>

        @if($description)

            <p class="mt-1 text-slate-500">
                {{ $description }}
            </p>

        @endif

    </div>

    <div>

        {{ $actions ?? '' }}

    </div>

</div>
