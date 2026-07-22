<?php

namespace Database\Factories;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Specialization;
/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */


public function definition(): array
{
    return [

        'specialization_id' => Specialization::inRandomOrder()->value('id'),

        'first_name' => fake()->firstName(),

        'last_name' => fake()->lastName(),

        'email' => fake()->unique()->safeEmail(),

        'phone' => fake()->unique()->numerify('010########'),

        'gender' => fake()->randomElement(['male', 'female']),

        'date_of_birth' => fake()->dateTimeBetween('-60 years', '-28 years'),

        'experience_years' => fake()->numberBetween(1, 25),

        'consultation_fee' => fake()->numberBetween(200, 1000),

        'address' => fake()->address(),

        'bio' => fake()->paragraph(),

        'image' => null,

        'status' => fake()->boolean(90)

    ];
}
}
