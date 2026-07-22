@props([
    'variant' => 'primary',
])

@php
    $classes = match ($variant) {
        'primary' => 'bg-blue-100 text-blue-700',
        'success' => 'bg-green-100 text-green-700',
        'danger' => 'bg-red-100 text-red-700',
        'warning' => 'bg-yellow-100 text-yellow-700',
        'secondary' => 'bg-slate-100 text-slate-700',
        default => 'bg-blue-100 text-blue-700',
    };
@endphp

<span
    {{ $attributes->merge([
        'class' => "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold {$classes}"
    ]) }}>

    {{ $slot }}

</span>
