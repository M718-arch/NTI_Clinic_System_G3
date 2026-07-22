@props([
    'type' => 'button',
    'variant' => 'primary',
    'href' => null,
])

@php
    $classes = match ($variant) {
        'primary' => 'bg-blue-600 hover:bg-blue-700 text-white',
        'secondary' => 'bg-slate-200 hover:bg-slate-300 text-slate-700',
        'success' => 'bg-green-600 hover:bg-green-700 text-white',
        'danger' => 'bg-red-600 hover:bg-red-700 text-white',
        'warning' => 'bg-yellow-500 hover:bg-yellow-600 text-white',
        default => 'bg-blue-600 hover:bg-blue-700 text-white',
    };

    $baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium transition duration-200 {$classes}";
@endphp

@if($href)

    <a
        href="{{ $href }}"
        {{ $attributes->merge([
            'class' => $baseClasses
        ]) }}>

        {{ $slot }}

    </a>

@else

    <button
        type="{{ $type }}"
        {{ $attributes->merge([
            'class' => $baseClasses
        ]) }}>

        {{ $slot }}

    </button>

@endif
