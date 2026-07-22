@props([
    'label' => null,
    'name',
])

<div class="space-y-2">

    @if($label)
        <label
            for="{{ $name }}"
            class="block text-sm font-medium text-slate-700">

            {{ $label }}

        </label>
    @endif

    <input
        id="{{ $name }}"
        type="file"
        name="{{ $name }}"
        {{ $attributes->merge([
            'class' => 'block w-full rounded-xl border border-slate-300 px-4 py-2.5 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700'
        ]) }}>

    @error($name)
        <p class="text-sm text-red-600">
            {{ $message }}
        </p>
    @enderror

</div>
