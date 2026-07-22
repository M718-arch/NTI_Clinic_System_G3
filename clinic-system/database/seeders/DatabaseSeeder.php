<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Doctor::factory(10)->create();

        Patient::factory(50)->create();
    }
}
