<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\Notification;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Prescriptions this doctor has written. Optional ?patient_id= filter.
     */
    public function index(Request $request)
    {
        $doctor = $request->user()->doctor;
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $query = Prescription::where('doctor_id', $doctor->id)
            ->with('patient.user')
            ->orderBy('prescribed_date', 'desc');

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request, Patient $patient)
    {
        $doctor = $request->user()->doctor;
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'medicine' => 'required|string|max:255',
            'dose' => 'nullable|string|max:100',
            'frequency' => 'nullable|string|max:100',
            'duration' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $prescription = Prescription::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'medicine' => $validated['medicine'],
            'dose' => $validated['dose'] ?? null,
            'frequency' => $validated['frequency'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'prescribed_date' => now()->toDateString(),
        ]);

        // "Prescription Ready" — one of the five notification types the
        // roadmap lists.
        Notification::create([
            'patient_id' => $patient->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'type' => 'prescription_ready',
            'message' => "Your prescription for {$prescription->medicine} is ready.",
        ]);

        return response()->json(['message' => 'Prescription created', 'data' => $prescription], 201);
    }
}
