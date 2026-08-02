<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Booking;
use App\Models\Service;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_doctors' => Doctor::count(),
            'total_patients' => Patient::count(),
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'recent_bookings' => Booking::with(['patient', 'service'])
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return view('admin.dashboard', compact('stats'));
    }
}