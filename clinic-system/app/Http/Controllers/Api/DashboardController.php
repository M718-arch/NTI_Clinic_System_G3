<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'total' => 0,
                    'pending' => 0,
                    'confirmed' => 0,
                    'completed' => 0,
                ]);
            }

            $role = $user->role;

            switch ($role) {
                case 'doctor':
                    return $this->doctorStats($user);
                case 'patient':
                    return $this->patientStats($user);
                case 'admin':
                    return $this->adminStats();
                default:
                    return response()->json([
                        'total' => 0,
                        'pending' => 0,
                        'confirmed' => 0,
                        'completed' => 0,
                    ]);
            }
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'total' => 0,
                'pending' => 0,
                'confirmed' => 0,
                'completed' => 0,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function doctorStats($user)
    {
        $doctor = $user->doctor;
        
        if (!$doctor) {
            return response()->json([
                'total_services' => 0,
                'total_bookings' => 0,
                'pending_bookings' => 0,
                'completed_bookings' => 0,
                'upcoming_bookings' => 0,
            ]);
        }

        $bookings = Booking::whereHas('service', function ($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        });

        return response()->json([
            'total_services' => Service::where('doctor_id', $doctor->id)->count(),
            'total_bookings' => $bookings->count(),
            'pending_bookings' => (clone $bookings)->where('status', 'pending')->count(),
            'completed_bookings' => (clone $bookings)->where('status', 'completed')->count(),
            'upcoming_bookings' => (clone $bookings)
                ->where('date', '>=', now()->toDateString())
                ->whereIn('status', ['pending', 'confirmed'])
                ->count(),
        ]);
    }

    private function patientStats($user)
    {
        $patient = Patient::where('user_id', $user->id)->first();
        
        if (!$patient) {
            return response()->json([
                'total' => 0,
                'pending' => 0,
                'confirmed' => 0,
                'completed' => 0,
            ]);
        }

        $bookings = Booking::where('patient_id', $patient->id);

        return response()->json([
            'total' => $bookings->count(),
            'pending' => (clone $bookings)->where('status', 'pending')->count(),
            'confirmed' => (clone $bookings)->where('status', 'confirmed')->count(),
            'completed' => (clone $bookings)->where('status', 'completed')->count(),
        ]);
    }

    private function adminStats()
    {
        return response()->json([
            'total_doctors' => Doctor::count(),
            'total_patients' => Patient::count(),
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'confirmed_bookings' => Booking::where('status', 'confirmed')->count(),
            'completed_bookings' => Booking::where('status', 'completed')->count(),
        ]);
    }
}