@props([
    'label' => null,
    'name',
    'rows' => 4,
])

<div class="space-y-2">

    @if($label)
        <label
            for="{{ $name }}"
            class="block text-sm font-medium text-slate-700">

            {{ $label }}

        </label>
    @endif

    <textarea
        id="{{ $name }}"
        name="{{ $name }}"
        rows="{{ $rows }}"
        {{ $attributes->merge([
            'class' => 'w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        ]) }}>{{ old($name, $slot->isEmpty() ? '' : trim($slot)) }}</textarea>

    @error($name)
        <p class="text-sm text-red-600">
            {{ $message }}
        </p>
    @enderror

</div>
