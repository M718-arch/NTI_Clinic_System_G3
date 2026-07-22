<div class="grid grid-cols-2 gap-8">

    <!-- Left Column -->
    <div class="space-y-5">

        <x-admin.input
            label="Full Name"
            name="name"
            :value="$doctor->user->name ?? ''"
            required />

        <x-admin.input
            label="Email"
            name="email"
            type="email"
            :value="$doctor->user->email ?? ''"
            required />

        <x-admin.input
            label="Phone"
            name="phone"
            :value="$doctor->user->phone ?? ''"
            required />

        <x-admin.input
            label="Password"
            name="password"
            type="password"
            :placeholder="isset($doctor) ? 'Leave blank to keep current password' : null"
            :required="!isset($doctor)"
            />

        <x-admin.input
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            :required="!isset($doctor)"
            />

    </div>

    <!-- Right Column -->
    <div class="space-y-5">

        <x-admin.select
            label="Specialization"
            name="specialization_id"
            :options="$specializations"
            :value="$doctor->specialization_id ?? ''"
            required />

        <x-admin.select
            label="Gender"
            name="gender"
            :options="[
                'male' => 'Male',
                'female' => 'Female'
            ]"
            :value="$doctor->gender ?? ''"
            required />

        <x-admin.input
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            :value="$doctor->date_of_birth ?? ''" />

        <x-admin.input
            label="Experience (Years)"
            name="experience_years"
            type="number"
            min="0"
            :value="$doctor->experience_years ?? ''" />

        <x-admin.input
            label="Consultation Fee"
            name="consultation_fee"
            type="number"
            step="0.01"
            min="0"
            :value="$doctor->consultation_fee ?? ''" />

        <x-admin.input
            label="Address"
            name="address"
            :value="$doctor->address ?? ''" />

    </div>

</div>

<div class="mt-8">

    <x-admin.textarea
        label="Bio"
        name="bio"
        rows="4">

        {{ old('bio', $doctor->bio ?? '') }}

    </x-admin.textarea>

</div>


<div class="mt-6">

    @if(isset($doctor) && $doctor->image)

    <div class="mb-4">

        <img
            src="{{ asset('../storage/app/public/' . $doctor->image) }}"
            alt="{{ $doctor->user->name }}"
            class="h-24 w-24 rounded-xl object-cover border">

    </div>

@endif

<x-admin.file-input
    label="Profile Image"
    name="image" />

</div>

<div class="mt-6">

    <label class="inline-flex items-center gap-3">

        <input
            type="checkbox"
            name="status"
            value="1"
            @checked(old('status', $doctor->status ?? true))
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500">

        <span class="text-sm font-medium text-slate-700">

            Active

        </span>

    </label>

</div>
