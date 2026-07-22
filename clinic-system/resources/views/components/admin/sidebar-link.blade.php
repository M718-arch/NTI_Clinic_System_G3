@props([
    'href',
    'route',
])

@php
    $active = request()->routeIs($route);
@endphp

<a href="{{ $href }}"
    {{ $attributes->merge([
        'class' => 'group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ' .
            ($active
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600')
    ]) }}>

    {{ $icon }}

    <span
        x-show="!collapsed"
        x-transition
        class="font-medium whitespace-nowrap">

        {{ $slot }}

    </span>

</a>
