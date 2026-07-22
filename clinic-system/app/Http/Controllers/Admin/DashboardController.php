<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;

class DashboardController extends Controller
{
    public function index()
    {
        $totalDoctors = Doctor::count();

        $activeDoctors = Doctor::where('status', true)->count();

        $totalPatients = Patient::count();

        $activePatients = Patient::where('status', true)->count();

        $latestDoctors = Doctor::with(['user', 'specialization'])
    ->latest()
    ->take(5)
    ->get();

        $latestPatients = Patient::with('user')
            ->latest()
            ->take(5)
            ->get();

        return view('admin.dashboard', compact(
            'totalDoctors',
            'activeDoctors',
            'totalPatients',
            'activePatients',
            'latestDoctors',
            'latestPatients'
        ));
    }
}
