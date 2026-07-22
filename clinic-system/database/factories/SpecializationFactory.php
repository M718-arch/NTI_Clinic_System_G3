<?php

namespace Database\Factories;

use App\Models\Specialization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Specialization>
 */
class SpecializationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
{
    return [

        'name' => fake()->unique()->randomElement([

            'Cardiology',

            'Dentistry',

            'Neurology',

            'Orthopedics',

            'Pediatrics',

            'Dermatology',

            'Radiology',

            'ENT'

        ]),

        'description' => fake()->sentence(),

        'status' => true

    ];
}
}
