<?php
// database/seeders/DoctorSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Doctor;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    public function run()
    {
        // Clear existing doctors for these users (optional)
        // Doctor::whereIn('user_id', [21, 22, 23, 24])->delete();

        // Doctor 1 - Dr. Samer Mohamed
        $user1 = User::updateOrCreate(
            ['email' => 'sameh@gmail.com'],
            [
                'name' => 'Dr. Samer Mohamed',
                'email' => 'sameh@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'doctor',
                'phone' => '+20123456789',
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $user1->id],
            [
                'user_id' => $user1->id,
                'first_name' => 'Samer',
                'last_name' => 'Mohamed',
                'email' => 'sameh@gmail.com',
                'phone' => '+20123456789',
                'specialization_id' => 1,
                'gender' => 'male',
                'date_of_birth' => '1980-01-15',
                'experience_years' => 15,
                'consultation_fee' => 350.00,
                'address' => 'Cairo, Egypt',
                'bio' => 'Senior Cardiologist with 15+ years of experience in treating heart diseases',
                'clinic_name' => 'Heart Care Clinic',
                'branch' => 'Main Branch',
                'operating_hours' => '{"Monday":"09:00-18:00","Tuesday":"09:00-18:00","Wednesday":"09:00-18:00","Thursday":"09:00-18:00","Sunday":"09:00-18:00"}',
                'status' => 1,
            ]
        );

        // Doctor 2 - Dr. Ahmed Hassan
        $user2 = User::updateOrCreate(
            ['email' => 'dr.ahmed@gmail.com'],
            [
                'name' => 'Dr. Ahmed Hassan',
                'email' => 'dr.ahmed@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'doctor',
                'phone' => '+20123456790',
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $user2->id],
            [
                'user_id' => $user2->id,
                'first_name' => 'Ahmed',
                'last_name' => 'Hassan',
                'email' => 'dr.ahmed@gmail.com',
                'phone' => '+20123456790',
                'specialization_id' => 2,
                'gender' => 'male',
                'date_of_birth' => '1985-03-20',
                'experience_years' => 12,
                'consultation_fee' => 400.00,
                'address' => 'Alexandria, Egypt',
                'bio' => 'Neurology Specialist focusing on stroke and neurological disorders',
                'clinic_name' => 'Neurology Center',
                'branch' => 'Alexandria Branch',
                'operating_hours' => '{"Monday":"08:00-16:00","Wednesday":"08:00-16:00","Friday":"08:00-16:00"}',
                'status' => 1,
            ]
        );

        // Doctor 3 - Dr. Fatima Al-Sayed
        $user3 = User::updateOrCreate(
            ['email' => 'dr.fatima@gmail.com'],
            [
                'name' => 'Dr. Fatima Al-Sayed',
                'email' => 'dr.fatima@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'doctor',
                'phone' => '+20123456791',
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $user3->id],
            [
                'user_id' => $user3->id,
                'first_name' => 'Fatima',
                'last_name' => 'Al-Sayed',
                'email' => 'dr.fatima@gmail.com',
                'phone' => '+20123456791',
                'specialization_id' => 3,
                'gender' => 'female',
                'date_of_birth' => '1990-07-10',
                'experience_years' => 10,
                'consultation_fee' => 250.00,
                'address' => 'Giza, Egypt',
                'bio' => 'Pediatrician dedicated to children\'s health and development',
                'clinic_name' => 'Children\'s Wellness Clinic',
                'branch' => 'Giza Branch',
                'operating_hours' => '{"Tuesday":"10:00-19:00","Thursday":"10:00-19:00","Saturday":"10:00-19:00"}',
                'status' => 1,
            ]
        );

        // Doctor 4 - Dr. Youssef Ibrahim
        $user4 = User::updateOrCreate(
            ['email' => 'dr.youssef@gmail.com'],
            [
                'name' => 'Dr. Youssef Ibrahim',
                'email' => 'dr.youssef@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'doctor',
                'phone' => '+20123456792',
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $user4->id],
            [
                'user_id' => $user4->id,
                'first_name' => 'Youssef',
                'last_name' => 'Ibrahim',
                'email' => 'dr.youssef@gmail.com',
                'phone' => '+20123456792',
                'specialization_id' => 4,
                'gender' => 'male',
                'date_of_birth' => '1978-11-25',
                'experience_years' => 18,
                'consultation_fee' => 450.00,
                'address' => 'Cairo, Egypt',
                'bio' => 'Orthopedic Surgeon specializing in joint replacement and sports injuries',
                'clinic_name' => 'Orthopedic Specialists',
                'branch' => 'Downtown Cairo',
                'operating_hours' => '{"Monday":"07:00-15:00","Tuesday":"07:00-15:00","Thursday":"07:00-15:00","Friday":"07:00-15:00"}',
                'status' => 1,
            ]
        );

        $this->command->info('✅ 4 doctors seeded successfully!');
    }
}