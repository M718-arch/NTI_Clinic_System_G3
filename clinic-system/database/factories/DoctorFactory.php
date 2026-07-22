<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Specialization;
use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state([
                'role' => 'doctor',
            ]),

            'specialization_id' => Specialization::inRandomOrder()->value('id'),

            'gender' => fake()->randomElement(['male', 'female']),

            'date_of_birth' => fake()->dateTimeBetween('-55 years', '-28 years'),

            'experience_years' => fake()->numberBetween(2, 25),

            'consultation_fee' => fake()->numberBetween(200, 1000),

            'address' => fake()->address(),

            'bio' => fake()->paragraph(),

            'image' => null,

            'status' => fake()->boolean(),
        ];
    }
}
