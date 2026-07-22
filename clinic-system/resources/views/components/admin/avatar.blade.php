@props([
    'src' => null,
    'name' => '',
    'size' => 'md',
])

@php
    $sizes = [
        'sm' => 'h-10 w-10 text-sm',
        'md' => 'h-12 w-12 text-base',
        'lg' => 'h-16 w-16 text-xl',
        'xl' => 'h-20 w-20 text-2xl',
    ];

    $sizeClass = $sizes[$size] ?? $sizes['md'];

    $initials = collect(explode(' ', trim($name)))
        ->filter()
        ->take(2)
        ->map(fn ($word) => mb_substr($word, 0, 1))
        ->join('');
@endphp

@if($src)

    <img
        src="{{ asset('../storage/app/public/' . $src) }}"
        alt="{{ $name }}"
        title="{{ $name }}"
        class="{{ $sizeClass }} rounded-full object-cover border border-slate-200">

@else

    <div
        title="{{ $name }}"
        class="{{ $sizeClass }} flex items-center justify-center rounded-full border border-slate-200 bg-blue-600 font-semibold uppercase text-white">

        {{ $initials }}

    </div>

@endif
