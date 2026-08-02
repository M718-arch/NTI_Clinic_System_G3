<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    /**
     * Get patient profile data
     */
    public function profile(Request $request)
    {
        $user = Auth::user();
        $patient = Patient::where('user_id', $user->id)->first();

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? null,
            'date_of_birth' => $patient->date_of_birth ?? null,
            'gender' => $patient->gender ?? null,
            'blood_group' => $patient->blood_group ?? null,
            'address' => $patient->address ?? null,
            'emergency_contact_name' => $patient->emergency_contact_name ?? null,
            'emergency_contact_phone' => $patient->emergency_contact_phone ?? null,
            'medical_history' => $patient->medical_history ?? null,
        ]);
    }

    /**
     * Get patient health metrics
     */
    public function healthMetrics(Request $request)
    {
        // In a real app, this would come from a health_metrics table
        // For now, return sample data
        return response()->json([
            'bloodPressure' => '120/80',
            'heartRate' => '72 bpm',
            'weight' => '72 kg',
            'bmi' => '22.5',
            'lastCheckup' => now()->subDays(30)->format('Y-m-d'),
        ]);
    }

    /**
     * Get recent patient activity
     */
    public function recentActivity(Request $request)
    {
        $patient = Patient::where('user_id', Auth::id())->first();
        
        if (!$patient) {
            return response()->json([]);
        }

        $bookings = Booking::where('patient_id', $patient->id)
            ->with(['service'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $activities = $bookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'action' => $this->getActivityAction($booking),
                'date' => $booking->created_at->format('Y-m-d'),
                'time' => $booking->created_at->format('h:i A'),
                'status' => $booking->status,
            ];
        });

        return response()->json($activities);
    }

    /**
     * Get patient notifications
     */
    public function notifications(Request $request)
    {
        // In a real app, this would come from a notifications table
        // For now, return sample data
        return response()->json([
            [
                'id' => 1,
                'message' => 'Your appointment with Dr. Smith is confirmed for tomorrow at 10:00 AM',
                'time' => '2 hours ago',
                'read' => false,
                'type' => 'appointment'
            ],
            [
                'id' => 2,
                'message' => 'New health tips available in your dashboard',
                'time' => '1 day ago',
                'read' => true,
                'type' => 'health'
            ],
            [
                'id' => 3,
                'message' => 'Lab results are ready for review',
                'time' => '2 days ago',
                'read' => true,
                'type' => 'lab'
            ],
            [
                'id' => 4,
                'message' => 'Reminder: Annual checkup due in 2 weeks',
                'time' => '3 days ago',
                'read' => true,
                'type' => 'reminder'
            ],
        ]);
    }

    /**
     * Helper method to generate activity action text
     */
    private function getActivityAction($booking)
    {
        $actions = [
            'pending' => 'Booked appointment for ' . ($booking->service->name ?? 'service'),
            'confirmed' => 'Appointment confirmed for ' . ($booking->service->name ?? 'service'),
            'completed' => 'Completed ' . ($booking->service->name ?? 'service'),
            'cancelled' => 'Cancelled ' . ($booking->service->name ?? 'service'),
        ];

        return $actions[$booking->status] ?? 'Updated appointment';
    }
}