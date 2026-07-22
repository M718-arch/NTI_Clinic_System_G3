<?php
namespace Database\Seeders;
use App\Models\Specialization;
use Illuminate\Database\Seeder;
class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        Specialization::factory()

            ->count(8)

            ->create();
    }
}
