<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Service;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\Diagnosis;
use App\Models\LabResult;
use App\Models\RadiologyResult;
use App\Models\Prescription;


class PatientController extends Controller
{
    // ============================================================
    // PATIENT SIDE - Profile & Dashboard
    // ============================================================

    /**
     * Get patient profile data
     */
    public function profile(Request $request)
    {
        $user = Auth::user();
        $patient = Patient::where('user_id', $user->id)->first();

        $photoUrl = null;
        if ($patient && $patient->photo && Storage::disk('public')->exists($patient->photo)) {
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
 * List the authenticated patient's invoices — doubles as their payment
 * history view (each row already carries status + date).
 */
public function invoices(Request $request)
{
    try {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient) {
            return response()->json([]);
        }

        $invoices = Invoice::where('patient_id', $patient->id)
            ->with(['doctor.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'doctor_name' => $invoice->doctor->full_name ?? ($invoice->doctor->user->name ?? null),
                    'service_name' => $invoice->service_name,
                    'amount' => $invoice->formatted_amount,
                    'status' => $invoice->status,
                    'date' => $invoice->created_at->format('M j, Y'),
                    'paid_at' => $invoice->paid_at?->format('M j, Y'),
                ];
            });

        return response()->json($invoices);

    } catch (\Exception $e) {
        \Log::error('Patient invoices fetch error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching invoices',
            'error' => $e->getMessage()
        ], 500);
    }
}
/**
 * Get the patient's complete EMR (Electronic Medical Record)
 * Includes: diagnoses, lab results, radiology results, and prescriptions
 */
