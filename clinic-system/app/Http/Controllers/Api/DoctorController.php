<?php
// app/Http/Controllers/Api/DoctorController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Service;
use App\Models\Availability;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DoctorController extends Controller
{
    /**
     * Get doctor profile
     */
    public function profile(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            return response()->json($doctor);
        } catch (\Exception $e) {
            Log::error('Get profile error: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching profile'], 500);
        }
    }

    /**
     * Update doctor profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'specialization' => 'nullable|string|max:255',
                'bio' => 'nullable|string',
                'clinic_name' => 'nullable|string|max:255',
                'clinic_address' => 'nullable|string|max:500',
                'clinic_phone' => 'nullable|string|max:20',
            ]);

            $doctor->update($validated);

            return response()->json([
                'message' => 'Profile updated successfully',
                'data' => $doctor
            ]);
        } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating profile'], 500);
        }
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $user = $request->user();

            if (!\Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }

            $user->update([
                'password' => \Hash::make($validated['new_password'])
            ]);

            return response()->json(['message' => 'Password updated successfully']);
        } catch (\Exception $e) {
            Log::error('Update password error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating password'], 500);
        }
    }

    /**
     * Update clinic settings
     */
    public function updateClinic(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'clinic_name' => 'nullable|string|max:255',
                'clinic_address' => 'nullable|string|max:500',
                'clinic_phone' => 'nullable|string|max:20',
            ]);

            $doctor->update($validated);

            return response()->json([
                'message' => 'Clinic updated successfully',
                'data' => $doctor
            ]);
        } catch (\Exception $e) {
            Log::error('Update clinic error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating clinic'], 500);
        }
    }

    /**
     * Upload doctor image
     */
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|max:2048'
            ]);

            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            // Delete old image if exists
            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
            }

            $path = $request->file('image')->store('doctor-images', 'public');
            $doctor->update(['photo' => $path]);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'photo_url' => asset('storage/' . $path)
            ]);
        } catch (\Exception $e) {
            Log::error('Upload image error: ' . $e->getMessage());
            return response()->json(['message' => 'Error uploading image'], 500);
        }
    }

    /**
     * Delete doctor image
     */
    public function deleteImage(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
                $doctor->update(['photo' => null]);
            }

            return response()->json(['message' => 'Image deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Delete image error: ' . $e->getMessage());
            return response()->json(['message' => 'Error deleting image'], 500);
        }
    }

    /**
     * Get doctor availability
     */
    public function getAvailability(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $availability = Availability::where('doctor_id', $doctor->id)->get();

            return response()->json($availability);
        } catch (\Exception $e) {
            Log::error('Get availability error: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching availability'], 500);
        }
    }

    /**
     * Update doctor availability
     */
    public function updateAvailability(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'availability' => 'required|array',
                'availability.*.day' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'availability.*.start_time' => 'required|string',
                'availability.*.end_time' => 'required|string',
                'availability.*.is_available' => 'boolean',
            ]);

            // Delete existing availability
            Availability::where('doctor_id', $doctor->id)->delete();

            // Create new availability
            foreach ($validated['availability'] as $slot) {
                Availability::create([
                    'doctor_id' => $doctor->id,
                    'day' => $slot['day'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'is_available' => $slot['is_available'] ?? true,
                ]);
            }

            return response()->json([
                'message' => 'Availability updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Update availability error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating availability'], 500);
        }
    }

    /**
     * Get doctor statistics
     */
    public function getStats(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $totalPatients = Patient::whereHas('bookings', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })->count();

            $totalBookings = Booking::where('doctor_id', $doctor->id)->count();
            $pendingBookings = Booking::where('doctor_id', $doctor->id)
                ->where('status', 'pending')
                ->count();
            $completedBookings = Booking::where('doctor_id', $doctor->id)
                ->where('status', 'completed')
                ->count();

            return response()->json([
                'total_patients' => $totalPatients,
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'completed_bookings' => $completedBookings,
            ]);
        } catch (\Exception $e) {
            Log::error('Get stats error: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching stats'], 500);
        }
    }

    /**
     * Get patients list for doctor
     */
    public function getPatients(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            // Get patients who have appointments with this doctor
            $patients = Patient::whereHas('bookings', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })
            ->with(['user'])
            ->get()
            ->map(function ($patient) {
                // Get visit counts
                $visits = Booking::where('patient_id', $patient->id)
                    ->where('status', 'completed')
                    ->count();
                
                $lastVisit = Booking::where('patient_id', $patient->id)
                    ->where('status', 'completed')
                    ->latest('date')
                    ->first();

                return [
                    'id' => $patient->id,
                    'name' => $patient->user?->name,
                    'email' => $patient->user?->email,
                    'phone' => $patient->phone,
                    'photo' => $patient->photo,
                    'photo_url' => $patient->photo_url,
                    'date_of_birth' => $patient->date_of_birth,
                    'gender' => $patient->gender,
                    'address' => $patient->address,
                    'total_visits' => $visits,
                    'last_visit' => $lastVisit?->date,
                    'status' => $visits > 0 ? 'active' : 'new',
                ];
            });

            return response()->json($patients);
        } catch (\Exception $e) {
            Log::error('Get patients error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient details for doctor view
     */
    public function getPatientDetails($patientId)
    {
        try {
            $patient = Patient::with(['user'])->findOrFail($patientId);
            
            $visits = Booking::where('patient_id', $patient->id)
                ->where('status', 'completed')
                ->count();
            
            $lastVisit = Booking::where('patient_id', $patient->id)
                ->where('status', 'completed')
                ->latest('date')
                ->first();

            return response()->json([
                'id' => $patient->id,
                'name' => $patient->user?->name,
                'email' => $patient->user?->email,
                'phone' => $patient->phone,
                'photo' => $patient->photo,
                'photo_url' => $patient->photo_url,
                'date_of_birth' => $patient->date_of_birth,
                'gender' => $patient->gender,
                'address' => $patient->address,
                'blood_group' => $patient->blood_group,
                'allergies' => $patient->allergies,
                'chronic_diseases' => $patient->chronic_diseases,
                'emergency_contact' => $patient->emergency_contact,
                'medical_history' => $patient->medical_history,
                'diagnoses' => $patient->diagnoses,
                'family_history' => $patient->family_history,
                'past_surgeries' => $patient->past_surgeries,
                'total_visits' => $visits,
                'last_visit' => $lastVisit?->date,
                'user' => $patient->user,
            ]);
        } catch (\Exception $e) {
            Log::error('Get patient details error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Patient not found'
            ], 404);
        }
    }

    /**
     * Get patient statistics
     */
    public function getPatientStats(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $totalPatients = Patient::whereHas('bookings', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })->count();

            $newPatients = Patient::whereHas('bookings', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id)
                      ->where('created_at', '>=', now()->subDays(30));
            })->count();

            $activePatients = Patient::whereHas('bookings', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id)
                      ->where('status', 'completed')
                      ->where('date', '>=', now()->subDays(90));
            })->count();

            return response()->json([
                'total' => $totalPatients,
                'newConsultations' => $newPatients,
                'activeTreatments' => $activePatients,
            ]);
        } catch (\Exception $e) {
            Log::error('Get patient stats error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching patient stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notification preferences
     */
    public function getNotificationPreferences(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            return response()->json([
                'email_notifications' => $doctor->email_notifications ?? true,
                'sms_notifications' => $doctor->sms_notifications ?? false,
                'app_notifications' => $doctor->app_notifications ?? true,
            ]);
        } catch (\Exception $e) {
            Log::error('Get notification preferences error: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching preferences'], 500);
        }
    }

    /**
     * Update notification preferences
     */
    public function updateNotifications(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'email_notifications' => 'boolean',
                'sms_notifications' => 'boolean',
                'app_notifications' => 'boolean',
            ]);

            $doctor->update($validated);

            return response()->json([
                'message' => 'Notification preferences updated successfully',
                'data' => $doctor
            ]);
        } catch (\Exception $e) {
            Log::error('Update notifications error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating preferences'], 500);
        }
    }

    /**
     * Get invoices for doctor
     */
    public function getInvoices(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $invoices = Invoice::where('doctor_id', $doctor->id)
                ->with(['patient.user'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($invoices);
        } catch (\Exception $e) {
            Log::error('Get invoices error: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching invoices'], 500);
        }
    }
}