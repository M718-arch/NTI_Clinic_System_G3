<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">

    <x-admin.input
        label="Full Name"
        name="name"
        :value="old('name', $patient->user->name ?? '')" />

    <x-admin.input
        label="Email"
        name="email"
        type="email"
        :value="old('email', $patient->user->email ?? '')" />

    <x-admin.input
        label="Phone"
        name="phone"
        :value="old('phone', $patient->user->phone ?? '')" />

    <x-admin.select
        label="Gender"
        name="gender"
        :options="[
            'male' => 'Male',
            'female' => 'Female'
        ]"
        :value="old('gender', $patient->gender ?? '')" />

    <x-admin.input
        label="Password"
        name="password"
        type="password"
        :required="!isset($patient)" />

    <x-admin.input
        label="Confirm Password"
        name="password_confirmation"
        type="password"
        :required="!isset($patient)" />

    <x-admin.input
        label="Date of Birth"
        name="date_of_birth"
        type="date"
        :value="old('date_of_birth', isset($patient) ? optional($patient->date_of_birth)->format('Y-m-d') : '')" />

    <x-admin.select
        label="Blood Group"
        name="blood_group"
        :options="[
            'A+' => 'A+',
            'A-' => 'A-',
            'B+' => 'B+',
            'B-' => 'B-',
            'AB+' => 'AB+',
            'AB-' => 'AB-',
            'O+' => 'O+',
            'O-' => 'O-',
        ]"
        :value="old('blood_group', $patient->blood_group ?? '')" />

    <div class="lg:col-span-2">
        <x-admin.input
            label="Address"
            name="address"
            :value="old('address', $patient->address ?? '')" />
    </div>

    <x-admin.input
        label="Emergency Contact Name"
        name="emergency_contact_name"
        :value="old('emergency_contact_name', $patient->emergency_contact_name ?? '')" />

    <x-admin.input
        label="Emergency Contact Phone"
        name="emergency_contact_phone"
        :value="old('emergency_contact_phone', $patient->emergency_contact_phone ?? '')" />

    <div class="lg:col-span-2">
        <x-admin.textarea
            label="Medical History"
            name="medical_history"
            rows="5">{{ old('medical_history', $patient->medical_history ?? '') }}</x-admin.textarea>
    </div>

    <x-admin.select
        label="Status"
        name="status"
        :options="[
            1 => 'Active',
            0 => 'Inactive'
        ]"
        :value="old('status', $patient->status ?? 1)" />

</div>

<div class="mt-8 flex justify-end gap-3">

    <x-admin.button
        :href="route('admin.patients.index')"
        variant="secondary">

        Cancel

    </x-admin.button>

    <x-admin.button type="submit">

        {{ isset($patient) ? 'Update Patient' : 'Create Patient' }}

    </x-admin.button>

</div>