public function emr(Request $request)
{
    try {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        // Get all EMR data for this patient
        $diagnoses = Diagnosis::where('patient_id', $patient->id)
            ->with(['doctor.user'])
            ->orderBy('diagnosed_at', 'desc')
            ->get();

        $labResults = LabResult::where('patient_id', $patient->id)
            ->with(['doctor.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $radiologyResults = RadiologyResult::where('patient_id', $patient->id)
            ->with(['doctor.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->with(['doctor.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'diagnoses' => $diagnoses->map(function ($d) {
                return [
                    'id' => $d->id,
                    'condition' => $d->condition,
                    'icd_code' => $d->icd_code,
                    'diagnosed_at' => $d->diagnosed_at?->format('Y-m-d'),
                    'notes' => $d->notes,
                    'doctor_name' => $d->doctor->user->name ?? 'N/A',
                ];
            }),
            'lab_results' => $labResults->map(function ($lab) {
                return [
                    'id' => $lab->id,
                    'test_name' => $lab->test_name,
                    'result' => $lab->result,
                    'reference_range' => $lab->reference_range,
                    'interpretation' => $lab->interpretation,
                    'performed_at' => $lab->performed_at?->format('Y-m-d'),
                    'file_path' => $lab->file_path,
                    'doctor_name' => $lab->doctor->user->name ?? 'N/A',
                ];
            }),
            'radiology_results' => $radiologyResults->map(function ($rad) {
                return [
                    'id' => $rad->id,
                    'study_type' => $rad->study_type,
                    'findings' => $rad->findings,
                    'impression' => $rad->impression,
                    'performed_at' => $rad->performed_at?->format('Y-m-d'),
                    'file_path' => $rad->file_path,
                    'doctor_name' => $rad->doctor->user->name ?? 'N/A',
                ];
            }),
            'prescriptions' => $prescriptions->map(function ($p) {
                return [
                    'id' => $p->id,
                    'medicine' => $p->medicine,
                    'dose' => $p->dose,
                    'frequency' => $p->frequency,
                    'duration' => $p->duration,
                    'notes' => $p->notes,
                    'prescribed_at' => $p->created_at->format('Y-m-d'),
                    'doctor_name' => $p->doctor->user->name ?? 'N/A',
                ];
            }),
        ]);

    } catch (\Exception $e) {
        \Log::error('EMR fetch error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching EMR data',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get the patient's prescriptions (payment history-like view)
 */
public function prescriptions(Request $request)
{
    try {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient) {
            return response()->json([]);
        }

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->with(['doctor.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($prescription) {
                return [
                    'id' => $prescription->id,
                    'medicine' => $prescription->medicine,
                    'dose' => $prescription->dose,
                    'frequency' => $prescription->frequency,
                    'duration' => $prescription->duration,
                    'notes' => $prescription->notes,
                    'prescribed_at' => $prescription->created_at->format('M j, Y'),
                    'doctor_name' => $prescription->doctor->user->name ?? 'N/A',
                ];
            });

        return response()->json($prescriptions);

    } catch (\Exception $e) {
        \Log::error('Prescriptions fetch error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching prescriptions',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get a single prescription detail
 */
public function prescriptionDetail(Request $request, Prescription $prescription)
{
    try {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient || $prescription->patient_id !== $patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $prescription->load(['doctor.user']);

        return response()->json([
            'id' => $prescription->id,
            'medicine' => $prescription->medicine,
            'dose' => $prescription->dose,
            'frequency' => $prescription->frequency,
            'duration' => $prescription->duration,
            'notes' => $prescription->notes,
            'prescribed_at' => $prescription->created_at->format('F j, Y'),
            'doctor_name' => $prescription->doctor->user->name ?? 'N/A',
            'doctor_id' => $prescription->doctor_id,
            'patient_name' => $prescription->patient->user->name ?? 'N/A',
        ]);

    } catch (\Exception $e) {
        \Log::error('Prescription detail error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching prescription',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * A single invoice's detail — the data a "View Invoice" /
 * "Download Invoice" screen renders (and the browser can print to PDF).
 */
public function invoiceDetail(Request $request, Invoice $invoice)
{
    try {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient || $invoice->patient_id !== $patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoice->load(['doctor.user', 'booking']);

        return response()->json([
            'invoice_number' => $invoice->invoice_number,
            'date' => $invoice->created_at->format('M j, Y'),
            'doctor_name' => $invoice->doctor->full_name ?? ($invoice->doctor->user->name ?? null),
            'service_name' => $invoice->service_name,
            'amount' => $invoice->formatted_amount,
            'status' => $invoice->status,
            'paid_at' => $invoice->paid_at?->format('M j, Y g:i A'),
            'payment_method' => $invoice->payment_method,
        ]);

    } catch (\Exception $e) {
        \Log::error('Patient invoice detail error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching invoice',
            'error' => $e->getMessage()
        ], 500);
    }
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

            if ($patient->photo) {
                Storage::disk('public')->delete($patient->photo);
            }

            $path = $request->file('photo')->store('patient-photos', 'public');
            $patient->update(['photo' => $path]);
            $patient->refresh();

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
            $doctors = Doctor::with(['user', 'specialization'])
                ->where('status', true)
                ->get();

            $formattedDoctors = $doctors->map(function($doctor) {
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
                return response()->json(['message' => 'Doctor not found'], 404);
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
     * Get patient notifications
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

    // ============================================================
    // RECEPTIONIST SIDE - Patient Management
    // ============================================================

    /**
     * List patients with optional approval status filter
     */
    public function index(Request $request)
    {
        $query = Patient::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        return response()->json($query->get());
    }

    /**
     * Patients awaiting review — the receptionist dashboard's
     * "Pending Patient Registrations" queue.
     */
    public function pending()
    {
        return response()->json(
            Patient::with('user')->pending()->orderBy('created_at', 'asc')->get()
        );
    }

    /**
     * Search patients by name, email, or phone.
     */
    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:1']);
        $term = $request->q;

        $patients = Patient::with('user')
            ->whereHas('user', function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%");
            })
            ->orWhere('phone', 'like', "%{$term}%")
            ->get();

        return response()->json($patients);
    }

    /**
     * Get a specific patient
     */
    public function show(Patient $patient)
    {
        return response()->json($patient->load('user'));
    }

    /**
     * Approve a pending registration.
     */
    public function approve(Request $request, Patient $patient)
    {
        if ($patient->approval_status === 'approved') {
            return response()->json(['message' => 'Patient is already approved'], 400);
        }

        $patient->update([
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => 'Patient approved successfully',
            'data' => $patient->fresh()->load('user')
        ]);
    }

    /**
     * Reject a pending registration.
     */
    public function reject(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        if ($patient->approval_status === 'rejected') {
            return response()->json(['message' => 'Patient is already rejected'], 400);
        }

        $patient->update([
            'approval_status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Patient registration rejected',
            'data' => $patient->fresh()->load('user')
        ]);
    }

    /**
     * Register a walk-in patient.
     */
    public function registerWalkIn(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'nullable|date',
            'blood_group' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'allergies' => 'nullable|string|max:500',
            'chronic_diseases' => 'nullable|string|max:500',
            'medical_history' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $password = $validated['password'] ?? bin2hex(random_bytes(8));

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($password),
                'role' => 'patient',
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'phone' => $validated['phone'] ?? null,
                'gender' => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'blood_group' => $validated['blood_group'] ?? null,
                'address' => $validated['address'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'allergies' => $validated['allergies'] ?? 'None',
                'chronic_diseases' => $validated['chronic_diseases'] ?? 'None',
                'medical_history' => $validated['medical_history'] ?? 'None',
                'status' => true,
                'approval_status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Walk-in patient registered successfully',
                'patient' => $patient->load('user'),
                'generated_password' => isset($validated['password']) ? null : $password,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to register walk-in patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Edit patient details.
     */
    public function updatePatient(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $patient->user_id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            'blood_group' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'status' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            if (isset($validated['name']) || isset($validated['email'])) {
                $patient->user->update([
                    'name' => $validated['name'] ?? $patient->user->name,
                    'email' => $validated['email'] ?? $patient->user->email,
                ]);
            }

            $patient->update(collect($validated)
                ->except(['name', 'email'])
                ->toArray());

            DB::commit();

            return response()->json([
                'message' => 'Patient updated successfully',
                'patient' => $patient->fresh()->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}