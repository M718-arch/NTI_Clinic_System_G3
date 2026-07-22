<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    public function definition(): array
    {
        return [

            'user_id' => User::factory()->state([
                'role' => 'patient',
            ]),

            'gender' => fake()->randomElement(['male', 'female']),

            'date_of_birth' => fake()->dateTimeBetween('-70 years', '-18 years'),

            'blood_group' => fake()->randomElement([
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            ]),

            'address' => fake()->address(),

            'emergency_contact_name' => fake()->name(),

            'emergency_contact_phone' => fake()->phoneNumber(),

            'medical_history' => fake()->optional()->paragraph(),

            'status' => fake()->boolean(90),

        ];
    }
}
