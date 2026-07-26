<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $acceptedBookings = Booking::where('status', 'accepted')->count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();

        $totalDoctors = Doctor::count();
        $totalPatients = Patient::count();
        $totalServices = Service::count();

        // Bookings created per month for the last 6 months (driver-agnostic, computed in PHP)
        $months = collect(range(5, 0))->map(function ($i) {
            return Carbon::now()->subMonths($i)->startOfMonth();
        });

        $bookingsPerMonth = $months->map(function (Carbon $month) {
            return Booking::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
        });

        $monthLabels = $months->map(fn (Carbon $month) => $month->format('M Y'));

        // Top 5 doctors by number of bookings on their services
        $topDoctors = Doctor::with(['user', 'specialization'])
            ->get()
            ->map(function ($doctor) {
                $doctor->bookings_total = Booking::whereHas('service', function ($q) use ($doctor) {
                    $q->where('doctor_id', $doctor->user_id);
                })->count();
                return $doctor;
            })
            ->sortByDesc('bookings_total')
            ->take(5)
            ->values();

        // Most booked services
        $topServices = Service::with('doctor')
            ->withCount('bookings')
            ->orderByDesc('bookings_count')
            ->take(5)
            ->get();

        return view('admin.reports.index', compact(
            'totalBookings',
            'pendingBookings',
            'acceptedBookings',
            'cancelledBookings',
            'totalDoctors',
            'totalPatients',
            'totalServices',
            'monthLabels',
            'bookingsPerMonth',
            'topDoctors',
            'topServices'
        ));
    }
}
