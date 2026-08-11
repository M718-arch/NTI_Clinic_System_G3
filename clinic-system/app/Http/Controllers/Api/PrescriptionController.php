<?php
// app/Http/Controllers/Api/PrescriptionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $prescriptions = Prescription::where('doctor_id', $doctor->id)
                ->with(['patient.user'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($prescriptions);

        } catch (\Exception $e) {
            Log::error('Prescriptions index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching prescriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request, Patient $patient)
    {
        try {
            $doctor = $request->user()->doctor;

            if (!$doctor) {
                return response()->json(['message' => 'Doctor profile not found'], 404);
            }

            $validated = $request->validate([
                'medicine' => 'required|string|max:255',
                'dose' => 'nullable|string|max:100',  // Made nullable
                'frequency' => 'nullable|string|max:100',  // Made nullable
                'duration' => 'nullable|string|max:100',  // Made nullable
                'notes' => 'nullable|string|max:500',
                'booking_id' => 'nullable|exists:bookings,id',
            ]);

            // Check if prescribed_date column exists
            $hasPrescribedDate = Schema::hasColumn('prescriptions', 'prescribed_date');

            $prescriptionData = [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'medicine' => $validated['medicine'],
                'dose' => $validated['dose'] ?? null,
                'frequency' => $validated['frequency'] ?? null,
                'duration' => $validated['duration'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'booking_id' => $validated['booking_id'] ?? null,
            ];

            // Only add prescribed_date if the column exists
            if ($hasPrescribedDate) {
                $prescriptionData['prescribed_date'] = now();
            }

            $prescription = Prescription::create($prescriptionData);

            // Send notification if Notification model exists
            if (class_exists(Notification::class)) {
                try {
                    Notification::create([
                        'patient_id' => $patient->id,
                        'type' => 'prescription_ready',
                        'message' => "Your prescription for {$validated['medicine']} is ready.",
                    ]);
                } catch (\Exception $e) {
                    // Notification failed but prescription was created
                    Log::warning('Failed to create notification: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Prescription created successfully',
                'data' => $prescription
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Store prescription error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating prescription: ' . $e->getMessage(),
            ], 500);
        }
    }
}