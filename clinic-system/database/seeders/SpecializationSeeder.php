<?php
// database/seeders/SpecializationSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecializationSeeder extends Seeder
{
    public function run()
    {
        $specializations = [
            ['id' => 1, 'name' => 'Cardiology'],
            ['id' => 2, 'name' => 'Neurology'],
            ['id' => 3, 'name' => 'Pediatrics'],
            ['id' => 4, 'name' => 'Orthopedics'],
            ['id' => 5, 'name' => 'Dermatology'],
            ['id' => 6, 'name' => 'Ophthalmology'],
            ['id' => 7, 'name' => 'ENT'],
            ['id' => 8, 'name' => 'Urology'],
        ];

        foreach ($specializations as $spec) {
            DB::table('specializations')->updateOrInsert(
                ['id' => $spec['id']],
                [
                    'name' => $spec['name'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

        $this->command->info('✅ Specializations seeded successfully!');
    }
}