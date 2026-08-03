<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
  public function profile(Request $request)
{
    try {
        $user = $request->user();
        $doctor = $user->doctor()->with('specialization')->firstOrFail();
        
        // Debug - check if image exists
        if ($doctor->image) {
            $exists = Storage::disk('public')->exists($doctor->image);
            \Log::info('Image check:', [
                'path' => $doctor->image,
                'exists' => $exists,
                'url' => $doctor->image_url
            ]);
        }
        
        return response()->json($doctor);

    } catch (\Exception $e) {
        \Log::error('Profile fetch error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching profile'
        ], 500);
    }
}
    /**
     * Update the doctor's profile
     */
    /**
 * Update the doctor's profile
 */
public function updateProfile(Request $request)
{
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'message' => 'Doctor profile not found'
            ], 404);
        }

        // Log the incoming request data for debugging
        \Log::info('Doctor profile update request:', $request->all());

        // Make all fields nullable to accept empty values
        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'experience_years' => 'nullable|integer|min:0|max:50',
            'consultation_fee' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'specialization_id' => 'nullable|exists:specializations,id',
            'status' => 'nullable|boolean',
            'clinic_name' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'operating_hours' => 'nullable|string|max:100',
        ]);

        \Log::info('Validated data:', $validated);

        // Filter out null or empty string values
        $filteredData = array_filter($validated, function ($value) {
            return $value !== null && $value !== '';
        });

        \Log::info('Filtered data:', $filteredData);

        // Handle image upload if provided (separate from validation)
        if ($request->hasFile('image')) {
            if ($doctor->image && Storage::disk('public')->exists($doctor->image)) {
                Storage::disk('public')->delete($doctor->image);
            }
            
            $path = $request->file('image')->store('doctor-images', 'public');
            $filteredData['image'] = $path;
        }

        // Update user email if provided
        if (isset($filteredData['email'])) {
            $user->update(['email' => $filteredData['email']]);
            unset($filteredData['email']);
        }

        // Update user name if provided
        if (isset($filteredData['first_name']) || isset($filteredData['last_name'])) {
            $firstName = $filteredData['first_name'] ?? $doctor->first_name;
            $lastName = $filteredData['last_name'] ?? $doctor->last_name;
            $fullName = trim($firstName . ' ' . $lastName);
            $user->update(['name' => $fullName]);
        }

        // Update doctor profile with filtered data
        if (!empty($filteredData)) {
            \Log::info('Updating doctor with data:', $filteredData);
            $doctor->update($filteredData);
        }

        // Refresh the doctor model
        $doctor->refresh();
        $doctor->load('specialization');

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $doctor
        ]);

    } catch (ValidationException $e) {
        \Log::error('Validation error: ' . json_encode($e->errors()));
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Profile update error: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'message' => 'Error updating profile',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString() // This will help debug
        ], 500);
    }
}

    /**
     * Update the doctor's password
     */
    public function updatePassword(Request $request)
    {
        try {
            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'The current password is incorrect.'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'message' => 'Password updated successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Password update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the doctor's clinic information
     */
    public function updateClinic(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor profile not found'
                ], 404);
            }

            $validated = $request->validate([
                'clinic_name' => 'nullable|string|max:255',
                'branch' => 'nullable|string|max:255',
                'operating_hours' => 'nullable|string|max:100',
                'address' => 'nullable|string|max:500',
                'consultation_fee' => 'nullable|numeric|min:0',
                'status' => 'sometimes|boolean',
            ]);

            $doctor->update($validated);

            return response()->json([
                'message' => 'Clinic settings updated successfully',
                'data' => $doctor
            ]);

        } catch (\Exception $e) {
            \Log::error('Clinic update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating clinic settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the doctor's statistics
     */
    public function getStats(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor profile not found'
                ], 404);
            }

            $stats = [
                'total_appointments' => $doctor->appointments()->count(),
                'upcoming_appointments' => $doctor->appointments()
                    ->where('appointment_date', '>=', now()->toDateString())
                    ->where('status', 'confirmed')
                    ->count(),
                'pending_appointments' => $doctor->appointments()
                    ->where('status', 'pending')
                    ->count(),
                'total_patients' => $doctor->appointments()
                    ->distinct('patient_id')
                    ->count('patient_id'),
                'completed_appointments' => $doctor->appointments()
                    ->where('status', 'completed')
                    ->count(),
                'experience_years' => $doctor->experience_years ?? 0,
                'consultation_fee' => $doctor->consultation_fee ?? 0,
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            \Log::error('Stats error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

/**
 * Get the doctor's patients
 */
public function getPatients(Request $request)
{
    try {
        $doctor = $request->user()->doctor;
        
        if (!$doctor) {
            return response()->json([
                'message' => 'Doctor profile not found'
            ], 404);
        }

        $patients = $doctor->appointments()
            ->with('patient.user')
            ->whereNotNull('patient_id')
            ->get()
            ->groupBy('patient_id')
            ->map(function($appointments, $patientId) {
                $patient = $appointments->first()->patient;
                $user = $patient->user;
                
                // Get patient image URL or generate UI Avatar
                $imageUrl = null;
if ($patient->photo) {
    $imageUrl = asset('storage/' . $patient->photo);
} else {
                    // Generate UI Avatar if no image exists
                    $name = $user->name ?? 'Patient';
                    $imageUrl = 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=random&size=128&bold=true';
                }
                
                return [
                    'id' => $patient->id,
                    'user_id' => $user->id ?? null,
                    'name' => $user->name ?? 'Unknown',
                    'email' => $user->email ?? '',
                    'phone' => $patient->phone ?? '',
                    'date_of_birth' => $patient->date_of_birth ?? null,
                    'image_url' => $imageUrl,
                    'avatar' => $imageUrl,
                    'photo_url' => $imageUrl,
                    'total_visits' => $appointments->count(),
                    'last_visit' => $appointments->sortByDesc('appointment_date')->first()->appointment_date ?? null,
                    'first_visit' => $appointments->sortBy('appointment_date')->first()->appointment_date ?? null,
                ];
            })
            ->values();

        return response()->json($patients);

    } catch (\Exception $e) {
        \Log::error('Patients fetch error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching patients',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
 * Upload doctor image
 */
public function uploadImage(Request $request)
{
    try {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return response()->json([
                'message' => 'Doctor profile not found'
            ], 404);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($doctor->image && Storage::disk('public')->exists($doctor->image)) {
            Storage::disk('public')->delete($doctor->image);
        }

        $path = $request->file('image')->store('doctor-images', 'public');
        $doctor->update(['image' => $path]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'image_url' => Storage::url($path)
        ]);

    } catch (\Exception $e) {
        \Log::error('Image upload error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error uploading image',
            'error' => $e->getMessage()
        ], 500);
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
            return response()->json([
                'message' => 'Doctor profile not found'
            ], 404);
        }

        if ($doctor->image && Storage::disk('public')->exists($doctor->image)) {
            Storage::disk('public')->delete($doctor->image);
            $doctor->update(['image' => null]);
        }

        return response()->json([
            'message' => 'Image deleted successfully'
        ]);

    } catch (\Exception $e) {
        \Log::error('Image delete error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error deleting image',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Update notification preferences
     */
    public function updateNotifications(Request $request)
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'appointment_requests' => 'boolean',
                'appointment_reminders' => 'boolean',
                'patient_messages' => 'boolean',
                'payment_updates' => 'boolean',
                'clinic_announcements' => 'boolean',
            ]);

            // Check if column exists
            if (Schema::hasColumn('users', 'notification_preferences')) {
                $user->update([
                    'notification_preferences' => $validated
                ]);
            }

            return response()->json([
                'message' => 'Notification preferences updated successfully',
                'data' => $validated
            ]);

        } catch (\Exception $e) {
            \Log::error('Notification update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating notifications',
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
            $user = $request->user();
            
            $defaults = [
                'appointment_requests' => true,
                'appointment_reminders' => true,
                'patient_messages' => true,
                'payment_updates' => true,
                'clinic_announcements' => true,
            ];

            $preferences = $user->notification_preferences ?? $defaults;

            return response()->json($preferences);

        } catch (\Exception $e) {
            \Log::error('Notification fetch error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get doctor's availability status
     */
    public function getAvailability(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor profile not found'
                ], 404);
            }

            return response()->json([
                'status' => $doctor->status ?? true,
                'is_available' => (bool) ($doctor->status ?? true)
            ]);

        } catch (\Exception $e) {
            \Log::error('Availability fetch error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update doctor's availability
     */
    public function updateAvailability(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;
            
            if (!$doctor) {
                return response()->json([
                    'message' => 'Doctor profile not found'
                ], 404);
            }

            $validated = $request->validate([
                'status' => 'required|boolean'
            ]);

            $doctor->update($validated);

            return response()->json([
                'message' => 'Availability updated successfully',
                'data' => $doctor
            ]);

        } catch (\Exception $e) {
            \Log::error('Availability update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error updating availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}