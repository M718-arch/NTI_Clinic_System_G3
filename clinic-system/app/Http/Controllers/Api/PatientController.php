<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Service;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class PatientController extends Controller
{
    /**
     * Get patient profile data
     */
    public function profile(Request $request)
    {
        $user = Auth::user();
        $patient = Patient::where('user_id', $user->id)->first();

        $photoUrl = null;
        if ($patient && $patient->photo && Storage::disk('public')->exists($patient->photo)) {
            // Use asset() to generate the correct URL with port
            $photoUrl = asset('storage/' . $patient->photo);
        }

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? null,
            'date_of_birth' => $patient->date_of_birth ?? null,
            'gender' => $patient->gender ?? null,
            'blood_group' => $patient->blood_group ?? null,
            'address' => $patient->address ?? null,
            'allergies' => $patient->allergies ?? 'None',
            'chronic_diseases' => $patient->chronic_diseases ?? 'None',
            'emergency_contact_name' => $patient->emergency_contact_name ?? null,
            'emergency_contact_phone' => $patient->emergency_contact_phone ?? null,
            'current_medications' => $patient->current_medications ?? 'None',
            'lifestyle_habits' => $patient->lifestyle_habits ?? 'None',
            'medical_history' => $patient->medical_history ?? 'None',
            'diagnoses' => $patient->diagnoses ?? 'None',
            'family_history' => $patient->family_history ?? 'None',
            'past_surgeries' => $patient->past_surgeries ?? 'None',
            'photo_url' => $photoUrl,
            'photo' => $patient->photo ?? null,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Get dashboard statistics for patient
     */
    public function dashboardStats(Request $request)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json([
                    'total' => 0,
                    'pending' => 0,
                    'confirmed' => 0,
                    'completed' => 0,
                    'cancelled' => 0,
                ]);
            }

            $bookings = Booking::where('patient_id', $patient->id);

            return response()->json([
                'total' => $bookings->count(),
                'pending' => (clone $bookings)->where('status', 'pending')->count(),
                'confirmed' => (clone $bookings)->where('status', 'confirmed')->count(),
                'completed' => (clone $bookings)->where('status', 'completed')->count(),
                'cancelled' => (clone $bookings)->where('status', 'cancelled')->count(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'total' => 0,
                'pending' => 0,
                'confirmed' => 0,
                'completed' => 0,
                'cancelled' => 0,
            ], 500);
        }
    }

    /**
     * Update patient profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $patient = Patient::where('user_id', $user->id)->first();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'blood_group' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'allergies' => 'nullable|string|max:500',
            'chronic_diseases' => 'nullable|string|max:500',
            'current_medications' => 'nullable|string|max:500',
            'lifestyle_habits' => 'nullable|string|max:500',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
            $user->save();
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
            $user->save();
        }

        if ($patient) {
            $patient->update($request->only([
                'date_of_birth', 'gender', 'blood_group', 'address',
                'emergency_contact_name', 'emergency_contact_phone',
                'allergies', 'chronic_diseases',
                'current_medications', 'lifestyle_habits'
            ]));
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $this->profile($request)->original
        ]);
    }

    /**
     * Update patient password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Upload / replace the patient's profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            ]);

            $user = Auth::user();
            $patient = Patient::where('user_id', $user->id)->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient profile not found'], 404);
            }

            // Delete old photo if exists
            if ($patient->photo) {
                Storage::disk('public')->delete($patient->photo);
            }

            // Store new photo
            $path = $request->file('photo')->store('patient-photos', 'public');

            // Update the patient record
            $patient->update(['photo' => $path]);

            // Refresh the model
            $patient->refresh();

            // Use asset() to generate the correct URL with port
            $photoUrl = asset('storage/' . $path);

            return response()->json([
                'message' => 'Photo uploaded successfully',
                'photo_url' => $photoUrl,
                'photo' => $path,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Photo upload error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error uploading photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the patient's profile photo
     */
    public function deletePhoto(Request $request)
    {
        try {
            $user = Auth::user();
            $patient = Patient::where('user_id', $user->id)->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient profile not found'], 404);
            }

            if ($patient->photo) {
                Storage::disk('public')->delete($patient->photo);
                $patient->update(['photo' => null]);
            }

            return response()->json([
                'message' => 'Profile photo removed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Photo delete error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all doctors for patients
     */
    public function getDoctors(Request $request)
    {
        try {
            \Log::info('getDoctors called');

            $doctors = Doctor::with(['user', 'specialization'])
                ->where('status', true)
                ->get();

            \Log::info('Doctors found: ' . $doctors->count());

            $formattedDoctors = $doctors->map(function($doctor) {
                // Build a full, usable image URL (or a UI Avatars fallback)
                // instead of returning the raw storage path.
                $name = $doctor->user->name ?? trim($doctor->first_name . ' ' . $doctor->last_name);

                if ($doctor->image) {
                    $imageUrl = asset('storage/' . $doctor->image);
                } else {
                    $imageUrl = 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=random&size=128&bold=true';
                }

                return [
                    'id' => $doctor->id,
                    'user_id' => $doctor->user_id,
                    'name' => $name,
                    'first_name' => $doctor->first_name,
                    'last_name' => $doctor->last_name,
                    'email' => $doctor->email ?? $doctor->user->email,
                    'phone' => $doctor->phone,
                    'specialization' => $doctor->specialization ? $doctor->specialization->name : 'General',
                    'specialization_id' => $doctor->specialization_id,
                    'experience_years' => $doctor->experience_years,
                    'consultation_fee' => $doctor->consultation_fee,
                    'clinic_name' => $doctor->clinic_name,
                    'branch' => $doctor->branch,
                    'address' => $doctor->address,
                    'bio' => $doctor->bio,
                    'image' => $doctor->image,
                    'image_url' => $imageUrl,
                    'avatar' => $imageUrl,
                    'operating_hours' => $doctor->operating_hours,
                    'services_count' => $doctor->services()->count(),
                    'is_available' => $doctor->status ?? true,
                ];
            });

            return response()->json($formattedDoctors);

        } catch (\Exception $e) {
            \Log::error('Get doctors error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error fetching doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific doctor's services
     */
    public function getDoctorServices(Request $request, $doctorId)
    {
        try {
            $doctor = Doctor::with(['user', 'specialization'])->find($doctorId);

            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor not found'
                ], 404);
            }

            $services = Service::where('doctor_id', $doctorId)
                ->where('is_active', true)
                ->get()
                ->map(function($service) use ($doctor) {
                    return [
                        'id' => $service->id,
                        'name' => $service->name,
                        'description' => $service->description,
                        'price' => $service->price,
                        'formatted_price' => '$' . number_format($service->price, 2),
                        'duration' => $service->duration,
                        'doctor_id' => $service->doctor_id,
                        'doctor_name' => $doctor->user->name ?? $doctor->first_name . ' ' . $doctor->last_name,
                        'is_active' => $service->is_active,
                    ];
                });

            return response()->json([
                'doctor' => [
                    'id' => $doctor->id,
                    'name' => $doctor->user->name ?? $doctor->first_name . ' ' . $doctor->last_name,
                    'specialization' => $doctor->specialization ? $doctor->specialization->name : 'General',
                    'clinic_name' => $doctor->clinic_name,
                    'address' => $doctor->address,
                    'consultation_fee' => $doctor->consultation_fee,
                ],
                'services' => $services
            ]);

        } catch (\Exception $e) {
            \Log::error('Get doctor services error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching doctor services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient health metrics
     */
    public function healthMetrics(Request $request)
    {
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
     * Get patient notifications (real data — appointment reschedules,
     * etc — ordered newest first).
     */
    public function notifications(Request $request)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json([]);
            }

            $notifications = Notification::where('patient_id', $patient->id)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            return response()->json($notifications->map(function ($n) {
                return [
                    'id' => $n->id,
                    'message' => $n->message,
                    'type' => $n->type,
                    'time' => $n->created_at->diffForHumans(),
                    'read' => $n->read_at !== null,
                    'booking_id' => $n->booking_id,
                ];
            }));

        } catch (\Exception $e) {
            \Log::error('Notifications fetch error: ' . $e->getMessage());
            return response()->json([]);
        }
    }

    /**
     * Mark a single notification as read.
     */
    public function markNotificationRead(Request $request, $id)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient profile not found'], 404);
            }

            $notification = Notification::where('patient_id', $patient->id)->find($id);

            if (!$notification) {
                return response()->json(['message' => 'Notification not found'], 404);
            }

            if (!$notification->read_at) {
                $notification->update(['read_at' => now()]);
            }

            return response()->json(['message' => 'Notification marked as read']);

        } catch (\Exception $e) {
            \Log::error('Mark notification read error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error marking notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all of the patient's notifications as read.
     */
    public function markAllNotificationsRead(Request $request)
    {
        try {
            $patient = Patient::where('user_id', Auth::id())->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient profile not found'], 404);
            }

            Notification::where('patient_id', $patient->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json(['message' => 'All notifications marked as read']);

        } catch (\Exception $e) {
            \Log::error('Mark all notifications read error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error marking notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient visits
     */
    public function visits(Request $request)
    {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient) {
            return response()->json([
                'future' => [],
                'past' => [],
                'treatments' => []
            ]);
        }

        $bookings = Booking::where('patient_id', $patient->id)
            ->with(['service', 'service.doctor.user'])
            ->get();

        return response()->json([
            'future' => $bookings->whereIn('status', ['pending', 'confirmed'])
                ->where('date', '>=', date('Y-m-d'))
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'date' => $booking->date . ' ' . $booking->time,
                        'service' => $booking->service->name ?? 'N/A',
                        'doctor' => $booking->service->doctor->user->name ?? 'N/A',
                        'status' => ucfirst($booking->status),
                    ];
                })->values(),
            'past' => $bookings->whereIn('status', ['completed', 'cancelled'])
                ->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'date' => $booking->date . ' ' . $booking->time,
                        'service' => $booking->service->name ?? 'N/A',
                        'doctor' => $booking->service->doctor->user->name ?? 'N/A',
                        'status' => ucfirst($booking->status),
                    ];
                })->values(),
            'treatments' => []
        ]);
    }

    /**
     * Add a new visit
     */
    public function addVisit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|string',
            'service' => 'required|string|max:255',
            'doctor' => 'required|string|max:255',
            'status' => 'required|string|in:Scheduled,Pending,Confirmed,Completed,In Progress',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $visit = [
            'id' => rand(100, 999),
            'date' => $request->date,
            'service' => $request->service,
            'doctor' => $request->doctor,
            'status' => $request->status,
        ];

        return response()->json($visit, 201);
    }

    /**
     * Delete a visit
     */
    public function deleteVisit($id)
    {
        return response()->json(['message' => 'Visit deleted successfully']);
    }

    /**
     * Get patient files
     */
    public function files(Request $request)
    {
        return response()->json([]);
    }

    /**
     * Add a new file
     */
    public function addFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'size' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = [
            'id' => rand(100, 999),
            'name' => $request->name,
            'size' => $request->size ?? 'N/A',
        ];

        return response()->json($file, 201);
    }

    /**
     * Delete a file
     */
    public function deleteFile($id)
    {
        return response()->json(['message' => 'File deleted successfully']);
    }

    /**
     * Get patient notes
     */
    public function notes(Request $request)
    {
        return response()->json([]);
    }

    /**
     * Add a new note
     */
    public function addNote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'size' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $note = [
            'id' => rand(100, 999),
            'name' => $request->name,
            'size' => $request->size ?? 'N/A',
        ];

        return response()->json($note, 201);
    }

    /**
     * Delete a note
     */
    public function deleteNote($id)
    {
        return response()->json(['message' => 'Note deleted successfully']);
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