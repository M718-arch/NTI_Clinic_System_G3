@props([
    'label' => null,
    'name',
    'type' => 'text',
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
        name="{{ $name }}"
        type="{{ $type }}"
        value="{{ old($name, $attributes->get('value')) }}"

        {{ $attributes->except('value')->merge([
            'class' => 'w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        ]) }}>

    @error($name)

        <p class="text-sm text-red-600">

            {{ $message }}

        </p>

    @enderror

</div>
