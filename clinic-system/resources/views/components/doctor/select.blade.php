@props([
    'label' => null,
    'name',
    'options' => [],
    'placeholder' => 'Select an option',
])

<div class="space-y-2">

    @if($label)

        <label
            for="{{ $name }}"
            class="block text-sm font-medium text-slate-700">

            {{ $label }}

        </label>

    @endif

    <select
        id="{{ $name }}"
        name="{{ $name }}"

        {{ $attributes->merge([
            'class' => 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        ]) }}>

        <option value="">

            {{ $placeholder }}

        </option>

        @foreach($options as $value => $text)

            <option
                value="{{ $value }}"
                @selected(old($name, $attributes->get('value')) == $value)>

                {{ $text }}

            </option>

        @endforeach

    </select>

    @error($name)

        <p class="text-sm text-red-600">

            {{ $message }}

        </p>

    @enderror

</div>
